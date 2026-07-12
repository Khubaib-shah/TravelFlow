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
} from "../models";
import { ApiError } from "../utils/ApiError";
import { generateRef } from "../utils/refGenerator";
import { buildIdOrRefFilter, toJSON, toJSONList } from "../utils/serialize";
import { countryForCity, normalizePhone, userDisplayName } from "../utils/helpers";
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

export interface TenantContext {
  agencyId: string;
  branchId?: string;
  userRole?: string;
  userBranchId?: string;
}

export function tenant(ctx: string | TenantContext) {
  if (typeof ctx === "string") {
    return { agencyId: ctx, isDeleted: false };
  }
  const filter: Record<string, unknown> = { agencyId: ctx.agencyId, isDeleted: false };
  if (ctx.userRole === "agent" || ctx.userRole === "accountant" || ctx.userRole === "manager") {
    filter.branchId = ctx.userBranchId;
  } else if (ctx.branchId && ctx.branchId !== "all") {
    filter.branchId = ctx.branchId;
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

async function enrichBooking(doc: unknown, ctx: string | TenantContext) {
  const json = toJSON(doc)!;
  const customer = json.customerId
    ? await Customer.findOne({ _id: json.customerId, ...tenant(ctx) })
    : null;
  const supplier = json.supplierId
    ? await Supplier.findOne({ _id: json.supplierId, ...tenant(ctx) })
    : null;
  const agent = json.agentId
    ? await User.findOne({ _id: json.agentId, ...tenant(ctx) })
    : null;
  const branch = json.branchId
    ? await Branch.findOne({ _id: json.branchId, ...tenant(ctx) })
    : null;
  return {
    ...json,
    customer: customer ? toJSON(customer.toObject()) : undefined,
    supplier: supplier ? toJSON(supplier.toObject()) : undefined,
    agent: agent ? { id: agent._id.toString(), name: userDisplayName(agent) } : undefined,
    branch: branch ? { id: branch._id.toString(), name: branch.name } : undefined,
  };
}

// --- Dashboard ---

export async function getDashboardStats(ctx: TenantContext) {
  const base = tenant(ctx);
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const [leads, customers, bookings, expenses, activities] = await Promise.all([
    Lead.countDocuments(base),
    Customer.countDocuments(base),
    Booking.find(base),
    Expense.find(base),
    RecentActivity.find({ agencyId: base.agencyId }).sort({ createdAt: -1 }).limit(20),
  ]);
  const thisMonthBookings = bookings.filter((b) => {
    const d = b.createdAt;
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const thisMonthExpenses = expenses.filter((e) => {
    const d = e.date;
    return d.getMonth() === month && d.getFullYear() === year;
  });
  return {
    totalLeads: leads,
    totalCustomers: customers,
    monthlyRevenue: thisMonthBookings.reduce((s, b) => s + b.salePrice, 0),
    monthlyProfit: thisMonthBookings.reduce((s, b) => s + b.profit, 0),
    totalExpenses: thisMonthExpenses.reduce((s, e) => s + e.amount, 0),
    activeBookings: bookings.filter((b) => b.bookingStatus === "confirmed").length,
    trends: { leads: 12.5, customers: 8.2, revenue: 15.4, profit: 10.1, expenses: -2.4, bookings: 5.0 },
    sparklines: {
      leads: [10, 25, 15, 30, 28, 40, leads || 35],
      customers: [20, 22, 25, 24, 30, 32, customers || 35],
      revenue: [30, 25, 40, 35, 50, 45, 60],
      profit: [15, 18, 16, 20, 25, 22, 28],
      expenses: [40, 35, 38, 30, 32, 28, 25],
      bookings: [12, 15, 14, 18, 16, 20, bookings.length || 22],
    },
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
  const bookingDateFilter = { date: { $gte: startDate, $lte: now } };

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
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
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

export async function listLeads(ctx: TenantContext) {
  const leads = await Lead.find(tenant(ctx)).sort({ createdAt: -1 });
  return Promise.all(leads.map((l) => enrichLead(l.toObject())));
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
  return enrichLead(lead.toObject());
}

export async function updateLead(ctx: TenantContext, idOrRef: string, values: Partial<LeadInput>) {
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
      createdBy: "System", // Or ideally pass actor from updateLead
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
        city: "Karachi",
        country: "Pakistan",
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

export async function listCustomers(ctx: TenantContext) {
  const customers = await Customer.find(tenant(ctx)).sort({ createdAt: -1 });
  return Promise.all(customers.map((c) => enrichCustomer(c.toObject(), ctx)));
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

export async function listBookings(ctx: TenantContext) {
  const bookings = await Booking.find(tenant(ctx)).sort({ createdAt: -1 });
  return Promise.all(bookings.map((b) => enrichBooking(b.toObject(), ctx)));
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
  return enrichBooking(booking.toObject(), ctx);
}

export async function updateBooking(ctx: TenantContext, idOrRef: string, values: BookingInput) {
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
  return enrichBooking(booking.toObject(), ctx);
}

// --- Suppliers ---

export async function listSuppliers(ctx: TenantContext) {
  const suppliers = await Supplier.find(tenant(ctx)).sort({ name: 1 });
  return toJSONList(suppliers.map((s) => s.toObject()));
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

export async function listBranches(ctx: TenantContext) {
  const branches = await Branch.find(tenant(ctx)).sort({ name: 1 });
  return toJSONList(branches.map((b) => b.toObject()));
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

export async function listUsers(ctx: TenantContext) {
  const users = await User.find(tenant(ctx)).sort({ firstName: 1 });
  return toJSONList(users.map((u) => u.toObject()));
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

export async function listExpenses(ctx: TenantContext) {
  const expenses = await Expense.find(tenant(ctx)).sort({ date: -1 });
  return toJSONList(expenses.map((e) => e.toObject()));
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

export async function listReceipts(ctx: TenantContext) {
  const receipts = await Receipt.find({ agencyId: ctx.agencyId, isDeleted: false }).sort({ createdAt: -1 });
  return toJSONList(receipts.map((r) => r.toObject()));
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

  // Log to RecentActivity
  const customer = await Customer.findById(data.customerId);
  await RecentActivity.create({
    agencyId,
    type: "receipt",
    title: `Payment received`,
    detail: `PKR ${data.amount.toLocaleString()} from ${customer ? `${customer.firstName} ${customer.lastName}` : "Customer"} (${receiptRef})`,
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
  return toJSON(record.toObject());
}

export async function deleteBookingDocument(ctx: TenantContext, docId: string) {
  const result = await BookingDocument.deleteOne({ _id: docId, agencyId: ctx.agencyId });
  return result.deletedCount > 0;
}

export { userDisplayName };