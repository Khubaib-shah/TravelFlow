import { User, TokenBlacklist } from "../models";
import { ApiError } from "../utils/ApiError";
import { signToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { toJSON } from "../utils/serialize";

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false }).select("+password");
  if (!user || user.status !== "active") {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = signToken({
    userId: String(user._id),
    agencyId: String(user.agencyId),
    email: user.email,
    role: user.role,
  });

  const refreshToken = signRefreshToken({ userId: String(user._id) });

  const safeUser = await User.findById(user._id);
  return { accessToken, refreshToken, user: toJSON(safeUser!.toObject()) };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await User.findOne({ _id: payload.userId, isDeleted: false, status: "active" });
  if (!user) {
    throw ApiError.unauthorized("User not found or inactive");
  }

  const newAccessToken = signToken({
    userId: String(user._id),
    agencyId: String(user.agencyId),
    email: user.email,
    role: user.role,
  });

  const newRefreshToken = signRefreshToken({ userId: String(user._id) });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(accessToken?: string) {
  if (accessToken) {
    try {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Tokens live max 15m
      await TokenBlacklist.create({ token: accessToken, expiresAt }).catch(() => {});
    } catch {}
  }
  return { success: true };
}

export async function getMe(userId: string) {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) throw ApiError.notFound("User");
  return toJSON(user.toObject());
}
