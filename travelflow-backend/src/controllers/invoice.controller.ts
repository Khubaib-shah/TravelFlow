import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import * as invoiceService from "../services/invoice.service";
import { TenantContext, PaginationOptions } from "../services/domain.service";

function buildContext(req: Request): TenantContext {
  return {
    agencyId: req.agencyId!,
    branchId: req.query.branchId as string | undefined,
    userRole: req.user?.role,
    userBranchId: req.user?.branchId ? String(req.user.branchId) : undefined,
    callerId: req.user?._id ? String(req.user._id) : undefined,
    callerRole: req.user?.role,
  };
}

function getPagination(req: Request): PaginationOptions | undefined {
  const page = parseInt(req.query.page as string, 10);
  const limit = parseInt(req.query.limit as string, 10);
  if (!isNaN(page) && !isNaN(limit)) {
    return { page, limit };
  }
  return undefined;
}

export async function listInvoices(req: Request, res: Response) {
  const result = await invoiceService.listInvoices(buildContext(req), getPagination(req));
  ApiResponse.success(res, result);
}

export async function getInvoice(req: Request, res: Response) {
  const invoice = await invoiceService.getInvoice(buildContext(req), req.params.id);
  ApiResponse.success(res, invoice);
}

export async function generateInvoiceFromBooking(req: Request, res: Response) {
  const invoice = await invoiceService.generateInvoiceFromBooking(buildContext(req), req.params.bookingId);
  ApiResponse.success(res, invoice);
}

export async function markInvoicePaid(req: Request, res: Response) {
  const invoice = await invoiceService.markInvoicePaid(buildContext(req), req.params.id);
  ApiResponse.success(res, invoice);
}
