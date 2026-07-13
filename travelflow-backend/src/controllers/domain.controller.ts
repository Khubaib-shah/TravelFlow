import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import * as domain from "../services/domain.service";
import type { IUser } from "../models/User.model";

type AuthenticatedRequest = Request & {
  user?: IUser;
  agencyId?: string;
};

function buildContext(req: AuthenticatedRequest): domain.TenantContext {
  return {
    agencyId: req.agencyId!,
    branchId: req.query.branchId as string | undefined,
    userRole: req.user?.role,
    userBranchId: req.user?.branchId ? String(req.user.branchId) : undefined,
  };
}

function actor(req: AuthenticatedRequest) {
  return domain.userDisplayName(req.user);
}

function userId(req: AuthenticatedRequest) {
  return String(req.user!._id);
}

export async function dashboardStats(req: AuthenticatedRequest, res: Response) {
  const stats = await domain.getDashboardStats(buildContext(req));
  ApiResponse.success(res, stats);
}

export async function analyticsStats(req: AuthenticatedRequest, res: Response) {
  const timeRange = (req.query.timeRange as string) || "6m";
  const stats = await domain.getAnalyticsStats(buildContext(req), timeRange);
  ApiResponse.success(res, stats);
}

export async function listLeads(req: AuthenticatedRequest, res: Response) {
  ApiResponse.success(res, await domain.listLeads(buildContext(req)));
}

export async function getLead(req: AuthenticatedRequest, res: Response) {
  const lead = await domain.getLead(buildContext(req), req.params.id);
  if (!lead) throw ApiError.notFound("Lead");
  ApiResponse.success(res, lead);
}

export async function createLead(req: AuthenticatedRequest, res: Response) {
  const lead = await domain.createLead(buildContext(req), req.body, actor(req));
  ApiResponse.created(res, lead);
}

export async function updateLead(req: AuthenticatedRequest, res: Response) {
  const lead = await domain.updateLead(
    buildContext(req),
    req.params.id,
    req.body,
  );
  if (!lead) throw ApiError.notFound("Lead");
  ApiResponse.success(res, lead);
}

export async function addLeadActivity(
  req: AuthenticatedRequest,
  res: Response,
) {
  const activity = await domain.addLeadActivity(
    buildContext(req),
    req.params.id,
    req.body,
    actor(req),
  );
  ApiResponse.created(res, activity);
}

export async function convertLead(req: AuthenticatedRequest, res: Response) {
  const booking = await domain.convertLead(
    buildContext(req),
    req.params.id,
    req.body,
    userId(req),
    actor(req),
  );
  ApiResponse.created(res, booking, "Lead converted to booking");
}

export async function findOrCreateCustomerFromLead(
  req: AuthenticatedRequest,
  res: Response,
) {
  const customer = await domain.findOrCreateCustomerFromLead(
    buildContext(req),
    req.params.leadId,
  );
  ApiResponse.success(res, customer);
}

export async function listCustomers(req: AuthenticatedRequest, res: Response) {
  ApiResponse.success(res, await domain.listCustomers(buildContext(req)));
}

export async function getCustomer(req: AuthenticatedRequest, res: Response) {
  const customer = await domain.getCustomer(buildContext(req), req.params.id);
  if (!customer) throw ApiError.notFound("Customer");
  ApiResponse.success(res, customer);
}

export async function createCustomer(req: AuthenticatedRequest, res: Response) {
  ApiResponse.created(
    res,
    await domain.createCustomer(buildContext(req), req.body),
  );
}

export async function updateCustomer(req: AuthenticatedRequest, res: Response) {
  const customer = await domain.updateCustomer(
    buildContext(req),
    req.params.id,
    req.body,
  );
  if (!customer) throw ApiError.notFound("Customer");
  ApiResponse.success(res, customer);
}

export async function listCustomerNotes(
  req: AuthenticatedRequest,
  res: Response,
) {
  ApiResponse.success(
    res,
    await domain.listCustomerNotes(buildContext(req), req.params.id),
  );
}

export async function createCustomerNote(
  req: AuthenticatedRequest,
  res: Response,
) {
  ApiResponse.created(
    res,
    await domain.createCustomerNote(
      buildContext(req),
      req.params.id,
      req.body.note,
      actor(req),
    ),
  );
}

export async function deleteCustomerNote(
  req: AuthenticatedRequest,
  res: Response,
) {
  const deleted = await domain.deleteCustomerNote(
    buildContext(req),
    req.params.noteId,
  );
  if (!deleted) throw ApiError.notFound("Note");
  ApiResponse.success(res, { deleted: true });
}

