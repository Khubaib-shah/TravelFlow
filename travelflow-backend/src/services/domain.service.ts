import mongoose from "mongoose";
import {
  Lead,
  LeadActivity,
  Customer,
  Booking,
  Supplier,
  Expense,
  Branch,
  User,
  Role,
  CustomerNote,
  CustomerDocument,
  RecentActivity,
  Receipt,
  BookingDocument,
  BookingActivity,
} from "../models";
import { ApiError } from "../utils/ApiError";
import { generateRef } from "../utils/refGenerator";
import { buildIdOrRefFilter, toJSON, toJSONList } from "../utils/serialize";
import { countryForCity, normalizePhone, userDisplayName } from "../utils/helpers";
import * as notificationService from "./notification.service";
import type { z } from "zod";
import type {
  leadSchema,
  leadActivitySchema,
  customerSchema,
  bookingSchema,
  supplierSchema,
  expenseSchema,
  userSchema,
  convertLeadSchema,
} from "../validators/schemas";

type LeadInput = z.infer<typeof leadSchema>;
type LeadActivityInput = z.infer<typeof leadActivitySchema>;
type CustomerInput = z.infer<typeof customerSchema>;
type BookingInput = z.infer<typeof bookingSchema>;
type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
type SupplierInput = z.infer<typeof supplierSchema>;
type ExpenseInput = z.infer<typeof expenseSchema>;
type UserInput = z.infer<typeof userSchema>;

import type { branchSchema } from "../validators/schemas";
type BranchInput = z.infer<typeof branchSchema>;

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface DateFilterOptions {
  startDate?: string;
  endDate?: string;
}

export interface TenantContext {
  agencyId: string;
  branchId?: string;
  userRole?: string;
  userBranchId?: string;
  /** ID of the calling user — used for self-deletion and audit checks */
  callerId?: string;
  /** Role of the calling user — used for privilege escalation checks */
  callerRole?: string;
}

/**
 * Build a Mongoose filter that enforces tenant + branch isolation.
 *
 * Branch scoping rules:
 * - `admin` role: sees all branches by default. If `ctx.branchId` is set (explicit filter), it is applied.
 * - All other roles: scoped to their own branch (`ctx.userBranchId`). If the user has no branch assigned, throw.
 */
export function tenant(ctx: string | TenantContext) {
  if (typeof ctx === "string") {
    return { agencyId: new mongoose.Types.ObjectId(ctx), isDeleted: false };
  }
  const filter: Record<string, unknown> = { agencyId: new mongoose.Types.ObjectId(ctx.agencyId), isDeleted: false };

  if (ctx.userRole === "admin") {
    // Admin can optionally filter by a specific branch
    if (ctx.branchId && ctx.branchId !== "all") {
      filter.branchId = new mongoose.Types.ObjectId(ctx.branchId);
    }
  } else {
    // ALL non-admin roles are scoped to their own branch
    if (ctx.userBranchId) {
      filter.branchId = new mongoose.Types.ObjectId(ctx.userBranchId);
    }
    // If userBranchId is missing for a non-admin, we still scope by agencyId only
    // (the user simply hasn't been assigned to a branch yet — admin needs to fix this)
  }

  return filter;
}

async function getDefaultBranchId(agencyId: string): Promise<string> {
  const branch = await Branch.findOne({ agencyId, isDeleted: false, isHeadOffice: true });
  if (branch) return String(branch._id);
  const anyBranch = await Branch.findOne({ agencyId, isDeleted: false });
  if (!anyBranch) throw ApiError.badRequest("No branch configured for this agency");
  return String(anyBranch._id);
}

async function enrichLead(doc: unknown) {
  const json = toJSON(doc)!;
  const leadId = String(json.id);
  const activities = await LeadActivity.find({ leadId }).sort({ createdAt: -1 });
  return { ...json, activities: toJSONList(activities.map((a) => a.toObject())) };
}

async function enrichLeadsBatch(docs: any[]) {
  const jsons = docs.map((doc) => toJSON(doc)!);
  const leadIds = jsons.map((j) => String(j.id));

  const activities = await LeadActivity.find({ leadId: { $in: leadIds } }).sort({ createdAt: -1 });

  const activitiesMap = new Map();
  for (const act of activities) {
    const leadId = String(act.leadId);
    if (!activitiesMap.has(leadId)) {
      activitiesMap.set(leadId, []);
    }
    activitiesMap.get(leadId).push(act.toObject());
  }

  return jsons.map((json) => {
    return {
      ...json,
      activities: toJSONList(activitiesMap.get(json.id) || []),
    };
  });
}

async function enrichCustomer(doc: unknown, ctx: string | TenantContext) {
  const json = toJSON(doc)!;
  const customerId = json.id;
  const bookings = await Booking.find({ ...tenant(ctx), customerId });
  const totalSpent = bookings.reduce((sum, b) => sum + b.salePrice, 0);
  return {
    ...json,
    totalBookings: bookings.length,
    totalSpent,
    country: (json.country as string) ?? "Pakistan",
  };
}

async function enrichCustomersBatch(docs: any[], ctx: string | TenantContext) {
  const jsons = docs.map((doc) => toJSON(doc)!);
  const customerIds = jsons.map((j) => new mongoose.Types.ObjectId(j.id as string));

  const stats = await Booking.aggregate([
    { $match: { ...tenant(ctx), customerId: { $in: customerIds } } },
    { $group: { _id: "$customerId", totalBookings: { $sum: 1 }, totalSpent: { $sum: "$salePrice" } } }
  ]);

  const statsMap = new Map();
  for (const stat of stats) {
    statsMap.set(String(stat._id), stat);
  }

  return jsons.map((json) => {
    const stat = statsMap.get(String(json.id)) || { totalBookings: 0, totalSpent: 0 };
    return {
      ...json,
      totalBookings: stat.totalBookings,
      totalSpent: stat.totalSpent,
      country: (json.country as string) ?? "Pakistan",
    };
  });
}

async function enrichBooking(doc: unknown, ctx: string | TenantContext) {
  const json = toJSON(doc)!;
  const [customer, supplier, agent, branch] = await Promise.all([
    json.customerId ? Customer.findOne({ _id: json.customerId, ...tenant(ctx) }) : Promise.resolve(null),
    json.supplierId ? Supplier.findOne({ _id: json.supplierId, ...tenant(ctx) }) : Promise.resolve(null),
    json.agentId ? User.findOne({ _id: json.agentId, ...tenant(ctx) }) : Promise.resolve(null),
    json.branchId ? Branch.findOne({ _id: json.branchId, ...tenant(ctx) }) : Promise.resolve(null),
  ]);

  return {
    ...json,
    customer: customer ? toJSON(customer.toObject()) : undefined,
    supplier: supplier ? toJSON(supplier.toObject()) : undefined,
    agent: agent ? { id: agent._id.toString(), name: userDisplayName(agent) } : undefined,
    branch: branch ? { id: branch._id.toString(), name: branch.name } : undefined,
  };
}

