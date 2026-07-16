import { Notification } from "../models/Notification.model";
import { TenantContext, PaginationOptions } from "./domain.service";
import { ApiError } from "../utils/ApiError";

export interface CreateNotificationInput {
  recipientId: string;
  type?: "info" | "success" | "warning" | "error";
  title: string;
  body: string;
  entityType?: "lead" | "booking" | "receipt" | "customer" | "user" | "expense";
  entityId?: string;
  branchId?: string;
}

export async function createNotification(ctx: TenantContext, input: CreateNotificationInput) {
  const notification = await Notification.create({
    agencyId: ctx.agencyId,
    branchId: input.branchId || ctx.branchId,
    recipientId: input.recipientId,
    type: input.type || "info",
    title: input.title,
    body: input.body,
    entityType: input.entityType,
    entityId: input.entityId,
  });
  return notification;
}

export async function listNotifications(
  ctx: TenantContext,
  userId: string,
  pagination?: PaginationOptions
) {
  const filter = { agencyId: ctx.agencyId, recipientId: userId };
  const query = Notification.find(filter).sort({ isRead: 1, createdAt: -1 });

  if (!pagination) {
    const data = await query.exec();
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    query.skip(skip).limit(limit).exec(),
    Notification.countDocuments(filter),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function markAsRead(ctx: TenantContext, userId: string, notificationId: string) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, agencyId: ctx.agencyId, recipientId: userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw ApiError.notFound("Notification");
  return notification;
}

export async function markAllAsRead(ctx: TenantContext, userId: string) {
  await Notification.updateMany(
    { agencyId: ctx.agencyId, recipientId: userId, isRead: false },
    { isRead: true }
  );
  return { success: true };
}

export async function deleteNotification(ctx: TenantContext, userId: string, notificationId: string) {
  const result = await Notification.deleteOne({
    _id: notificationId,
    agencyId: ctx.agencyId,
    recipientId: userId,
  });
  if (result.deletedCount === 0) throw ApiError.notFound("Notification");
  return { deleted: true };
}