export async function listCustomerDocuments(
  req: AuthenticatedRequest,
  res: Response,
) {
  ApiResponse.success(
    res,
    await domain.listCustomerDocuments(buildContext(req), req.params.id),
  );
}

export async function createCustomerDocument(
  req: AuthenticatedRequest,
  res: Response,
) {
  ApiResponse.created(
    res,
    await domain.createCustomerDocument(
      buildContext(req),
      req.params.id,
      req.body,
      actor(req),
    ),
  );
}

export async function deleteCustomerDocument(
  req: AuthenticatedRequest,
  res: Response,
) {
  const deleted = await domain.deleteCustomerDocument(
    buildContext(req),
    req.params.docId,
  );
  if (!deleted) throw ApiError.notFound("Document");
  ApiResponse.success(res, { deleted: true });
}

export async function listBookings(req: AuthenticatedRequest, res: Response) {
  ApiResponse.success(res, await domain.listBookings(buildContext(req)));
}

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const booking = await domain.getBooking(buildContext(req), req.params.id);
  if (!booking) throw ApiError.notFound("Booking");
  ApiResponse.success(res, booking);
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  ApiResponse.created(
    res,
    await domain.createBooking(
      buildContext(req),
      req.body,
      userId(req),
      actor(req),
    ),
  );
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const booking = await domain.updateBooking(
    buildContext(req),
    req.params.id,
    req.body,
  );
  if (!booking) throw ApiError.notFound("Booking");
  ApiResponse.success(res, booking);
}

export async function listSuppliers(req: AuthenticatedRequest, res: Response) {
  ApiResponse.success(res, await domain.listSuppliers(buildContext(req)));
}

export async function getSupplier(req: AuthenticatedRequest, res: Response) {
  const supplier = await domain.getSupplier(buildContext(req), req.params.id);
  if (!supplier) throw ApiError.notFound("Supplier");
  ApiResponse.success(res, supplier);
}

export async function createSupplier(req: AuthenticatedRequest, res: Response) {
  ApiResponse.created(
    res,
    await domain.createSupplier(buildContext(req), req.body),
  );
}

export async function updateSupplier(req: AuthenticatedRequest, res: Response) {
  const supplier = await domain.updateSupplier(
    buildContext(req),
    req.params.id,
    req.body,
  );
  if (!supplier) throw ApiError.notFound("Supplier");
  ApiResponse.success(res, supplier);
}

export async function listBranches(req: AuthenticatedRequest, res: Response) {
  ApiResponse.success(res, await domain.listBranches(buildContext(req)));
}

export async function getBranch(req: AuthenticatedRequest, res: Response) {
  const branch = await domain.getBranch(buildContext(req), req.params.id);
  if (!branch) throw ApiError.notFound("Branch");
  ApiResponse.success(res, branch);
}

export async function createBranch(req: AuthenticatedRequest, res: Response) {
  ApiResponse.created(
    res,
    await domain.createBranch(buildContext(req), req.body),
  );
}

export async function updateBranch(req: AuthenticatedRequest, res: Response) {
  const branch = await domain.updateBranch(
    buildContext(req),
    req.params.id,
    req.body,
  );
  if (!branch) throw ApiError.notFound("Branch");
  ApiResponse.success(res, branch);
}

export async function listUsers(req: AuthenticatedRequest, res: Response) {
  ApiResponse.success(res, await domain.listUsers(buildContext(req)));
}

export async function listAgents(req: AuthenticatedRequest, res: Response) {
  ApiResponse.success(res, await domain.listAgents(buildContext(req)));
}

export async function getUser(req: AuthenticatedRequest, res: Response) {
  const user = await domain.getUser(buildContext(req), req.params.id);
  if (!user) throw ApiError.notFound("User");
  ApiResponse.success(res, user);
}

export async function createUser(req: AuthenticatedRequest, res: Response) {
  ApiResponse.created(
    res,
    await domain.createUser(buildContext(req), req.body),
  );
}

export async function updateUser(req: AuthenticatedRequest, res: Response) {
  const user = await domain.updateUser(
    buildContext(req),
    req.params.id,
    req.body,
  );
  if (!user) throw ApiError.notFound("User");
  ApiResponse.success(res, user);
}

export async function listExpenses(req: AuthenticatedRequest, res: Response) {
  ApiResponse.success(res, await domain.listExpenses(buildContext(req)));
}

