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
protectedRouter.get("/leads", asyncHandler(domain.listLeads));
protectedRouter.post(
  "/leads",
  validate(leadSchema),
  asyncHandler(domain.createLead),
);
protectedRouter.get(
  "/leads/:id",
  validate(idParamSchema, "params"),
  asyncHandler(domain.getLead),
);
protectedRouter.patch(
  "/leads/:id",
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
  validate(idParamSchema, "params"),
  validate(leadActivitySchema),
  asyncHandler(domain.addLeadActivity),
);
protectedRouter.post(
  "/leads/:id/convert",
  validate(idParamSchema, "params"),
  validate(convertLeadSchema),
  asyncHandler(domain.convertLead),
);

// Customers
protectedRouter.get("/customers", asyncHandler(domain.listCustomers));
protectedRouter.post(
  "/customers",
  validate(customerSchema),
  asyncHandler(domain.createCustomer),
);
protectedRouter.post(
  "/customers/from-lead/:leadId",
  validate(leadIdParamSchema, "params"),
  asyncHandler(domain.findOrCreateCustomerFromLead),
);
protectedRouter.get(
  "/customers/:id",
  validate(idParamSchema, "params"),
  asyncHandler(domain.getCustomer),
);
protectedRouter.patch(
  "/customers/:id",
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
  validate(idParamSchema, "params"),
  asyncHandler(domain.listCustomerNotes),
);
protectedRouter.post(
  "/customers/:id/notes",
  validate(idParamSchema, "params"),
  validate(customerNoteSchema),
  asyncHandler(domain.createCustomerNote),
);
protectedRouter.delete(
  "/customers/notes/:noteId",
  asyncHandler(domain.deleteCustomerNote),
);
protectedRouter.get(
  "/customers/:id/documents",
  validate(idParamSchema, "params"),
  asyncHandler(domain.listCustomerDocuments),
);
protectedRouter.post(
  "/customers/:id/documents",
  validate(idParamSchema, "params"),
  validate(customerDocumentSchema),
  asyncHandler(domain.createCustomerDocument),
);
protectedRouter.delete(
  "/customers/documents/:docId",
  requireRole(["admin", "manager"]),
  asyncHandler(domain.deleteCustomerDocument),
);

// Bookings
protectedRouter.get("/bookings", asyncHandler(domain.listBookings));
protectedRouter.post(
  "/bookings",
  validate(bookingSchema),
  asyncHandler(domain.createBooking),
);
protectedRouter.get(
  "/bookings/:id",
  validate(idParamSchema, "params"),
  asyncHandler(domain.getBooking),
);
protectedRouter.patch(
  "/bookings/:id",
  validate(idParamSchema, "params"),
  validate(bookingSchema),
  asyncHandler(domain.updateBooking),
);
protectedRouter.delete(
  "/bookings/:id",
  validate(idParamSchema, "params"),
  asyncHandler(domain.deleteBooking),
);

// Suppliers
protectedRouter.get("/suppliers", asyncHandler(domain.listSuppliers));
protectedRouter.post(
  "/suppliers",
  validate(supplierSchema),
  asyncHandler(domain.createSupplier),
);
protectedRouter.get(
  "/suppliers/:id",
  validate(idParamSchema, "params"),
  asyncHandler(domain.getSupplier),
);
protectedRouter.patch(
  "/suppliers/:id",
  validate(idParamSchema, "params"),
  validate(supplierSchema),
  asyncHandler(domain.updateSupplier),
);
protectedRouter.delete(
  "/suppliers/:id",
  validate(idParamSchema, "params"),
  asyncHandler(domain.deleteSupplier),
);

// Branches
protectedRouter.get(
  "/branches",
  requirePermission("All Branches"),
  asyncHandler(domain.listBranches),
);
protectedRouter.post(
  "/branches",
  requirePermission("All Branches"),
  validate(branchSchema),
  asyncHandler(domain.createBranch),
);
protectedRouter.get(
  "/branches/:id",
  requirePermission("All Branches"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getBranch),
);
protectedRouter.patch(
  "/branches/:id",
  requirePermission("All Branches"),
  validate(idParamSchema, "params"),
  validate(branchSchema),
  asyncHandler(domain.updateBranch),
);

// Users — /agents must come BEFORE /:id to avoid route collision
protectedRouter.get("/users/agents", asyncHandler(domain.listAgents));
protectedRouter.get(
  "/users",
  requirePermission("Manage Users"),
  asyncHandler(domain.listUsers),
);
protectedRouter.post(
  "/users",
  requirePermission("Manage Users"),
  validate(userSchema),
  asyncHandler(domain.createUser),
);
protectedRouter.get(
  "/users/:id",
  requirePermission("Manage Users"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getUser),
);
protectedRouter.patch(
  "/users/:id",
  requirePermission("Manage Users"),
  validate(idParamSchema, "params"),
  validate(userSchema),
  asyncHandler(domain.updateUser),
);
protectedRouter.delete(
  "/users/:id",
  requirePermission("Manage Users"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.deleteUser),
);

// Expenses
protectedRouter.get(
  "/expenses",
  requirePermission("Manage Expenses"),
  asyncHandler(domain.listExpenses),
);
protectedRouter.post(
  "/expenses",
  requirePermission("Manage Expenses"),
  validate(expenseSchema),
  asyncHandler(domain.createExpense),
);
protectedRouter.get(
  "/expenses/:id",
  requirePermission("Manage Expenses"),
  validate(idParamSchema, "params"),
  asyncHandler(domain.getExpense),
);
protectedRouter.patch(
  "/expenses/:id",
  requirePermission("Manage Expenses"),
  validate(idParamSchema, "params"),
  validate(expenseSchema),
  asyncHandler(domain.updateExpense),
);
protectedRouter.delete(
  "/expenses/:id",
  requirePermission("Manage Expenses"),
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
  validate(idParamSchema, "params"),
  asyncHandler(domain.recordSupplierPayment),
);

// Receipts (Customer Payments)
protectedRouter.get("/receipts", asyncHandler(domain.listReceipts));
protectedRouter.post("/receipts", asyncHandler(domain.createReceipt));

// Booking Documents
protectedRouter.get(
  "/bookings/:id/documents",
  validate(idParamSchema, "params"),
  asyncHandler(domain.listBookingDocuments),
);
protectedRouter.post(
  "/bookings/:id/documents",
  validate(idParamSchema, "params"),
  asyncHandler(domain.createBookingDocument),
);
protectedRouter.delete(
  "/bookings/documents/:docId",
  asyncHandler(domain.deleteBookingDocument),
);

router.use(protectedRouter);

// Quotations
router.use("/quotations", quotationsRouter);

export default router;
