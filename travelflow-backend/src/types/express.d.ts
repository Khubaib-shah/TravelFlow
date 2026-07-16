import type { IUser } from "../models/User.model";

/**
 * Shared augmentation of Express's Request interface.
 * Avoids the duplicated local `AuthenticatedRequest` type that existed
 * in auth.middleware.ts, role.middleware.ts, domain.controller.ts and auth.controller.ts.
 */
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      agencyId?: string;
    }
  }
}

export {};
