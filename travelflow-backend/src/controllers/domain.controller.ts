import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import * as domain from "../services/domain.service";


function buildContext(req: Request): domain.TenantContext {
  const branchIdQuery = req.query.branchId as string | undefined;

  // Prevent branchId injection (P0-5): Only admin can query branches other than their own
  if (branchIdQuery && branchIdQuery !== "all" && req.user?.role !== "admin") {
    if (branchIdQuery !== String(req.user?.branchId)) {
      throw ApiError.forbidden("You can only query data for your own branch");
    }
  }

  return {
    agencyId: req.agencyId!,
    branchId: branchIdQuery,
    userRole: req.user?.role,
    userBranchId: req.user?.branchId ? String(req.user.branchId) : undefined,
    callerId: req.user?._id ? String(req.user._id) : undefined,
    callerRole: req.user?.role,
  };
}

function actor(req: Request) {
  return domain.userDisplayName(req.user);
}

function userId(req: Request) {
  return String(req.user!._id);
}

function getPagination(req: Request): domain.PaginationOptions | undefined {
  const page = parseInt(req.query.page as string, 10);
  const limit = parseInt(req.query.limit as string, 10);
  if (!isNaN(page) && !isNaN(limit)) {
    return { page, limit };
  }
  return undefined;
}

export async function dashboardStats(req: Request, res: Response) {
  const stats = await domain.getDashboardStats(buildContext(req));
  ApiResponse.success(res, stats);
}

export async function analyticsStats(req: Request, res: Response) {
  const timeRange = (req.query.timeRange as string) || "6m";
  const stats = await domain.getAnalyticsStats(buildContext(req), timeRange);
  ApiResponse.success(res, stats);
}

export async function listLeads(req: Request, res: Response) {
  ApiResponse.success(res, await domain.listLeads(buildContext(req), getPagination(req)));
}

export async function getLead(req: Request, res: Response) {
  const lead = await domain.getLead(buildContext(req), req.params.id);
  if (!lead) throw ApiError.notFound("Lead");
  ApiResponse.success(res, lead);
}

export async function createLead(req: Request, res: Response) {
  const lead = await domain.createLead(buildContext(req), req.body, actor(req));
  ApiResponse.created(res, lead);
}

export async function updateLead(req: Request, res: Response) {
  const lead = await domain.updateLead(
    buildContext(req),
    req.params.id,
    req.body,
    actor(req)
  );
  if (!lead) throw ApiError.notFound("Lead");
  ApiResponse.success(res, lead);
}

