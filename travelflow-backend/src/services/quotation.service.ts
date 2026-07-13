import mongoose from "mongoose";
import { Booking } from "../models/Booking.model";
import { Quotation } from "../models/Quotation.model";
import { QuotationAttachment } from "../models/QuotationAttachment.model";
import { QuotationItem } from "../models/QuotationItem.model";
import { QuotationTax } from "../models/QuotationTax.model";
import { QuotationVersion } from "../models/QuotationVersion.model";
import { ApiError } from "../utils/ApiError";
import { toJSON, toJSONList } from "../utils/serialize";
import { generateRef, type RefPrefix } from "../utils/refGenerator";

type TenantContext = {
  agencyId: string;
};

export type QuotationServiceQuotationInput = {
  quotationNumber?: string;
  leadId?: string;
  customerId?: string;
  branchId: string;
  consultantId: string;
  travelType: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  currency: string;
  agencyFee: number;
  discount: number;
  validUntil?: string;
  customerNotes?: string;
  internalNotes?: string;
  termsTemplateId?: string;
  authorizedSignature?: string;

  items?: Array<{
    serviceCategory: string;
    title: string;
    description?: string;
    quantity: number;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    sortOrder?: number;
  }>;

  taxes?: Array<{
    taxName: string;
    taxType: "percentage" | "fixed";
    taxValue: number;
  }>;

  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    mimeType: string;
  }>;
};

type CreateQuotationArgs = TenantContext & {
  createdBy: string;
  input: QuotationServiceQuotationInput;
};

type UpdateQuotationArgs = TenantContext & {
  quotationId: string;
  updatedBy: string;
  input: Partial<QuotationServiceQuotationInput>;
};

type SetStatusArgs = TenantContext & {
  quotationId: string;
  status: any;
  actorId: string;
  changes?: string;
};

type ConvertArgs = TenantContext & {
  quotationId: string;
  actorId: string;
};

function computeTotals(
  items: Array<{
    quantity: number;
    sellingPrice: number;
    costPrice: number;
  }> = [],
  taxes: Array<{ taxType: "percentage" | "fixed"; taxValue: number }> = [],
  agencyFee: number,
  discount: number,
) {
  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.quantity ?? 0) * Number(it.sellingPrice ?? 0),
    0,
  );

  const taxTotal = taxes.reduce((sum, t) => {
    if (t.taxType === "percentage") {
      return sum + (subtotal * Number(t.taxValue ?? 0)) / 100;
    }
    return sum + Number(t.taxValue ?? 0);
  }, 0);

  const total =
    subtotal + Number(agencyFee ?? 0) - Number(discount ?? 0) + taxTotal;

  const costSubtotal = items.reduce(
    (sum, it) => sum + Number(it.quantity ?? 0) * Number(it.costPrice ?? 0),
    0,
  );

  const estimatedProfit = total - costSubtotal;

  return { subtotal, taxTotal, total, estimatedProfit };
}

export async function listQuotations({
  agencyId,
  query,
}: TenantContext & { query: any }) {
  const q: any = { agencyId, isDeleted: false };

  if (query?.status) q.status = query.status;
  if (query?.destination)
    q.destination = { $regex: String(query.destination), $options: "i" };

  const page = Number(query?.page ?? 1);
  const limit = Math.min(Number(query?.limit ?? 20), 100);
  const skip = (page - 1) * limit;

  const docs = await Quotation.find(q)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    items: toJSONList(docs),
    page,
    limit,
    total: await Quotation.countDocuments(q),
  };
}

