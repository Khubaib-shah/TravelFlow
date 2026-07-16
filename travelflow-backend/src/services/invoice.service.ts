import { Invoice, Booking, User } from "../models";
import { TenantContext, PaginationOptions } from "./domain.service";
import { generateRef } from "../utils/refGenerator";
import { ApiError } from "../utils/ApiError";
import { toJSON, toJSONList } from "../utils/serialize";

export async function listInvoices(ctx: TenantContext, pagination?: PaginationOptions) {
  const filter = { agencyId: ctx.agencyId, ...(ctx.userBranchId ? { branchId: ctx.userBranchId } : {}) };
  const query = Invoice.find(filter)
    .populate("customerId", "firstName lastName email phone companyName")
    .populate("bookingId", "bookingRef")
    .sort({ createdAt: -1 });

  if (!pagination) {
    const data = await query.exec();
    return { data: toJSONList(data.map(d => d.toObject())), total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    Invoice.countDocuments(filter),
  ]);

  return {
    data: toJSONList(data.map(d => d.toObject())),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getInvoice(ctx: TenantContext, id: string) {
  const filter = { agencyId: ctx.agencyId, _id: id };
  const invoice = await Invoice.findOne(filter)
    .populate("customerId", "firstName lastName email phone companyName address city country")
    .populate("bookingId", "bookingRef pnr airline departureDate returnDate departureCity arrivalCity amountReceived balance");
    
  if (!invoice) throw ApiError.notFound("Invoice");

  let branchManager = invoice.branchId ? await User.findOne({
    agencyId: ctx.agencyId,
    branchId: invoice.branchId,
    role: { $in: ["manager", "branch_manager", "admin"] }
  }) : null;
  
  if (!branchManager) {
    branchManager = await User.findOne({
      agencyId: ctx.agencyId,
      role: "admin"
    });
  }

  const managerContact = branchManager ? {
    name: `${branchManager.firstName} ${branchManager.lastName}`,
    phone: branchManager.phone,
    email: branchManager.email,
  } : null;

  return toJSON({ ...invoice.toObject(), managerContact });
}

export async function generateInvoiceFromBooking(ctx: TenantContext, bookingId: string) {
  const booking = await Booking.findOne({ _id: bookingId, agencyId: ctx.agencyId });
  if (!booking) throw ApiError.notFound("Booking");
  
  // Check if invoice already exists
  const existing = await Invoice.findOne({ bookingId: booking._id });
  if (existing) return toJSON(existing.toObject());

  const invoiceRef = await generateRef("INV", ctx.agencyId);
  const invoice = await Invoice.create({
    agencyId: ctx.agencyId,
    branchId: booking.branchId,
    invoiceRef,
    bookingId: booking._id,
    customerId: booking.customerId,
    items: [
      {
        description: `Flight Booking - ${booking.airline} (${booking.departureCity} to ${booking.arrivalCity})`,
        quantity: 1,
        unitPrice: booking.salePrice,
        amount: booking.salePrice,
      }
    ],
    subtotal: booking.salePrice,
    tax: 0,
    total: booking.salePrice,
    status: booking.paymentStatus === "paid" ? "paid" : "draft",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });

  return toJSON(invoice.toObject());
}

export async function markInvoicePaid(ctx: TenantContext, id: string) {
  const invoice = await Invoice.findOneAndUpdate(
    { _id: id, agencyId: ctx.agencyId },
    { status: "paid", paidAt: new Date() },
    { new: true }
  );
  if (!invoice) throw ApiError.notFound("Invoice");
  return toJSON(invoice.toObject());
}
