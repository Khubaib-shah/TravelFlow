import { RecentActivity, Notification } from "../../models";
import { Types } from "mongoose";
import { getRandomDate, getRandomItem } from "./utils";

export async function seedActivityAndNotifications(
  agencyId: Types.ObjectId,
  branches: any[],
  users: any[]
) {
  console.log("Seeding Activity & Notifications...");

  const activitiesData = [];
  const notificationsData = [];

  const activityTypes = ["booking_created", "lead_assigned", "invoice_generated", "payment_received", "customer_added"];
  const activityDetails = [
    "Booking created for Dubai Package",
    "Lead assigned to agent",
    "Invoice generated for Ticket",
    "Payment received via Bank Transfer",
    "Customer profile completed"
  ];

  // Generate 200 recent activities
  for (let i = 0; i < 200; i++) {
    const branch = getRandomItem(branches);
    const user = getRandomItem(users.filter(u => String(u.branchId) === String(branch._id))) || getRandomItem(users);
    
    activitiesData.push({
      agencyId,
      branchId: branch._id,
      type: getRandomItem(activityTypes),
      title: getRandomItem(activityDetails),
      detail: "Action performed successfully by user.",
      createdBy: `${user.firstName} ${user.lastName}`,
      createdByUserId: user._id,
      createdAt: getRandomDate(120),
    });
  }

  // Generate 150 notifications
  for (let i = 0; i < 150; i++) {
    const branch = getRandomItem(branches);
    const user = getRandomItem(users.filter(u => String(u.branchId) === String(branch._id))) || getRandomItem(users);
    
    notificationsData.push({
      agencyId,
      branchId: branch._id,
      recipientId: user._id,
      type: getRandomItem(["info", "success", "warning"]),
      title: getRandomItem(["New Lead", "Payment Overdue", "Booking Confirmed", "Expense Approved"]),
      body: "Please check the portal for details.",
      entityType: getRandomItem(["lead", "booking", "receipt", "expense"]),
      isRead: Math.random() > 0.3,
      createdAt: getRandomDate(30),
    });
  }

  await RecentActivity.insertMany(activitiesData);
  await Notification.insertMany(notificationsData);
}