export async function getQuotation(agencyId: string, quotationId: string) {
  if (!mongoose.Types.ObjectId.isValid(quotationId)) {
    throw ApiError.badRequest("Invalid quotation id");
  }

  const quotationDoc = await Quotation.findOne({
    agencyId,
    _id: quotationId,
    isDeleted: false,
  });
  if (!quotationDoc) return null;

  const [items, taxes, attachments, versions] = await Promise.all([
    QuotationItem.find({ agencyId, quotationId, isDeleted: false })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean(),
    QuotationTax.find({ agencyId, quotationId, isDeleted: false })
      .sort({ createdAt: 1 })
      .lean(),
    QuotationAttachment.find({ agencyId, quotationId, isDeleted: false })
      .sort({ createdAt: 1 })
      .lean(),
    QuotationVersion.find({ agencyId, quotationId, isDeleted: false })
      .sort({ version: 1 })
      .lean(),
  ]);

  const q = toJSON(quotationDoc) as any;

  // Frontend contract mapping (travelflow-frontend/types/quotation.ts)
  // Backend fields are: quotationNumber, total, subtotal, taxTotal, etc.
  q.quotationRef = q.quotationNumber;
  q.grandTotal = q.total;
  q.subtotalAmount = q.subtotal;
  q.taxAmount = q.taxTotal;

  const mappedItems = toJSONList(items).map((it: any) => ({
    ...it,
    unitPrice: it.unitPrice ?? it.sellingPrice,
    lineTotal: it.lineTotal ?? it.total,
  }));

  const mappedTaxes = toJSONList(taxes).map((t: any) => ({
    ...t,
    label: t.label ?? t.taxName,
    value: t.value ?? t.taxValue,
    amount: t.amount ?? t.taxAmount,
  }));

  const mappedAttachments = toJSONList(attachments).map((a: any) => ({
    ...a,
    name: a.name ?? a.fileName,
    url: a.url ?? a.fileUrl,
    type: a.type ?? a.mimeType,
  }));

  const mappedVersions = toJSONList(versions).map((v: any) => ({
    ...v,
    versionNumber: v.version,
  }));

  return {
    ...q,
    items: mappedItems,
    taxes: mappedTaxes,
    attachments: mappedAttachments,
    versions: mappedVersions,
  };
}

export async function createQuotation({
  agencyId,
  createdBy,
  input,
}: CreateQuotationArgs) {
  const quotationNumber =
    input.quotationNumber?.trim() ||
    (await generateRef("BK" as RefPrefix, agencyId));

  const items = input.items ?? [];
  const taxes = input.taxes ?? [];
  const agencyFee = Number(input.agencyFee ?? 0);
  const discount = Number(input.discount ?? 0);

  const totals = computeTotals(
    items.map((it) => ({
      quantity: it.quantity,
      sellingPrice: it.sellingPrice,
      costPrice: it.costPrice,
    })),
    taxes.map((t) => ({ taxType: t.taxType, taxValue: t.taxValue })),
    agencyFee,
    discount,
  );

  const quotation = await Quotation.create({
    agencyId,
    quotationNumber,
    leadId: input.leadId,
    customerId: input.customerId,
    branchId: input.branchId,
    consultantId: input.consultantId,
    travelType: input.travelType,
    destination: input.destination,
    departureDate: input.departureDate
      ? new Date(input.departureDate)
      : undefined,
    returnDate: input.returnDate ? new Date(input.returnDate) : undefined,
    adults: Number(input.adults ?? 0),
    children: Number(input.children ?? 0),
    infants: Number(input.infants ?? 0),
    currency: input.currency,
    subtotal: totals.subtotal,
    agencyFee,
    discount,
    taxTotal: totals.taxTotal,
    total: totals.total,
    estimatedProfit: totals.estimatedProfit,
    status: "draft",
    validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
    customerNotes: input.customerNotes,
    internalNotes: input.internalNotes,
    termsTemplateId: input.termsTemplateId,
    authorizedSignature: input.authorizedSignature,
    isDeleted: false,
  });

  const quotationId = String(quotation._id);

  if (items.length) {
    await QuotationItem.insertMany(
      items.map((it, idx) => ({
        agencyId,
        quotationId,
        serviceCategory: it.serviceCategory,
        title: it.title,
        description: it.description,
        quantity: Number(it.quantity ?? 0),
        unit: it.unit,
        costPrice: Number(it.costPrice ?? 0),
        sellingPrice: Number(it.sellingPrice ?? 0),
        total: Number(it.quantity ?? 0) * Number(it.sellingPrice ?? 0),
        sortOrder: it.sortOrder ?? idx,
        isDeleted: false,
      })),
    );
  }

  if (taxes.length) {
    await QuotationTax.insertMany(
      taxes.map((t) => ({
        agencyId,
        quotationId,
        taxName: t.taxName,
        taxType: t.taxType,
        taxValue: Number(t.taxValue ?? 0),
        taxAmount:
          t.taxType === "percentage"
            ? (totals.subtotal * Number(t.taxValue ?? 0)) / 100
            : Number(t.taxValue ?? 0),
        isDeleted: false,
      })),
    );
  }

  if (input.attachments?.length) {
    await QuotationAttachment.insertMany(
      input.attachments.map((a) => ({
        agencyId,
        quotationId,
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        mimeType: a.mimeType,
        isDeleted: false,
      })),
    );
  }

  await QuotationVersion.create({
    agencyId,
    quotationId,
    version: 1,
    changes: "Created quotation",
    createdBy,
    isDeleted: false,
  });

  return getQuotation(agencyId, quotationId);
}

