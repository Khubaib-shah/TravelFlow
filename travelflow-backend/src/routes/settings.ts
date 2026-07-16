import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middleware/auth.middleware";
import { tenantMiddleware } from "../middleware/tenant.middleware";
import { requireRole } from "../middleware/role.middleware";
import * as settings from "../controllers/settings.controller";

const router = Router();

router.use(authMiddleware, tenantMiddleware, requireRole(["admin", "manager"]));

router.get("/", asyncHandler(settings.getSettings));
router.patch("/", asyncHandler(settings.updateSettings));

export default router;
