import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import type { IUser } from "../models/User.model";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

type AuthenticatedRequest = Request & {
  user?: IUser;
  agencyId?: string;
};

export async function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    // Read access token from HttpOnly cookie
    const token = req.cookies?.tf_access_token as string | undefined;

    if (!token) {
      throw ApiError.unauthorized("Authentication required");
    }

    const payload = verifyToken(token);
    const user = await User.findOne({
      _id: payload.userId,
      agencyId: payload.agencyId,
      isDeleted: false,
      status: "active",
    });

    if (!user) {
      throw ApiError.unauthorized("Invalid or expired token");
    }

    req.user = user;
    req.agencyId = String(user.agencyId);
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      next(err);
      return;
    }
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