export async function updateQuotation({
  agencyId,
  quotationId,
  updatedBy,
  input,
}: UpdateQuotationArgs) {
  if (!mongoose.Types.ObjectId.isValid(quotationId)) {
    throw ApiError.badRequest("Invalid quotation id");
  }

  const quotation = await Quotation.findOne({
    agencyId,
    _id: quotationId,
    isDeleted: false,
  });
  if (!quotation) return null;

  const existingItems = await QuotationItem.find({
    agencyId,
    quotationId,
    isDeleted: false,
  }).lean();
  const existingTaxes = await QuotationTax.find({
    agencyId,
    quotationId,
    isDeleted: false,
  }).lean();

  const nextItems = (input.items ?? existingItems).map((it: any) => ({
    serviceCategory: it.serviceCategory,
    title: it.title,
    description: it.description,
    quantity: Number(it.quantity ?? 0),
    unit: it.unit,
    costPrice: Number(it.costPrice ?? 0),
    sellingPrice: Number(it.sellingPrice ?? 0),
    sortOrder: it.sortOrder ?? 0,
  }));

  const nextTaxes = (input.taxes ?? existingTaxes).map((t: any) => ({
    taxName: t.taxName,
    taxType: t.taxType,
    taxValue: Number(t.taxValue ?? 0),
  }));

  const agencyFee = Number(input.agencyFee ?? quotation.agencyFee ?? 0);
  const discount = Number(input.discount ?? quotation.discount ?? 0);

  const totals = computeTotals(
    nextItems.map((it) => ({
      quantity: it.quantity,
      sellingPrice: it.sellingPrice,
      costPrice: it.costPrice,
    })),
    nextTaxes.map((t) => ({ taxType: t.taxType, taxValue: t.taxValue })),
    agencyFee,
    discount,
  );

  quotation.set({
    quotationNumber: input.quotationNumber?.trim()
      ? input.quotationNumber.trim()
      : quotation.quotationNumber,
    leadId: input.leadId ?? quotation.leadId,
    customerId: input.customerId ?? quotation.customerId,
    branchId: input.branchId ?? quotation.branchId,
    consultantId: input.consultantId ?? quotation.consultantId,
    travelType: input.travelType ?? quotation.travelType,
    destination: input.destination ?? quotation.destination,
    departureDate: input.departureDate
      ? new Date(input.departureDate)
      : quotation.departureDate,
    returnDate: input.returnDate
      ? new Date(input.returnDate)
      : quotation.returnDate,
    adults: input.adults ?? quotation.adults,
    children: input.children ?? quotation.children,
    infants: input.infants ?? quotation.infants,
    currency: input.currency ?? quotation.currency,
    subtotal: totals.subtotal,
    agencyFee,
    discount,
    taxTotal: totals.taxTotal,
    total: totals.total,
    estimatedProfit: totals.estimatedProfit,
    validUntil: input.validUntil
      ? new Date(input.validUntil)
      : quotation.validUntil,
    customerNotes: input.customerNotes ?? quotation.customerNotes,
    internalNotes: input.internalNotes ?? quotation.internalNotes,
    termsTemplateId: input.termsTemplateId ?? quotation.termsTemplateId,
    authorizedSignature:
      input.authorizedSignature ?? quotation.authorizedSignature,
  });

  await quotation.save();

  if (input.items) {
    await QuotationItem.updateMany(
      { agencyId, quotationId },
      { $set: { isDeleted: true } },
    );
    await QuotationItem.insertMany(
      nextItems.map((it, idx) => ({
        agencyId,
        quotationId,
        serviceCategory: it.serviceCategory,
        title: it.title,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        costPrice: it.costPrice,
        sellingPrice: it.sellingPrice,
        total: it.quantity * it.sellingPrice,
        sortOrder: it.sortOrder ?? idx,
        isDeleted: false,
      })),
    );
  }

  if (input.taxes) {
    await QuotationTax.updateMany(
      { agencyId, quotationId },
      { $set: { isDeleted: true } },
    );
    await QuotationTax.insertMany(
      nextTaxes.map((t) => ({
        agencyId,
        quotationId,
        taxName: t.taxName,
        taxType: t.taxType,
        taxValue: t.taxValue,
        taxAmount:
          t.taxType === "percentage"
            ? (totals.subtotal * t.taxValue) / 100
            : t.taxValue,
        isDeleted: false,
      })),
    );
  }

  if (input.attachments) {
    await QuotationAttachment.updateMany(
      { agencyId, quotationId },
      { $set: { isDeleted: true } },
    );
    await QuotationAttachment.insertMany(
      input.attachments.map((a) => ({
        agencyId,
        quotationId,
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        mimeType: a.mimeType,
        isDeleted: false,
      })),
    );
  }

  const latest = await QuotationVersion.findOne({
    agencyId,
    quotationId,
    isDeleted: false,
  })
    .sort({ version: -1 })
    .lean();

  await QuotationVersion.create({
    agencyId,
    quotationId,
    version: (latest?.version ?? 0) + 1,
    changes: "Updated quotation",
    createdBy: updatedBy,
    isDeleted: false,
  });

  return getQuotation(agencyId, quotationId);
}

