import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import { prisma } from "../lib/prisma.js";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
  );
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as AuthUser;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = extractToken(req);
  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return next(new ApiError(401, "Invalid session"));
    }
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

export async function requireModerator(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }
  if (req.user.role !== "ADMIN" && req.user.role !== "MODERATOR") {
    return next(new ApiError(403, "Moderator access required"));
  }
  next();
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  const cookie = (req as Request & { cookies?: Record<string, string> }).cookies
    ?.token;
  return cookie || null;
}
