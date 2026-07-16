import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middleware/auth.middleware";
import { tenantMiddleware } from "../middleware/tenant.middleware";
import { requireRole, requirePermission } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  loginSchema,
  leadSchema,
  leadActivitySchema,
  customerSchema,
  bookingSchema,
  convertLeadSchema,
  supplierSchema,
  branchSchema,
  expenseSchema,
  userSchema,
  rolePermissionsSchema,
  customerNoteSchema,
  customerDocumentSchema,
  idParamSchema,
  leadIdParamSchema,
  roleIdParamSchema,
  createRoleSchema,
} from "../validators/schemas";
import * as auth from "../controllers/auth.controller";
import * as domain from "../controllers/domain.controller";
import quotationsRouter from "./quotations";
import templateRouter from "./template.routes";
import settingsRouter from "./settings";
import notificationsRouter from "./notifications";
import invoicesRouter from "./invoices";

const router = Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "TravelFlow API is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── Public Auth ──────────────────────────────────────────────────────────────
router.post("/auth/login", validate(loginSchema), asyncHandler(auth.login));
router.post("/auth/refresh-token", asyncHandler(auth.refreshToken));
router.post("/auth/logout", asyncHandler(auth.logout));

// ─── Protected Auth ───────────────────────────────────────────────────────────
router.get("/auth/me", authMiddleware, tenantMiddleware, asyncHandler(auth.me));

// ─── Protected Domain ─────────────────────────────────────────────────────────
const protectedRouter = Router();
protectedRouter.use(authMiddleware, tenantMiddleware);

// Dashboard
protectedRouter.get(
  "/dashboard/stats",
  requireRole(["admin", "manager"]),
  asyncHandler(domain.dashboardStats),
);
protectedRouter.get(
  "/dashboard/analytics",
  requireRole(["admin", "manager"]),
  asyncHandler(domain.analyticsStats),
);

// Leads
protectedRouter.get("/leads", requirePermission("Leads: View"), asyncHandler(domain.listLeads));
protectedRouter.post(
  "/leads",
  requirePermission("Leads: Create"),
  validate(leadSchema),
  asyncHandler(domain.createLead),
);
protectedRouter.get(
  "/leads/:id",
  requirePermission("Leads: View"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getLead),
);
protectedRouter.patch(
  "/leads/:id",
  requirePermission("Leads: Edit"),
  validate(idParamSchema, "params"),
  validate(leadSchema.partial()),
  asyncHandler(domain.updateLead),
);
protectedRouter.delete(
  "/leads/:id",
  requireRole(["admin", "manager"]),
  validate(idParamSchema, "params"),
  asyncHandler(domain.deleteLead),
);
protectedRouter.post(
  "/leads/:id/activities",
  requirePermission("Leads: Create"),
  validate(idParamSchema, "params"),
  validate(leadActivitySchema),
  asyncHandler(domain.addLeadActivity),
);
protectedRouter.post(
  "/leads/:id/convert",
  requirePermission("Leads: Create"),
  validate(idParamSchema, "params"),
  validate(convertLeadSchema),
  asyncHandler(domain.convertLead),
);

// Customers
protectedRouter.get("/customers", requirePermission("Customers: View"), asyncHandler(domain.listCustomers));
protectedRouter.post(
  "/customers",
  requirePermission("Customers: Create"),
  validate(customerSchema),
  asyncHandler(domain.createCustomer),
);
protectedRouter.post(
  "/customers/from-lead/:leadId",
  requirePermission("Customers: Create"),
  validate(leadIdParamSchema, "params"),
  asyncHandler(domain.findOrCreateCustomerFromLead),
);
protectedRouter.get(
  "/customers/:id",
  requirePermission("Customers: View"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getCustomer),
);
protectedRouter.patch(
  "/customers/:id",
  requirePermission("Customers: Edit"),
  validate(idParamSchema, "params"),
  validate(customerSchema),
  asyncHandler(domain.updateCustomer),
);
protectedRouter.delete(
  "/customers/:id",
  requireRole(["admin", "manager"]),
  validate(idParamSchema, "params"),
  asyncHandler(domain.deleteCustomer),
);
protectedRouter.get(
  "/customers/:id/notes",
  requirePermission("Customers: View"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.listCustomerNotes),
);
protectedRouter.post(
  "/customers/:id/notes",
  requirePermission("Customers: Create"),
  validate(idParamSchema, "params"),
  validate(customerNoteSchema),
  asyncHandler(domain.createCustomerNote),
);
protectedRouter.delete(
  "/customers/notes/:noteId",
  requirePermission("Customers: Delete"),
  asyncHandler(domain.deleteCustomerNote),
);
protectedRouter.get(
  "/customers/:id/documents",
  requirePermission("Customers: View"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.listCustomerDocuments),
);
protectedRouter.post(
  "/customers/:id/documents",
  requirePermission("Customers: Create"),
  validate(idParamSchema, "params"),
  validate(customerDocumentSchema),
  asyncHandler(domain.createCustomerDocument),
);
protectedRouter.delete(
  "/customers/documents/:docId",
  requireRole(["admin", "manager"]),
  asyncHandler(domain.deleteCustomerDocument),
);
protectedRouter.get(
  "/customers/:id/ledger",
  requirePermission("Customers: View"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getCustomerLedger),
);

