import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middleware/auth.middleware";
import * as invoiceController from "../controllers/invoice.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", asyncHandler(invoiceController.listInvoices));
router.get("/:id", asyncHandler(invoiceController.getInvoice));
router.post("/from-booking/:bookingId", asyncHandler(invoiceController.generateInvoiceFromBooking));
router.post("/:id/mark-paid", asyncHandler(invoiceController.markInvoicePaid));

export default router;