export async function addLeadActivity(
  req: Request,
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

export async function convertLead(req: Request, res: Response) {
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
  req: Request,
  res: Response,
) {
  const customer = await domain.findOrCreateCustomerFromLead(
    buildContext(req),
    req.params.leadId,
  );
  ApiResponse.success(res, customer);
}

export async function listCustomers(req: Request, res: Response) {
  ApiResponse.success(res, await domain.listCustomers(buildContext(req), getPagination(req)));
}

export async function getCustomer(req: Request, res: Response) {
  const customer = await domain.getCustomer(buildContext(req), req.params.id);
  if (!customer) throw ApiError.notFound("Customer");
  ApiResponse.success(res, customer);
}

export async function createCustomer(req: Request, res: Response) {
  ApiResponse.created(
    res,
    await domain.createCustomer(buildContext(req), req.body),
  );
}

export async function updateCustomer(req: Request, res: Response) {
  const customer = await domain.updateCustomer(
    buildContext(req),
    req.params.id,
    req.body,
  );
  if (!customer) throw ApiError.notFound("Customer");
  ApiResponse.success(res, customer);
}

export async function listCustomerNotes(
  req: Request,
  res: Response,
) {
  ApiResponse.success(
    res,
    await domain.listCustomerNotes(buildContext(req), req.params.id),
  );
}

export async function createCustomerNote(
  req: Request,
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
  req: Request,
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
  req: Request,
  res: Response,
) {
  ApiResponse.success(
    res,
    await domain.listCustomerDocuments(buildContext(req), req.params.id),
  );
}

export async function createCustomerDocument(
  req: Request,
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

export async function deleteCustomerDocument(req: Request, res: Response) {
  const success = await domain.deleteCustomerDocument(buildContext(req), req.params.docId);
  ApiResponse.success(res, { deleted: success });
}

export async function getCustomerLedger(req: Request, res: Response) {
  const data = await domain.getCustomerLedger(buildContext(req), req.params.id);
  ApiResponse.success(res, data);
}

export async function listBookings(req: Request, res: Response) {
  ApiResponse.success(res, await domain.listBookings(buildContext(req), getPagination(req)));
}

export async function getBooking(req: Request, res: Response) {
  const booking = await domain.getBooking(buildContext(req), req.params.id);
  if (!booking) throw ApiError.notFound("Booking");
  ApiResponse.success(res, booking);
}

export async function createBooking(req: Request, res: Response) {
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

export async function updateBooking(req: Request, res: Response) {
  const booking = await domain.updateBooking(
    buildContext(req),
    req.params.id,
    req.body,
  );
  if (!booking) throw ApiError.notFound("Booking");
  ApiResponse.success(res, booking);
}

export async function listSuppliers(req: Request, res: Response) {
  ApiResponse.success(res, await domain.listSuppliers(buildContext(req), getPagination(req)));
}

export async function getSupplier(req: Request, res: Response) {
  const supplier = await domain.getSupplier(buildContext(req), req.params.id);
  if (!supplier) throw ApiError.notFound("Supplier");
  ApiResponse.success(res, supplier);
}

export async function createSupplier(req: Request, res: Response) {
  ApiResponse.created(
    res,
    await domain.createSupplier(buildContext(req), req.body),
  );
}

export async function updateSupplier(req: Request, res: Response) {
  const supplier = await domain.updateSupplier(
    buildContext(req),
    req.params.id,
    req.body,
  );
  if (!supplier) throw ApiError.notFound("Supplier");
  ApiResponse.success(res, supplier);
}

export async function listBranches(req: Request, res: Response) {
  ApiResponse.success(res, await domain.listBranches(buildContext(req), getPagination(req)));
}

export async function getBranch(req: Request, res: Response) {
  const branch = await domain.getBranch(buildContext(req), req.params.id);
  if (!branch) throw ApiError.notFound("Branch");
  ApiResponse.success(res, branch);
}

export async function createBranch(req: Request, res: Response) {
  ApiResponse.created(
    res,
    await domain.createBranch(buildContext(req), req.body),
  );
}

export async function updateBranch(req: Request, res: Response) {
  const branch = await domain.updateBranch(
    buildContext(req),
    req.params.id,
    req.body,
  );
  if (!branch) throw ApiError.notFound("Branch");
  ApiResponse.success(res, branch);
}

export async function listUsers(req: Request, res: Response) {
  ApiResponse.success(res, await domain.listUsers(buildContext(req), getPagination(req)));
}

export async function listAgents(req: Request, res: Response) {
  ApiResponse.success(res, await domain.listAgents(buildContext(req)));
}

export async function getUser(req: Request, res: Response) {
  const user = await domain.getUser(buildContext(req), req.params.id);
  if (!user) throw ApiError.notFound("User");
  ApiResponse.success(res, user);
}

export async function createUser(req: Request, res: Response) {
  ApiResponse.created(
    res,
    await domain.createUser(buildContext(req), req.body),
  );
}

export async function updateUser(req: Request, res: Response) {
  const user = await domain.updateUser(
    buildContext(req),
    req.params.id,
    req.body,
  );
  if (!user) throw ApiError.notFound("User");
  ApiResponse.success(res, user);
}

export async function listExpenses(req: Request, res: Response) {
  ApiResponse.success(res, await domain.listExpenses(buildContext(req), getPagination(req)));
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
  const success = await domain.deleteSupplier(buildContext(req), req.params.id);
  ApiResponse.success(res, { deleted: success });
}

export async function getSupplierStatement(req: Request, res: Response) {
  const data = await domain.getSupplierStatement(buildContext(req), req.params.id);
  ApiResponse.success(res, data);
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
  req: Request,
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

export async function listReceipts(req: Request, res: Response) {
  ApiResponse.success(res, await domain.listReceipts(buildContext(req), getPagination(req)));
}

export async function createReceipt(req: Request, res: Response) {
  const receipt = await domain.createReceipt(
    buildContext(req),
    req.body,
    actor(req),
  );
  ApiResponse.created(res, receipt);
}

// ─── Booking Documents ────────────────────────────────────────────────────────

export async function listBookingDocuments(
  req: Request,
  res: Response,
) {
  ApiResponse.success(
    res,
    await domain.listBookingDocuments(buildContext(req), req.params.id),
  );
}

export async function createBookingDocument(
  req: Request,
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
  req: Request,
  res: Response,
) {
  const ok = await domain.deleteBookingDocument(
    buildContext(req),
    req.params.docId,
  );
  if (!ok) throw ApiError.notFound("Document");
  ApiResponse.success(res, { deleted: true });
}