function formatPopulatedBooking(doc: any) {
  const json = toJSON(doc)!;
  const c = doc.customerId;
  const s = doc.supplierId;
  const a = doc.agentId;
  const b = doc.branchId;

  return {
    ...json,
    customerId: c ? c._id.toString() : undefined,
    supplierId: s ? s._id.toString() : undefined,
    agentId: a ? a._id.toString() : undefined,
    branchId: b ? b._id.toString() : undefined,
    customer: c ? toJSON(c.toObject ? c.toObject() : c) : undefined,
    supplier: s ? toJSON(s.toObject ? s.toObject() : s) : undefined,
    agent: a ? { id: a._id.toString(), name: userDisplayName(a) } : undefined,
    branch: b ? { id: b._id.toString(), name: b.name } : undefined,
  };
}

// --- Dashboard ---

export function applyDateFilter(filter: any, dates?: DateFilterOptions, field: string = "createdAt") {
  if (dates?.startDate || dates?.endDate) {
    filter[field] = {};
    if (dates.startDate) filter[field].$gte = new Date(dates.startDate);
    if (dates.endDate) filter[field].$lte = new Date(dates.endDate);
  }
}

export async function getDashboardStats(ctx: TenantContext, dates?: DateFilterOptions) {
  const base = tenant(ctx);
  const now = new Date();
  
  let curStart: Date;
  let curEnd: Date;
  let prevStart: Date;
  let prevEnd: Date;

  if (dates?.startDate && dates?.endDate) {
    curStart = new Date(dates.startDate);
    curEnd = new Date(dates.endDate);
    const duration = curEnd.getTime() - curStart.getTime();
    prevStart = new Date(curStart.getTime() - duration - 1);
    prevEnd = new Date(curStart.getTime() - 1);
  } else {
    const month = now.getMonth();
    const year = now.getFullYear();
    curStart = new Date(year, month, 1);
    curEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
    prevStart = new Date(year, month - 1, 1);
    prevEnd = new Date(year, month, 0, 23, 59, 59, 999);
  }

  // Build sparkline range: last 7 months
  const sparklineStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const [
    leads,
    customers,
    currentBookings,
    currentExpenses,
    activities,
    prevMonthBookings,
    prevMonthExpenses,
    prevMonthLeads,
    prevMonthCustomers,
    monthlyBookingAgg,
    monthlyLeadAgg,
    monthlyCustomerAgg,
    monthlyExpenseAgg,
    branches,
    branchUserCounts,
  ] = await Promise.all([
    Lead.countDocuments({ ...base, createdAt: { $gte: curStart, $lte: curEnd } }),
    Customer.countDocuments({ ...base, createdAt: { $gte: curStart, $lte: curEnd } }),
    Booking.find({ ...base, createdAt: { $gte: curStart, $lte: curEnd } }),
    Expense.find({ ...base, date: { $gte: curStart, $lte: curEnd } }),
    RecentActivity.find({ agencyId: base.agencyId, ...(base.branchId ? { branchId: base.branchId } : {}), createdAt: { $gte: curStart, $lte: curEnd } })
      .sort({ createdAt: -1 })
      .limit(20),
    // Previous period data for trends
    Booking.find({ ...base, createdAt: { $gte: prevStart, $lte: prevEnd } }),
    Expense.find({ ...base, date: { $gte: prevStart, $lte: prevEnd } }),
    Lead.countDocuments({ ...base, createdAt: { $gte: prevStart, $lte: prevEnd } }),
    Customer.countDocuments({ ...base, createdAt: { $gte: prevStart, $lte: prevEnd } }),
    // Sparkline aggregations — last 7 months
    Booking.aggregate([
      { $match: { ...base, createdAt: { $gte: sparklineStart } } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, revenue: { $sum: "$salePrice" }, profit: { $sum: "$profit" }, count: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
    Lead.aggregate([
      { $match: { ...base, createdAt: { $gte: sparklineStart } } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
    Customer.aggregate([
      { $match: { ...base, createdAt: { $gte: sparklineStart } } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
    Expense.aggregate([
      { $match: { ...base, date: { $gte: sparklineStart } } },
      { $group: { _id: { y: { $year: "$date" }, m: { $month: "$date" } }, total: { $sum: "$amount" } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
    Branch.find(base),
    User.aggregate([
      { $match: base },
      { $group: { _id: "$branchId", count: { $sum: 1 } } }
    ]),
  ]);

  const curRevenue = currentBookings.reduce((s, b) => s + b.salePrice, 0);
  const curProfit = currentBookings.reduce((s, b) => s + b.profit, 0);
  const curExpenses = currentExpenses.reduce((s, e) => s + e.amount, 0);
  const curBookingCount = currentBookings.length;

  // Previous month calculations for trend %
  const prevRevenue = prevMonthBookings.reduce((s, b) => s + b.salePrice, 0);
  const prevProfit = prevMonthBookings.reduce((s, b) => s + b.profit, 0);
  const prevExpensesTotal = prevMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const prevBookingCount = prevMonthBookings.length;

  function trendPct(cur: number, prev: number): number {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return Number((((cur - prev) / prev) * 100).toFixed(1));
  }

  // Build sparkline arrays — fill in 0 for missing months
  function buildSparkline(agg: Array<{ _id: { y: number; m: number }; count?: number; revenue?: number; profit?: number; total?: number }>, field: string): number[] {
    const map = new Map<string, number>();
    for (const row of agg) {
      map.set(`${row._id.y}-${row._id.m}`, (row as Record<string, unknown>)[field] as number ?? 0);
    }
    const result: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      result.push(map.get(key) ?? 0);
    }
    return result;
  }

  const staffMap = new Map(branchUserCounts.map((u: any) => [String(u._id), u.count]));

  // Branch Performance
  const branchPerformance = branches.map((branch) => {
    const branchId = String(branch._id);
    const branchBookings = currentBookings.filter(b => String(b.branchId) === branchId);
    const branchPrevBookings = prevMonthBookings.filter(b => String(b.branchId) === branchId);
    const branchExpenses = currentExpenses.filter(e => String(e.branchId) === branchId);

    const revenue = branchBookings.reduce((s, b) => s + b.salePrice, 0);
    const profit = branchBookings.reduce((s, b) => s + b.profit, 0);
    const prevRevenue = branchPrevBookings.reduce((s, b) => s + b.salePrice, 0);
    const expensesTotal = branchExpenses.reduce((s, e) => s + e.amount, 0);

    return {
      name: branch.name,
      code: branch.code,
      revenue,
      profit,
      expenses: expensesTotal,
      staff: staffMap.get(branchId) || 0,
      growth: trendPct(revenue, prevRevenue),
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return {
    totalLeads: leads,
    totalCustomers: customers,
    monthlyRevenue: curRevenue,
    monthlyProfit: curProfit,
    totalExpenses: curExpenses,
    activeBookings: currentBookings.filter((b) => b.bookingStatus === "confirmed").length,
    trends: {
      leads: trendPct(leads, prevMonthLeads),
      customers: trendPct(customers, prevMonthCustomers),
      revenue: trendPct(curRevenue, prevRevenue),
      profit: trendPct(curProfit, prevProfit),
      expenses: trendPct(curExpenses, prevExpensesTotal),
      bookings: trendPct(curBookingCount, prevBookingCount),
    },
    sparklines: {
      leads: buildSparkline(monthlyLeadAgg, "count"),
      customers: buildSparkline(monthlyCustomerAgg, "count"),
      revenue: buildSparkline(monthlyBookingAgg, "revenue"),
      profit: buildSparkline(monthlyBookingAgg, "profit"),
      expenses: buildSparkline(monthlyExpenseAgg, "total"),
      bookings: buildSparkline(monthlyBookingAgg, "count"),
    },
    branchPerformance,
    recentActivities: activities.map((a) => ({
      id: a._id.toString(),
      type: a.type,
      title: a.title,
      detail: a.detail,
      time: a.createdAt,
    })),
  };
}

export async function getAnalyticsStats(ctx: TenantContext, timeRange: string) {
  const baseFilter = tenant(ctx);

  // Calculate date range
  const now = new Date();
  const startDate = new Date();
  if (timeRange === "30d") startDate.setDate(now.getDate() - 30);
  else if (timeRange === "6m") startDate.setMonth(now.getMonth() - 6);
  else if (timeRange === "1y") startDate.setFullYear(now.getFullYear() - 1);
  else startDate.setFullYear(2000); // "all"

  const dateFilter = { createdAt: { $gte: startDate, $lte: now } };
  const bookingDateFilter = { createdAt: { $gte: startDate, $lte: now } };

  // 1. KPI Cards (Total Revenue, Profit, Bookings, Margin)
  const bookings = await Booking.find({ ...baseFilter, ...bookingDateFilter });
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.salePrice || 0), 0);
  const totalProfit = bookings.reduce((sum, b) => sum + (b.profit || 0), 0);
  const totalBookings = bookings.length;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  // 2. Revenue vs Profit (Group by Month)
  const revenueDataRaw = await Booking.aggregate([
    { $match: { ...baseFilter, ...bookingDateFilter } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$salePrice" },
        profit: { $sum: "$profit" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueData = revenueDataRaw.map((d) => ({
    name: `${monthNames[d._id.month - 1]} ${d._id.year}`,
    revenue: d.revenue,
    profit: d.profit,
  }));

  // 3. Leads by Source
  const leadSourceRaw = await Lead.aggregate([
    { $match: { ...baseFilter, ...dateFilter } },
    { $group: { _id: "$source", value: { $sum: 1 } } },
  ]);

  const colors = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c", "#0f172a"];
  const leadSourceData = leadSourceRaw.map((d, i) => ({
    name: d._id || "Unknown",
    value: d.value,
    color: colors[i % colors.length],
  }));

  // 4. Bookings by Branch
  const branchDataRaw = await Booking.aggregate([
    { $match: { ...baseFilter, ...bookingDateFilter } },
    { $group: { _id: "$branchId", bookings: { $sum: 1 } } },
  ]);

  // Map branchIds to names
  const branches = await Branch.find({ agencyId: baseFilter.agencyId });
  const branchMap = new Map(branches.map(b => [b._id.toString(), b.name]));

  const branchData = branchDataRaw.map(d => ({
    name: branchMap.get(d._id?.toString()) || "Unknown Branch",
    bookings: d.bookings,
  }));

  return {
    kpis: {
      totalRevenue,
      totalProfit,
      totalBookings,
      profitMargin,
    },
    revenueData,
    leadSourceData,
    branchData,
  };
}

// --- Leads ---

export async function listLeads(ctx: TenantContext, pagination?: PaginationOptions, dates?: DateFilterOptions) {
  const filter: any = tenant(ctx);
  applyDateFilter(filter, dates);
  const query = Lead.find(filter)
    .populate("assignedAgentId", "name email")
    .sort({ createdAt: -1 });

  if (!pagination) {
    const leads = await query.exec();
    const data = await enrichLeadsBatch(leads);
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    Lead.countDocuments(filter),
  ]);

  const data = await enrichLeadsBatch(leads);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLead(ctx: TenantContext, idOrRef: string) {
  const lead = await Lead.findOne({ ...tenant(ctx), ...buildIdOrRefFilter(idOrRef, "leadRef") });
  if (!lead) return null;
  return enrichLead(lead.toObject());
}

export async function createLead(ctx: TenantContext, values: LeadInput, actor: string) {
  const agencyId = ctx.agencyId;
  const branchId = values.branchId ?? (await getDefaultBranchId(agencyId));
  const leadRef = await generateRef("LD", agencyId);
  const lead = await Lead.create({
    agencyId,
    leadRef,
    name: values.name,
    phone: values.phone,
    whatsapp: values.whatsapp || undefined,
    email: values.email || undefined,
    destination: values.destination,
    travelDate: values.travelDate ? new Date(values.travelDate) : undefined,
    budget: values.budget,
    adults: values.adults ?? 1,
    children: values.children ?? 0,
    specialRequirements: values.specialRequirements || undefined,
    source: values.source,
    status: values.status,
    assignedAgentId: values.assignedAgentId || undefined,
    branchId,
    notes: values.notes || undefined,
  });
  if (values.notes) {
    await LeadActivity.create({
      agencyId,
      leadId: lead._id,
      type: "note",
      description: values.notes,
      createdBy: actor,
    });
  } else {
    await LeadActivity.create({
      agencyId,
      leadId: lead._id,
      type: "note",
      description: "Lead captured",
      createdBy: actor,
    });
  }

  // Notify assignee if assigned
  if (values.assignedAgentId) {
    try {
      await notificationService.createNotification(ctx, {
        recipientId: values.assignedAgentId,
        title: "New Lead Assigned",
        body: `You have been assigned a new lead: ${values.name}`,
        entityType: "lead",
        entityId: lead._id.toString(),
        type: "info",
      });
    } catch (e) {
      console.error("Failed to send notification", e);
    }
  }

  return enrichLead(lead.toObject());
}

export async function updateLead(ctx: TenantContext, idOrRef: string, values: Partial<LeadInput>, actor?: string) {
  const lead = await Lead.findOneAndUpdate(
    { ...tenant(ctx), ...buildIdOrRefFilter(idOrRef, "leadRef") },
    {
      ...(values.name !== undefined && { name: values.name }),
      ...(values.phone !== undefined && { phone: values.phone }),
      ...(values.whatsapp !== undefined && { whatsapp: values.whatsapp || undefined }),
      ...(values.email !== undefined && { email: values.email || undefined }),
      ...(values.destination !== undefined && { destination: values.destination }),
      ...(values.travelDate !== undefined && {
        travelDate: values.travelDate ? new Date(values.travelDate) : undefined,
      }),
      ...(values.budget !== undefined && { budget: values.budget }),
      ...(values.adults !== undefined && { adults: values.adults }),
      ...(values.children !== undefined && { children: values.children }),
      ...(values.specialRequirements !== undefined && {
        specialRequirements: values.specialRequirements || undefined,
      }),
      ...(values.source !== undefined && { source: values.source }),
      ...(values.status !== undefined && { status: values.status }),
      ...(values.assignedAgentId !== undefined && {
        assignedAgentId: values.assignedAgentId || undefined,
      }),
      ...(values.branchId !== undefined && { branchId: values.branchId }),
      ...(values.notes !== undefined && { notes: values.notes || undefined }),
    },
    { new: true }
  );
  if (!lead) return null;

  // Also log the note if it's being updated
  if (values.notes) {
    await LeadActivity.create({
      agencyId: lead.agencyId,
      leadId: lead._id,
      type: "note",
      description: values.notes,
      createdBy: actor || "System",
    });
  }

  return enrichLead(lead.toObject());
}

export async function addLeadActivity(
  ctx: TenantContext,
  idOrRef: string,
  values: LeadActivityInput,
  actor: string
) {
  const lead = await Lead.findOne({ ...tenant(ctx), ...buildIdOrRefFilter(idOrRef, "leadRef") });
  if (!lead) throw ApiError.notFound("Lead");
  const activity = await LeadActivity.create({
    agencyId: ctx.agencyId,
    leadId: lead._id,
    type: values.type,
    description: values.description,
    outcome: values.outcome,
    createdBy: actor,
  });
  lead.lastContactedAt = new Date();
  await lead.save();

  return toJSON(activity.toObject());
}

export async function convertLead(
  ctx: TenantContext,
  idOrRef: string,
  values: ConvertLeadInput,
  userId: string,
  actor: string
) {
  const agencyId = ctx.agencyId;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const lead = await Lead.findOne({
      ...tenant(ctx),
      ...buildIdOrRefFilter(idOrRef, "leadRef"),
    }).session(session);
    if (!lead) throw ApiError.notFound("Lead");
    const customer = await findOrCreateCustomerFromLeadDoc(agencyId, lead, session);
    const branchId = values.branchId ?? String(lead.branchId);
    const agentId = values.agentId ?? userId;
    const bookingRef = await generateRef("BK", agencyId);
    const amountReceived = values.amountReceived ?? 0;
    const profit = values.salePrice - values.costPrice;
    const profitMargin = values.salePrice > 0 ? (profit / values.salePrice) * 100 : 0;
    const [booking] = await Booking.create(
      [
        {
          agencyId,
          bookingRef,
          pnr: values.pnr,
          ticketNumber: values.ticketNumber,
          customerId: customer._id,
          supplierId: values.supplierId,
          branchId,
          agentId,
          leadId: lead._id,
          airline: values.airline,
          departureCity: values.departureCity,
          arrivalCity: values.arrivalCity,
          departureDate: values.departureDate,
          returnDate: values.returnDate,
          costPrice: values.costPrice,
          salePrice: values.salePrice,
          profit,
          profitMargin,
          bookingStatus: "confirmed",
          paymentStatus: values.paymentStatus,
          amountReceived,
          balance: values.salePrice - amountReceived,
          notes: values.notes,
        },
      ],
      { session }
    );
    lead.status = "converted";
    await lead.save({ session });
    await LeadActivity.create(
      [
        {
          agencyId,
          leadId: lead._id,
          type: "booking_created",
          description: `Converted to Booking ${bookingRef}`,
          createdBy: actor,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    return enrichBooking(booking.toObject(), ctx);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// --- Customers ---

async function findOrCreateCustomerFromLeadDoc(
  agencyId: string,
  lead: InstanceType<typeof Lead>,
  session?: mongoose.ClientSession
) {
  const phoneNorm = normalizePhone(lead.phone);
  let core = phoneNorm;
  if (phoneNorm.startsWith("92")) core = phoneNorm.slice(2);
  else if (phoneNorm.startsWith("0")) core = phoneNorm.slice(1);
  const variants = [lead.phone, phoneNorm];
  if (core.length === 10) {
    const part1 = core.slice(0, 3);
    const part2 = core.slice(3);
    variants.push(
      `+92${part1}${part2}`,
      `+92${part1}-${part2}`,
      `+92${part1} ${part2}`,
      `0${part1}${part2}`,
      `0${part1}-${part2}`,
      `0${part1} ${part2}`
    );
  }
  const existing = await Customer.findOne({
    agencyId,
    isDeleted: false,
    phone: { $in: Array.from(new Set(variants)) },
  }).session(session ?? null);
  if (existing) return existing;
  const parts = lead.name.trim().split(/\s+/);
  const firstName = parts[0] ?? lead.name;
  const lastName = parts.slice(1).join(" ") || firstName;
  const customerRef = await generateRef("CUS", agencyId);
  const [customer] = await Customer.create(
    [
      {
        agencyId,
        customerRef,
        type: "individual",
        firstName,
        lastName,
        email: lead.email,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
      },
    ],
    { session }
  );
  return customer;
}

export async function findOrCreateCustomerFromLead(ctx: TenantContext, idOrRef: string) {
  const lead = await Lead.findOne({ ...tenant(ctx), ...buildIdOrRefFilter(idOrRef, "leadRef") });
  if (!lead) throw ApiError.notFound("Lead");
  const customer = await findOrCreateCustomerFromLeadDoc(ctx.agencyId, lead);
  return enrichCustomer(customer.toObject(), ctx);
}

export async function listCustomers(ctx: TenantContext, pagination?: PaginationOptions, dates?: DateFilterOptions) {
  const filter: any = tenant(ctx);
  applyDateFilter(filter, dates);
  const query = Customer.find(filter).sort({ createdAt: -1 });

  if (!pagination) {
    const customers = await query.exec();
    const data = await enrichCustomersBatch(customers, ctx);
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    Customer.countDocuments(filter),
  ]);

  const data = await enrichCustomersBatch(customers, ctx);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getCustomer(ctx: TenantContext, idOrRef: string) {
  const customer = await Customer.findOne({
    ...tenant(ctx),
    ...buildIdOrRefFilter(idOrRef, "customerRef"),
  });
  if (!customer) return null;
  return enrichCustomer(customer.toObject(), ctx);
}

export async function createCustomer(ctx: TenantContext, values: CustomerInput) {
  const agencyId = ctx.agencyId;
  const customerRef = await generateRef("CUS", agencyId);
  const customer = await Customer.create({
    agencyId,
    customerRef,
    type: values.type,
    firstName: values.firstName,
    lastName: values.lastName,
    companyName: values.companyName,
    businessType: values.businessType,
    taxNumber: values.taxNumber,
    email: values.email || undefined,
    phone: values.phone,
    whatsapp: values.whatsapp || undefined,
    dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : undefined,
    gender: values.gender,
    cnic: values.cnic || undefined,
    passportNumber: values.passportNumber || undefined,
    city: values.city,
    country: values.country ?? countryForCity(values.city),
    address: values.address,
    emergencyContactName: values.emergencyContactName,
    emergencyContactPhone: values.emergencyContactPhone || undefined,
    internalNotes: values.internalNotes || undefined,
  });
  return enrichCustomer(customer.toObject(), ctx);
}

export async function updateCustomer(ctx: TenantContext, idOrRef: string, values: CustomerInput) {
  const customer = await Customer.findOneAndUpdate(
    { ...tenant(ctx), ...buildIdOrRefFilter(idOrRef, "customerRef") },
    {
      type: values.type,
      firstName: values.firstName,
      lastName: values.lastName,
      companyName: values.companyName,
      businessType: values.businessType,
      taxNumber: values.taxNumber,
      email: values.email || undefined,
      phone: values.phone,
      whatsapp: values.whatsapp || undefined,
      dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : undefined,
      gender: values.gender,
      cnic: values.cnic || undefined,
      passportNumber: values.passportNumber || undefined,
      city: values.city,
      country: values.country ?? countryForCity(values.city),
      address: values.address,
      emergencyContactName: values.emergencyContactName,
      emergencyContactPhone: values.emergencyContactPhone || undefined,
      internalNotes: values.internalNotes || undefined,
    },
    { new: true }
  );
  if (!customer) return null;
  return enrichCustomer(customer.toObject(), ctx);
}

export async function listCustomerNotes(ctx: TenantContext, customerId: string) {
  const notes = await CustomerNote.find({ agencyId: ctx.agencyId, customerId }).sort({ createdAt: -1 });
  return toJSONList(notes.map((n) => n.toObject()));
}

export async function createCustomerNote(
  ctx: TenantContext,
  customerId: string,
  note: string,
  actor: string
) {
  const customer = await Customer.findOne({ _id: customerId, ...tenant(ctx) });
  if (!customer) throw ApiError.notFound("Customer");
  const record = await CustomerNote.create({ agencyId: ctx.agencyId, customerId, note, addedBy: actor });
  return toJSON(record.toObject());
}

export async function deleteCustomerNote(ctx: TenantContext, noteId: string) {
  const result = await CustomerNote.deleteOne({ _id: noteId, agencyId: ctx.agencyId });
  return result.deletedCount > 0;
}

export async function listCustomerDocuments(ctx: TenantContext, customerId: string) {
  const docs = await CustomerDocument.find({ agencyId: ctx.agencyId, customerId }).sort({ createdAt: -1 });
  return toJSONList(docs.map((d) => d.toObject()));
}

export async function createCustomerDocument(
  ctx: TenantContext,
  customerId: string,
  doc: {
    documentType: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileUrl: string;
    notes?: string;
  },
  actor: string
) {
  const customer = await Customer.findOne({ _id: customerId, ...tenant(ctx) });
  if (!customer) throw ApiError.notFound("Customer");
  const record = await CustomerDocument.create({
    agencyId: ctx.agencyId,
    customerId,
    ...doc,
    uploadedBy: actor,
  });
  return toJSON(record.toObject());
}

export async function deleteCustomerDocument(ctx: TenantContext, docId: string) {
  const result = await CustomerDocument.deleteOne({ _id: docId, agencyId: ctx.agencyId });
  return result.deletedCount > 0;
}

// --- Bookings ---

export async function listBookings(ctx: TenantContext, pagination?: PaginationOptions, dates?: DateFilterOptions) {
  const filter: any = tenant(ctx);
  applyDateFilter(filter, dates);
  const query = Booking.find(filter)
    .populate("customerId")
    .populate("supplierId")
    .populate("agentId")
    .populate("branchId")
    .sort({ createdAt: -1 });

  if (!pagination) {
    const bookings = await query.exec();
    const data = bookings.map((b) => formatPopulatedBooking(b));
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    Booking.countDocuments(filter),
  ]);

  const data = bookings.map((b) => formatPopulatedBooking(b));
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getBooking(ctx: TenantContext, idOrRef: string) {
  const booking = await Booking.findOne({
    ...tenant(ctx),
    ...buildIdOrRefFilter(idOrRef, "bookingRef"),
  });
  if (!booking) return null;
  return enrichBooking(booking.toObject(), ctx);
}

export async function createBooking(
  ctx: TenantContext,
  values: BookingInput,
  userId: string,
  actor: string
) {
  const agencyId = ctx.agencyId;
  const branchId = values.branchId ?? (await getDefaultBranchId(agencyId));
  const agentId = values.agentId ?? userId;
  const bookingRef = await generateRef("BK", agencyId);
  const amountReceived = values.amountReceived ?? 0;
  const profit = values.salePrice - values.costPrice;
  const profitMargin = values.salePrice > 0 ? (profit / values.salePrice) * 100 : 0;
  const booking = await Booking.create({
    agencyId,
    bookingRef,
    pnr: values.pnr,
    ticketNumber: values.ticketNumber,
    customerId: values.customerId,
    supplierId: values.supplierId,
    branchId,
    agentId,
    leadId: values.leadId,
    airline: values.airline,
    departureCity: values.departureCity,
    arrivalCity: values.arrivalCity,
    departureDate: values.departureDate,
    returnDate: values.returnDate,
    costPrice: values.costPrice,
    salePrice: values.salePrice,
    profit,
    profitMargin,
    bookingStatus: "confirmed",
    paymentStatus: values.paymentStatus,
    amountReceived,
    balance: values.salePrice - amountReceived,
    notes: values.notes,
  });
  if (values.leadId) {
    await Lead.findByIdAndUpdate(values.leadId, { status: "converted" });
    await LeadActivity.create({
      agencyId,
      leadId: values.leadId,
      type: "booking_created",
      description: `Converted to Booking ${bookingRef}`,
      createdBy: actor,
    });
  }

  await BookingActivity.create({
    agencyId,
    bookingId: booking._id,
    type: "created",
    title: "Booking Created",
    description: `Initial reservation made`,
    createdBy: actor,
  });

  // Notify manager or admin about new booking
  try {
    const manager = await User.findOne({ agencyId, branchId, role: "manager", isDeleted: false });
    const admin = await User.findOne({ agencyId, role: "admin", isDeleted: false });
    const recipientId = manager ? manager._id : (admin ? admin._id : null);

    if (recipientId) {
      await notificationService.createNotification(ctx, {
        recipientId: String(recipientId),
        title: "New Booking Created",
        body: `A new booking (${bookingRef}) has been created by ${actor}`,
        entityType: "booking",
        entityId: booking._id.toString(),
        type: "success",
      });
    }
  } catch (e) {
    console.error("Failed to send notification for booking", e);
  }

  return enrichBooking(booking.toObject(), ctx);
}

export async function updateBooking(ctx: TenantContext, idOrRef: string, values: BookingInput, actor: string) {
  const amountReceived = values.amountReceived ?? 0;
  const profit = values.salePrice - values.costPrice;
  const profitMargin = values.salePrice > 0 ? (profit / values.salePrice) * 100 : 0;
  const booking = await Booking.findOneAndUpdate(
    { ...tenant(ctx), ...buildIdOrRefFilter(idOrRef, "bookingRef") },
    {
      customerId: values.customerId,
      supplierId: values.supplierId,
      airline: values.airline,
      departureCity: values.departureCity,
      arrivalCity: values.arrivalCity,
      departureDate: values.departureDate,
      returnDate: values.returnDate,
      pnr: values.pnr,
      ticketNumber: values.ticketNumber || undefined,
      costPrice: values.costPrice,
      salePrice: values.salePrice,
      profit,
      profitMargin,
      paymentStatus: values.paymentStatus,
      amountReceived,
      balance: values.salePrice - amountReceived,
      notes: values.notes || undefined,
    },
    { new: true }
  );
  if (!booking) return null;

  await BookingActivity.create({
    agencyId: ctx.agencyId,
    bookingId: booking._id,
    type: "updated",
    title: "Booking Updated",
    description: `Booking details were updated`,
    createdBy: actor,
  });

  return enrichBooking(booking.toObject(), ctx);
}

// --- Suppliers ---

export async function listSuppliers(ctx: TenantContext, pagination?: PaginationOptions, dates?: DateFilterOptions) {
  const filter: any = tenant(ctx);
  applyDateFilter(filter, dates);
  const query = Supplier.find(filter).sort({ createdAt: -1 });

  if (!pagination) {
    const suppliers = await query.exec();
    const data = toJSONList(suppliers.map((s) => s.toObject()));
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [suppliers, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    Supplier.countDocuments(filter),
  ]);

  const data = toJSONList(suppliers.map((s) => s.toObject()));
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getSupplier(ctx: TenantContext, id: string) {
  const supplier = await Supplier.findOne({ _id: id, ...tenant(ctx) });
  return supplier ? toJSON(supplier.toObject()) : null;
}

export async function createSupplier(ctx: TenantContext, values: SupplierInput) {
  const supplier = await Supplier.create({
    agencyId: ctx.agencyId,
    name: values.name,
    category: values.category,
    contactPerson: values.contactPerson,
    email: values.email || undefined,
    phone: values.phone,
    city: values.city,
    country: values.country,
    balance: 0,
  });
  return toJSON(supplier.toObject());
}

export async function updateSupplier(ctx: TenantContext, id: string, values: SupplierInput) {
  const supplier = await Supplier.findOneAndUpdate(
    { _id: id, ...tenant(ctx) },
    {
      name: values.name,
      category: values.category,
      contactPerson: values.contactPerson,
      email: values.email || undefined,
      phone: values.phone,
      city: values.city,
      country: values.country,
    },
    { new: true }
  );
  return supplier ? toJSON(supplier.toObject()) : null;
}

// --- Branches ---

export async function listBranches(ctx: TenantContext, pagination?: PaginationOptions) {
  const filter = { agencyId: ctx.agencyId, isDeleted: false };
  const query = Branch.find(filter).sort({ name: 1 });

  if (!pagination) {
    const branches = await query.exec();
    const data = toJSONList(branches.map((b) => b.toObject()));
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [branches, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    Branch.countDocuments(filter),
  ]);

  const data = toJSONList(branches.map((b) => b.toObject()));
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getBranch(ctx: TenantContext, id: string) {
  const branch = await Branch.findOne({ _id: id, ...tenant(ctx) });
  return branch ? toJSON(branch.toObject()) : null;
}

export async function createBranch(ctx: TenantContext, values: BranchInput) {
  const code = values.code?.trim().toUpperCase() || values.name.slice(0, 4).toUpperCase();
  const existing = await Branch.findOne({ agencyId: ctx.agencyId, code, isDeleted: false });
  if (existing) throw ApiError.conflict("Branch code already in use");
  const branch = await Branch.create({
    agencyId: ctx.agencyId,
    name: values.name,
    code,
    city: values.city,
    address: values.address || undefined,
    phone: values.phone || undefined,
    isHeadOffice: values.isHeadOffice ?? false,
    status: values.status ?? "active",
  });
  return toJSON(branch.toObject());
}

export async function updateBranch(ctx: TenantContext, id: string, values: BranchInput) {
  const branch = await Branch.findOneAndUpdate(
    { _id: id, agencyId: ctx.agencyId, isDeleted: false },
    {
      name: values.name,
      city: values.city,
      address: values.address || undefined,
      phone: values.phone || undefined,
      isHeadOffice: values.isHeadOffice ?? false,
      status: values.status ?? "active",
    },
    { new: true }
  );
  return branch ? toJSON(branch.toObject()) : null;
}

// --- Users ---

export async function listUsers(ctx: TenantContext, pagination?: PaginationOptions) {
  const filter = { agencyId: ctx.agencyId };
  const query = User.find(filter).sort({ createdAt: -1 }).select("-password");

  if (!pagination) {
    const users = await query.exec();
    const data = toJSONList(users.map((u) => u.toObject()));
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    User.countDocuments(filter),
  ]);

  const data = toJSONList(users.map((u) => u.toObject()));
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getUser(ctx: TenantContext, id: string) {
  const user = await User.findOne({ _id: id, ...tenant(ctx) });
  return user ? toJSON(user.toObject()) : null;
}

export async function listAgents(ctx: TenantContext) {
  const agents = await User.find({ ...tenant(ctx), role: { $in: ["agent", "manager"] } }).sort({
    firstName: 1,
  });
  return toJSONList(agents.map((u) => u.toObject()));
}

export async function createUser(ctx: TenantContext, values: UserInput) {
  const existing = await User.findOne({
    agencyId: ctx.agencyId,
    email: values.email.toLowerCase(),
    isDeleted: false,
  });
  if (existing) throw ApiError.conflict("Email already in use");

  // Generate a secure random temp password if none provided
  const tempPassword = values.password ?? generateTempPassword();

  const user = await User.create({
    agencyId: ctx.agencyId,
    branchId: values.branchId,
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone || undefined,
    role: values.role,
    status: values.status,
    password: tempPassword,
  });
  const userData = toJSON(user.toObject());
  // Return tempPassword only on creation so admin can hand it to the user
  return { ...userData, tempPassword: values.password ? undefined : tempPassword };
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function updateUser(ctx: TenantContext, id: string, values: UserInput) {
  // P0-8: Prevent privilege escalation — only admin can promote to admin
  if (values.role === "admin" && ctx.callerRole !== "admin") {
    throw ApiError.forbidden("Only an admin can assign the admin role");
  }
  // Prevent users from changing their own role
  if (ctx.callerId === id && values.role && ctx.callerRole !== values.role) {
    throw ApiError.forbidden("You cannot change your own role");
  }

  const user = await User.findOneAndUpdate(
    { _id: id, ...tenant(ctx) },
    {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || undefined,
      role: values.role,
      branchId: values.branchId,
      status: values.status,
    },
    { new: true }
  );
  return user ? toJSON(user.toObject()) : null;
}

// --- Expenses ---

export async function listExpenses(ctx: TenantContext, pagination?: PaginationOptions, dates?: DateFilterOptions) {
  const filter: any = tenant(ctx);
  applyDateFilter(filter, dates, "date");
  const query = Expense.find(filter)
    .sort({ date: -1 });

  if (!pagination) {
    const expenses = await query.exec();
    const data = toJSONList(expenses.map((e) => e.toObject()));
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [expenses, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    Expense.countDocuments(filter),
  ]);

  const data = toJSONList(expenses.map((e) => e.toObject()));
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getExpense(ctx: TenantContext, idOrRef: string) {
  const expense = await Expense.findOne({
    ...tenant(ctx),
    ...buildIdOrRefFilter(idOrRef, "expenseRef"),
  });
  return expense ? toJSON(expense.toObject()) : null;
}

export async function createExpense(ctx: TenantContext, values: ExpenseInput, userId: string) {
  const agencyId = ctx.agencyId;
  const branchId = values.branchId ?? (await getDefaultBranchId(agencyId));
  const expenseRef = await generateRef("EXP", agencyId);
  const expense = await Expense.create({
    agencyId,
    branchId,
    expenseRef,
    title: values.title,
    category: values.category,
    amount: values.amount,
    date: values.date,
    paidTo: values.paidTo,
    paymentMethod: values.paymentMethod,
    notes: values.notes,
    recordedById: userId,
  });
  return toJSON(expense.toObject());
}

export async function updateExpense(ctx: TenantContext, idOrRef: string, values: ExpenseInput) {
  const expense = await Expense.findOneAndUpdate(
    { ...tenant(ctx), ...buildIdOrRefFilter(idOrRef, "expenseRef") },
    {
      title: values.title,
      category: values.category,
      amount: values.amount,
      date: values.date,
      paidTo: values.paidTo,
      paymentMethod: values.paymentMethod,
      notes: values.notes,
      ...(values.branchId && { branchId: values.branchId }),
    },
    { new: true }
  );
  return expense ? toJSON(expense.toObject()) : null;
}

// --- Roles ---

export async function listRoles(ctx: TenantContext) {
  const roles = await Role.find(tenant(ctx)).sort({ name: 1 });
  return toJSONList(roles.map((r) => r.toObject()));
}

export async function updateRolePermissions(ctx: TenantContext, roleId: string, permissions: string[]) {
  const role = await Role.findOneAndUpdate(
    { _id: roleId, ...tenant(ctx) },
    { permissions },
    { new: true }
  );
  return role ? toJSON(role.toObject()) : null;
}

export async function createRole(ctx: TenantContext, data: { name: string; description: string; permissions: string[]; color: string; textColor: string; }) {
  const role = await Role.create({
    agencyId: ctx.agencyId,
    ...data,
  });
  return toJSON(role.toObject());
}

export async function deleteRole(ctx: TenantContext, roleId: string) {
  const result = await Role.findOneAndUpdate(
    { _id: roleId, ...tenant(ctx) },
    { isDeleted: true },
    { new: true }
  );
  return result !== null;
}

// --- Soft Deletes ---

const deletedAt = () => new Date();

export async function deleteLead(ctx: TenantContext, idOrRef: string) {
  const result = await Lead.findOneAndUpdate(
    { ...tenant(ctx), ...buildIdOrRefFilter(idOrRef, "leadRef") },
    { isDeleted: true, deletedAt: deletedAt() },
    { new: true }
  );
  return result !== null;
}

export async function deleteCustomer(ctx: TenantContext, idOrRef: string) {
  const result = await Customer.findOneAndUpdate(
    { ...tenant(ctx), ...buildIdOrRefFilter(idOrRef, "customerRef") },
    { isDeleted: true, deletedAt: deletedAt() },
    { new: true }
  );
  return result !== null;
}

export async function deleteBooking(ctx: TenantContext, idOrRef: string) {
  const result = await Booking.findOneAndUpdate(
    { ...tenant(ctx), ...buildIdOrRefFilter(idOrRef, "bookingRef") },
    { isDeleted: true, deletedAt: deletedAt() },
    { new: true }
  );
  return result !== null;
}

export async function deleteSupplier(ctx: TenantContext, id: string) {
  const result = await Supplier.findOneAndUpdate(
    { _id: id, ...tenant(ctx) },
    { isDeleted: true, deletedAt: deletedAt() },
    { new: true }
  );
  return result !== null;
}

export async function deleteExpense(ctx: TenantContext, idOrRef: string) {
  const result = await Expense.findOneAndUpdate(
    { ...tenant(ctx), ...buildIdOrRefFilter(idOrRef, "expenseRef") },
    { isDeleted: true, deletedAt: deletedAt() },
    { new: true }
  );
  return result !== null;
}

export async function deleteUser(ctx: TenantContext, id: string) {
  if (ctx.callerId === id) {
    throw ApiError.forbidden("You cannot delete your own account");
  }
  const result = await User.findOneAndUpdate(
    { _id: id, ...tenant(ctx) },
    { isDeleted: true, deletedAt: deletedAt() },
    { new: true }
  );
  return result !== null;
}

// --- Supplier Payments ---

export async function recordSupplierPayment(
  ctx: TenantContext,
  supplierId: string,
  data: { amount: number; method: string; reference?: string }
) {
  const supplier = await Supplier.findOne({ _id: supplierId, ...tenant(ctx) });
  if (!supplier) throw ApiError.notFound("Supplier");
  if (data.amount <= 0) throw new ApiError(400, "Amount must be positive");

  supplier.balance = Math.max(0, supplier.balance - data.amount);
  await supplier.save();

  // Log to RecentActivity
  await RecentActivity.create({
    agencyId: ctx.agencyId,
    type: "payment",
    title: `Payment to ${supplier.name}`,
    detail: `PKR ${data.amount.toLocaleString()} via ${data.method}${data.reference ? ` (Ref: ${data.reference})` : ""}`,
    createdBy: "System",
  });

  return toJSON(supplier.toObject());
}

// --- Receipts (Customer Payments) ---

export async function listReceipts(ctx: TenantContext, pagination?: PaginationOptions, dates?: DateFilterOptions) {
  const filter: any = tenant(ctx);
  applyDateFilter(filter, dates, "date");
  const query = Receipt.find(filter)
    .populate("customerId", "firstName lastName companyName")
    .populate("bookingId", "bookingRef")
    .sort({ createdAt: -1 });

  let receipts;
  let total;
  let page = 1;
  let limit = 0;

  if (!pagination) {
    receipts = await query.exec();
    limit = receipts.length;
    total = receipts.length;
  } else {
    page = pagination.page;
    limit = pagination.limit;
    const skip = (page - 1) * limit;
    [receipts, total] = await Promise.all([
      query.skip(skip).limit(limit).exec(),
      Receipt.countDocuments(filter),
    ]);
  }

  const branchIds = [...new Set(receipts.map(r => r.branchId).filter(Boolean))];
  const managers = await User.find({
    agencyId: ctx.agencyId,
    $or: [
      { branchId: { $in: branchIds }, role: { $in: ["manager", "branch_manager", "admin"] } },
      { role: "admin" }
    ]
  });

  const getManagerForBranch = (bId: any) => {
    let mgr = managers.find(m => String(m.branchId) === String(bId) && ["manager", "branch_manager", "admin"].includes(m.role));
    if (!mgr) mgr = managers.find(m => m.role === "admin");
    return mgr ? { name: `${mgr.firstName} ${mgr.lastName}`, phone: mgr.phone, email: mgr.email } : null;
  };

  const data = toJSONList(receipts.map((r) => {
    const obj = r.toObject() as any;
    obj.managerContact = getManagerForBranch(r.branchId);
    return obj;
  }));

  return { data, total, page, limit, totalPages: limit ? Math.ceil(total / limit) : 1 };
}

export async function createReceipt(
  ctx: TenantContext,
  data: {
    bookingId: string;
    customerId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
  },
  actor: string
) {
  const agencyId = ctx.agencyId;
  const booking = await Booking.findOne({ _id: data.bookingId, agencyId });
  if (!booking) throw ApiError.notFound("Booking");

  const receiptRef = await generateRef("RCP", agencyId);
  const receipt = await Receipt.create({
    agencyId,
    receiptRef,
    bookingId: data.bookingId,
    customerId: data.customerId,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    notes: data.notes,
    date: new Date(),
  });

  // Update booking amounts
  booking.amountReceived = (booking.amountReceived || 0) + data.amount;
  booking.balance = Math.max(0, booking.salePrice - booking.amountReceived);
  if (booking.balance === 0) {
    booking.paymentStatus = "paid";
  } else if (booking.amountReceived > 0) {
    booking.paymentStatus = "partial";
  }
  await booking.save();

  // Notify booking agent
  if (booking.agentId) {
    try {
      await notificationService.createNotification(ctx, {
        recipientId: String(booking.agentId),
        title: "Payment Received",
        body: `Receipt ${receiptRef} generated for Booking ${booking.bookingRef} (Amount: ${data.amount})`,
        entityType: "receipt",
        entityId: receipt._id.toString(),
        type: "success",
      });
    } catch (e) {
      console.error("Failed to send notification for receipt", e);
    }
  }

  // Log to RecentActivity
  const customer = await Customer.findById(data.customerId);
  await RecentActivity.create({
    agencyId,
    type: "receipt",
    title: `Payment received`,
    detail: `PKR ${data.amount.toLocaleString()} from ${customer ? `${customer.firstName} ${customer.lastName}` : "Customer"} (${receiptRef})`,
    createdBy: actor,
  });

  await BookingActivity.create({
    agencyId,
    bookingId: booking._id,
    type: "payment",
    title: "Payment Received",
    description: `Received payment of Rs ${data.amount.toLocaleString()} via ${data.paymentMethod} (${receiptRef})`,
    createdBy: actor,
  });

  return toJSON(receipt.toObject());
}

// --- Booking Documents ---

export async function listBookingDocuments(ctx: TenantContext, bookingId: string) {
  const docs = await BookingDocument.find({ agencyId: ctx.agencyId, bookingId }).sort({ createdAt: -1 });
  return toJSONList(docs.map((d) => d.toObject()));
}

export async function createBookingDocument(
  ctx: TenantContext,
  bookingId: string,
  doc: { name: string; url: string; type: string },
  actor: string
) {
  const booking = await Booking.findOne({ _id: bookingId, agencyId: ctx.agencyId });
  if (!booking) throw ApiError.notFound("Booking");
  const record = await BookingDocument.create({
    agencyId: ctx.agencyId,
    bookingId,
    name: doc.name,
    url: doc.url,
    type: doc.type,
    uploadedBy: actor,
  });

  await BookingActivity.create({
    agencyId: ctx.agencyId,
    bookingId: booking._id,
    type: "document",
    title: "Document Uploaded",
    description: `Uploaded ${doc.name}`,
    createdBy: actor,
  });

  return toJSON(record.toObject());
}

export async function deleteBookingDocument(ctx: TenantContext, docId: string) {
  const result = await BookingDocument.deleteOne({ _id: docId, agencyId: ctx.agencyId });
  return result.deletedCount > 0;
}

export async function getBookingActivities(ctx: TenantContext, bookingId: string) {
  const activities = await BookingActivity.find({ agencyId: ctx.agencyId, bookingId }).sort({ createdAt: -1 });
  return toJSONList(activities.map(a => a.toObject()));
}

// --- Ledger and Statements ---

export async function getCustomerLedger(ctx: TenantContext, customerId: string) {
  const filter = { agencyId: ctx.agencyId, customerId };
  const [customer, bookings, receipts] = await Promise.all([
    Customer.findOne(filter),
    Booking.find(filter).sort({ createdAt: 1 }),
    Receipt.find(filter).sort({ date: 1 }),
  ]);

  if (!customer) throw ApiError.notFound("Customer");

  const ledger = [];
  let runningBalance = 0;

  for (const b of bookings) {
    runningBalance += b.salePrice;
    ledger.push({
      date: b.createdAt,
      type: "booking",
      reference: b.bookingRef,
      description: `Booking - ${b.airline} (${b.departureCity} to ${b.arrivalCity})`,
      debit: b.salePrice,
      credit: 0,
      balance: runningBalance,
    });
  }

  for (const r of receipts) {
    runningBalance -= r.amount;
    ledger.push({
      date: r.date,
      type: "receipt",
      reference: r.receiptRef,
      description: `Payment Received - ${r.paymentMethod}`,
      debit: 0,
      credit: r.amount,
      balance: runningBalance,
    });
  }

  ledger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Recalculate balance chronologically
  runningBalance = 0;
  for (const entry of ledger) {
    runningBalance += entry.debit;
    runningBalance -= entry.credit;
    entry.balance = runningBalance;
  }

  return {
    customer: toJSON(customer.toObject()),
    entries: ledger,
    finalBalance: runningBalance,
  };
}

export async function getSupplierStatement(ctx: TenantContext, supplierId: string) {
  const filter = { agencyId: ctx.agencyId, supplierId };
  // Note: For suppliers, bookings are credits (we owe them), payments are debits (we paid them)
  const [supplier, bookings] = await Promise.all([
    Supplier.findOne({ _id: supplierId, agencyId: ctx.agencyId }),
    Booking.find(filter).sort({ createdAt: 1 }),
  ]);

  if (!supplier) throw ApiError.notFound("Supplier");

  const payments = await RecentActivity.find({
    agencyId: ctx.agencyId,
    type: "payment",
    title: `Payment to ${supplier.name}`,
  }).sort({ createdAt: 1 });

  const statement = [];
  let runningBalance = 0;

  // Bookings (we owe supplier -> Credit)
  for (const b of bookings) {
    statement.push({
      date: b.createdAt,
      type: "booking",
      reference: b.bookingRef,
      description: `Booking - ${b.airline} (${b.departureCity} to ${b.arrivalCity})`,
      debit: 0,
      credit: b.costPrice,
    });
  }

  // Payments (we paid supplier -> Debit)
  for (const p of payments) {
    // detail is like: "PKR 1,500 via cash (Ref: 123)"
    // We can extract amount from detail if we really want, but for now we just parse it
    const amountStr = p.detail.split(" ")[1];
    const amount = parseInt(amountStr.replace(/,/g, ""), 10) || 0;
    statement.push({
      date: p.createdAt,
      type: "payment",
      reference: "N/A",
      description: p.detail,
      debit: amount,
      credit: 0,
    });
  }

  statement.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const entry of statement as any) {
    runningBalance += entry.credit;
    runningBalance -= entry.debit;
    entry.balance = runningBalance;
  }

  return {
    supplier: toJSON(supplier.toObject()),
    entries: statement,
    finalBalance: runningBalance,
  };
}

export { userDisplayName };