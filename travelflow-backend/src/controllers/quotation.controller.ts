import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import * as quotationService from "../services/quotation.service";
import type { IUser } from "../models/User.model";

type AuthenticatedRequest = Request & {
  user?: IUser;
  agencyId?: string;
};

export async function listQuotations(req: AuthenticatedRequest, res: Response) {
  const quotations = await quotationService.listQuotations({
    agencyId: req.agencyId!,
    query: req.query,
  });
  ApiResponse.success(res, quotations);
}

export async function getQuotation(req: AuthenticatedRequest, res: Response) {
  const quotation = await quotationService.getQuotation(
    req.agencyId!,
    req.params.id,
  );
  if (!quotation) throw ApiError.notFound("Quotation");
  ApiResponse.success(res, quotation);
}

export async function createQuotation(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) throw ApiError.unauthorized();

  const quotation = await quotationService.createQuotation({
    agencyId: req.agencyId!,
    createdBy: String(req.user._id),
    input: req.body,
  });

  ApiResponse.created(res, quotation);
}

export async function updateQuotation(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) throw ApiError.unauthorized();

  const quotation = await quotationService.updateQuotation({
    agencyId: req.agencyId!,
    quotationId: req.params.id,
    updatedBy: String(req.user._id),
    input: req.body,
  });

  if (!quotation) throw ApiError.notFound("Quotation");
  ApiResponse.success(res, quotation);
}

export async function sendQuotation(req: AuthenticatedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();

  const quotation = await quotationService.setQuotationStatus({
    agencyId: req.agencyId!,
    quotationId: req.params.id,
    status: "sent",
    actorId: String(req.user._id),
    changes: "Quotation sent",
  });

  if (!quotation) throw ApiError.notFound("Quotation");
  ApiResponse.success(res, quotation);
}

export async function convertQuotationToBooking(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) throw ApiError.unauthorized();

  const result = await quotationService.convertQuotationToBooking({
    agencyId: req.agencyId!,
    quotationId: req.params.id,
    actorId: String(req.user._id),
  });

  if (!result) throw ApiError.notFound("Quotation");
  ApiResponse.created(res, result, "Quotation converted to booking");
}

export async function getQuotationVersions(
  req: AuthenticatedRequest,
  res: Response,
) {
  const versions = await quotationService.getQuotationVersions(
    req.agencyId!,
    req.params.id,
  );
  ApiResponse.success(res, versions);
}