export async function getExpense(req: Request, res: Response) {
  const expense = await domain.getExpense(buildContext(req), req.params.id);
  if (!expense) throw ApiError.notFound("Expense");
  ApiResponse.success(res, expense);
}

export async function createExpense(req: Request, res: Response) {
  ApiResponse.created(
    res,
    await domain.createExpense(buildContext(req), req.body, userId(req)),
  );
}

export async function updateExpense(req: Request, res: Response) {
  const expense = await domain.updateExpense(
    buildContext(req),
    req.params.id,
    req.body,
  );
  if (!expense) throw ApiError.notFound("Expense");
  ApiResponse.success(res, expense);
}

export async function listRoles(req: Request, res: Response) {
  ApiResponse.success(res, await domain.listRoles(buildContext(req)));
}

export async function updateRolePermissions(req: Request, res: Response) {
  const role = await domain.updateRolePermissions(
    buildContext(req),
    req.params.roleId,
    req.body.permissions,
  );
  if (!role) throw ApiError.notFound("Role");
  ApiResponse.success(res, role);
}

export async function createRole(req: Request, res: Response) {
  const role = await domain.createRole(buildContext(req), req.body);
  ApiResponse.created(res, role);
}

export async function deleteRole(req: Request, res: Response) {
  const ok = await domain.deleteRole(buildContext(req), req.params.roleId);
  if (!ok) throw ApiError.notFound("Role");
  ApiResponse.success(res, { deleted: true });
}

// ─── Delete Handlers ──────────────────────────────────────────────────────────

export async function deleteLead(req: Request, res: Response) {
  const ok = await domain.deleteLead(buildContext(req), req.params.id);
  if (!ok) throw ApiError.notFound("Lead");
  ApiResponse.success(res, { deleted: true });
}

export async function deleteCustomer(req: Request, res: Response) {
  const ok = await domain.deleteCustomer(buildContext(req), req.params.id);
  if (!ok) throw ApiError.notFound("Customer");
  ApiResponse.success(res, { deleted: true });
}

export async function deleteBooking(req: Request, res: Response) {
  const ok = await domain.deleteBooking(buildContext(req), req.params.id);
  if (!ok) throw ApiError.notFound("Booking");
  ApiResponse.success(res, { deleted: true });
}

export async function deleteSupplier(req: Request, res: Response) {
  const ok = await domain.deleteSupplier(buildContext(req), req.params.id);
  if (!ok) throw ApiError.notFound("Supplier");
  ApiResponse.success(res, { deleted: true });
}

export async function deleteExpense(req: Request, res: Response) {
  const ok = await domain.deleteExpense(buildContext(req), req.params.id);
  if (!ok) throw ApiError.notFound("Expense");
  ApiResponse.success(res, { deleted: true });
}

export async function deleteUser(req: Request, res: Response) {
  const ok = await domain.deleteUser(buildContext(req), req.params.id);
  if (!ok) throw ApiError.notFound("User");
  ApiResponse.success(res, { deleted: true });
}

// ─── Supplier Payments ────────────────────────────────────────────────────────

export async function recordSupplierPayment(
  req: AuthenticatedRequest,
  res: Response,
) {
  const supplier = await domain.recordSupplierPayment(
    buildContext(req),
    req.params.id,
    req.body,
  );
  ApiResponse.success(res, supplier);
}

// ─── Receipts ─────────────────────────────────────────────────────────────────

export async function listReceipts(req: AuthenticatedRequest, res: Response) {
  ApiResponse.success(res, await domain.listReceipts(buildContext(req)));
}

export async function createReceipt(req: AuthenticatedRequest, res: Response) {
  const receipt = await domain.createReceipt(
    buildContext(req),
    req.body,
    actor(req),
  );
  ApiResponse.created(res, receipt);
}

// ─── Booking Documents ────────────────────────────────────────────────────────

export async function listBookingDocuments(
  req: AuthenticatedRequest,
  res: Response,
) {
  ApiResponse.success(
    res,
    await domain.listBookingDocuments(buildContext(req), req.params.id),
  );
}

export async function createBookingDocument(
  req: AuthenticatedRequest,
  res: Response,
) {
  const doc = await domain.createBookingDocument(
    buildContext(req),
    req.params.id,
    req.body,
    actor(req),
  );
  ApiResponse.created(res, doc);
}

export async function deleteBookingDocument(
  req: AuthenticatedRequest,
  res: Response,
) {
  const ok = await domain.deleteBookingDocument(
    buildContext(req),
    req.params.docId,
  );
  if (!ok) throw ApiError.notFound("Document");
  ApiResponse.success(res, { deleted: true });
}