export async function setQuotationStatus({
  agencyId,
  quotationId,
  status,
  actorId,
  changes,
}: SetStatusArgs) {
  const quotation = await Quotation.findOne({
    agencyId,
    _id: quotationId,
    isDeleted: false,
  });
  if (!quotation) return null;

  quotation.status = status;
  await quotation.save();

  const latest = await QuotationVersion.find({
    agencyId,
    quotationId,
    isDeleted: false,
  })
    .sort({ version: -1 })
    .limit(1)
    .lean();

  const nextVersion = (latest[0]?.version ?? 0) + 1;

  await QuotationVersion.create({
    agencyId,
    quotationId,
    version: nextVersion,
    changes: changes ?? `Status changed to ${status}`,
    createdBy: actorId,
    isDeleted: false,
  });

  return getQuotation(agencyId, quotationId);
}

export async function convertQuotationToBooking({
  agencyId,
  quotationId,
  actorId,
}: ConvertArgs) {
  const quotation = await Quotation.findOne({
    agencyId,
    _id: quotationId,
    isDeleted: false,
  });
  if (!quotation) return null;

  if (!quotation.customerId || !quotation.branchId || !quotation.consultantId) {
    throw ApiError.badRequest(
      "Quotation missing required fields for conversion",
    );
  }

  const bookingRef = await generateRef("BK" as RefPrefix, agencyId);

  const booking = await Booking.create({
    agencyId,
    bookingRef,
    pnr: "",
    ticketNumber: undefined,
    customerId: quotation.customerId,
    supplierId: new mongoose.Types.ObjectId(quotation.consultantId),
    branchId: quotation.branchId,
    agentId: quotation.consultantId,
    leadId: quotation.leadId,
    airline: quotation.travelType,
    departureCity: quotation.destination,
    arrivalCity: quotation.destination,
    departureDate: quotation.departureDate ?? new Date(),
    returnDate: quotation.returnDate,
    costPrice: 0,
    salePrice: quotation.total,
    profit: quotation.estimatedProfit,
    profitMargin:
      quotation.total > 0
        ? (quotation.estimatedProfit / quotation.total) * 100
        : 0,
    bookingStatus: "confirmed",
    paymentStatus: "unpaid",
    amountReceived: 0,
    balance: quotation.total,
    notes: quotation.customerNotes,
    isDeleted: false,
  });

  void actorId;

  return toJSON(booking);
}

export async function getQuotationVersions(
  agencyId: string,
  quotationId: string,
) {
  const docs = await QuotationVersion.find({
    agencyId,
    quotationId,
    isDeleted: false,
  })
    .sort({ version: -1 })
    .lean();

  return toJSONList(docs);
}