// Bookings
protectedRouter.get("/bookings", requirePermission("Bookings: View"), asyncHandler(domain.listBookings));
protectedRouter.post(
  "/bookings",
  requirePermission("Bookings: Create"),
  validate(bookingSchema),
  asyncHandler(domain.createBooking),
);
protectedRouter.get(
  "/bookings/:id",
  requirePermission("Bookings: View"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getBooking),
);
protectedRouter.get(
  "/bookings/:id/activities",
  requirePermission("Bookings: View"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getBookingActivities),
);
protectedRouter.patch(
  "/bookings/:id",
  requirePermission("Bookings: Edit"),
  validate(idParamSchema, "params"),
  validate(bookingSchema),
  asyncHandler(domain.updateBooking),
);
protectedRouter.delete(
  "/bookings/:id",
  requirePermission("Bookings: Delete"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.deleteBooking),
);

// Suppliers
protectedRouter.get("/suppliers", requirePermission("Suppliers: View"), asyncHandler(domain.listSuppliers));
protectedRouter.post(
  "/suppliers",
  requirePermission("Suppliers: Create"),
  validate(supplierSchema),
  asyncHandler(domain.createSupplier),
);
protectedRouter.get(
  "/suppliers/:id",
  requirePermission("Suppliers: View"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getSupplier),
);
protectedRouter.patch(
  "/suppliers/:id",
  requirePermission("Suppliers: Edit"),
  validate(idParamSchema, "params"),
  validate(supplierSchema),
  asyncHandler(domain.updateSupplier),
);
protectedRouter.delete(
  "/suppliers/:id",
  requirePermission("Suppliers: Delete"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.deleteSupplier),
);

// Branches
protectedRouter.get(
  "/branches",
  requirePermission("Branches: Access All"),
  asyncHandler(domain.listBranches),
);
protectedRouter.post(
  "/branches",
  requirePermission("Branches: Access All"),
  validate(branchSchema),
  asyncHandler(domain.createBranch),
);
protectedRouter.get(
  "/branches/:id",
  requirePermission("Branches: Access All"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getBranch),
);
protectedRouter.patch(
  "/branches/:id",
  requirePermission("Branches: Access All"),
  validate(idParamSchema, "params"),
  validate(branchSchema),
  asyncHandler(domain.updateBranch),
);

// Users — /agents must come BEFORE /:id to avoid route collision
protectedRouter.get("/users/agents", requirePermission("Users: View"), asyncHandler(domain.listAgents));
protectedRouter.get(
  "/users",
  requirePermission("Users: View"),
  asyncHandler(domain.listUsers),
);
protectedRouter.post(
  "/users",
  requirePermission("Users: Create"),
  validate(userSchema),
  asyncHandler(domain.createUser),
);
protectedRouter.get(
  "/users/:id",
  requirePermission("Users: View"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getUser),
);
protectedRouter.patch(
  "/users/:id",
  requirePermission("Users: Edit"),
  validate(idParamSchema, "params"),
  validate(userSchema),
  asyncHandler(domain.updateUser),
);
protectedRouter.delete(
  "/users/:id",
  requirePermission("Users: Delete"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.deleteUser),
);

// Expenses
protectedRouter.get(
  "/expenses",
  requirePermission("Expenses: View"),
  asyncHandler(domain.listExpenses),
);
protectedRouter.post(
  "/expenses",
  requirePermission("Expenses: Create"),
  validate(expenseSchema),
  asyncHandler(domain.createExpense),
);
protectedRouter.get(
  "/expenses/:id",
  requirePermission("Expenses: View"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getExpense),
);
protectedRouter.patch(
  "/expenses/:id",
  requirePermission("Expenses: Edit"),
  validate(idParamSchema, "params"),
  validate(expenseSchema),
  asyncHandler(domain.updateExpense),
);
protectedRouter.delete(
  "/expenses/:id",
  requirePermission("Expenses: Delete"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.deleteExpense),
);

// Roles
protectedRouter.get(
  "/roles",
  requireRole(["admin", "manager"]),
  asyncHandler(domain.listRoles),
);
protectedRouter.post(
  "/roles",
  requireRole(["admin"]),
  validate(createRoleSchema),
  asyncHandler(domain.createRole),
);
protectedRouter.patch(
  "/roles/:roleId/permissions",
  requireRole(["admin"]),
  validate(roleIdParamSchema, "params"),
  validate(rolePermissionsSchema),
  asyncHandler(domain.updateRolePermissions),
);
protectedRouter.delete(
  "/roles/:roleId",
  requireRole(["admin"]),
  validate(roleIdParamSchema, "params"),
  asyncHandler(domain.deleteRole),
);

// Supplier Payments
protectedRouter.post(
  "/suppliers/:id/payments",
  requirePermission("Suppliers: Create"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.recordSupplierPayment),
);
protectedRouter.get(
  "/suppliers/:id/statement",
  requirePermission("Suppliers: View"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getSupplierStatement),
);

// Receipts (Customer Payments)
protectedRouter.get("/receipts", requirePermission("Expenses: View"), asyncHandler(domain.listReceipts));
protectedRouter.post("/receipts", requirePermission("Expenses: Create"), asyncHandler(domain.createReceipt));

// Booking Documents
protectedRouter.get(
  "/bookings/:id/documents",
  requirePermission("Bookings: View"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.listBookingDocuments),
);
protectedRouter.post(
  "/bookings/:id/documents",
  requirePermission("Bookings: Create"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.createBookingDocument),
);
protectedRouter.delete(
  "/bookings/documents/:docId",
  requirePermission("Bookings: Delete"),
  asyncHandler(domain.deleteBookingDocument),
);

router.use(protectedRouter);

// Quotations
protectedRouter.use("/quotations", quotationsRouter);
protectedRouter.use("/templates", templateRouter);
protectedRouter.use("/settings", settingsRouter);
protectedRouter.use("/notifications", notificationsRouter);
protectedRouter.use("/invoices", invoicesRouter);

export default router;
