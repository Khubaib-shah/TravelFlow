import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import type { UserRole } from "../models/User.model";
import { Role } from "../models/Role.model";

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("Insufficient permissions"));
    }
    next();
  };
}

export function requirePermission(requiredPermission: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.agencyId) {
        return next(ApiError.unauthorized());
      }
      // If user is admin, allow all by default
      if (req.user.role === "admin") {
        return next();
      }

      // Fetch the role for this user
      const role = await Role.findOne({ agencyId: req.agencyId, name: req.user.role });
      if (!role) {
        return next(ApiError.forbidden("Role not found"));
      }

      if (!role.permissions.includes(requiredPermission)) {
        return next(ApiError.forbidden(`Requires permission: ${requiredPermission}`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
