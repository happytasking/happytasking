import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import { signToken, type AuthUser } from "../middleware/auth.middleware.js";
import { listUserCompanies } from "./company.service.js";
import { recordAuthEvent } from "./visit.service.js";
import type { RequestMeta } from "../lib/requestMeta.js";

export const registerSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric"),
  password: z.string().min(8).max(100),
  displayName: z.string().min(1).max(80).optional(),
  country: z.string().max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerUser(
  input: z.infer<typeof registerSchema>,
  meta?: RequestMeta,
) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email.toLowerCase() }, { username: input.username }],
    },
  });
  if (existing) {
    throw new ApiError(409, "Email or username already in use");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      username: input.username,
      displayName: input.displayName || input.username,
      passwordHash,
      country: input.country,
    },
  });

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  await recordAuthEvent(
    "signup_completed",
    user.id,
    meta ?? { ip: "unknown", userAgent: null },
  );

  return {
    user: { ...publicUser(user), companies: [] },
    token: signToken(authUser),
  };
}

export async function loginUser(
  input: z.infer<typeof loginSchema>,
  meta?: RequestMeta,
) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new ApiError(401, "Invalid email or password");
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  await recordAuthEvent(
    "login_succeeded",
    user.id,
    meta ?? { ip: "unknown", userAgent: null },
  );

  return {
    user: { ...publicUser(user), companies: await listUserCompanies(user.id) },
    token: signToken(authUser),
  };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(404, "User not found");
  return { ...publicUser(user), companies: await listUserCompanies(id) };
}

function publicUser(user: {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  country: string | null;
  countryCode: string | null;
  role: string;
  contributionScore: number;
  trustLevel: number;
  publicProfileEnabled: boolean;
  createdAt: Date;
  onboardingCompletedAt: Date | null;
  onboardingStartedAt: Date | null;
  onboardingVersion: number | null;
  activatedAt: Date | null;
}) {
  const needsOnboarding = user.role === "USER" && !user.onboardingCompletedAt;
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    country: user.country,
    countryCode: user.countryCode,
    role: user.role,
    contributionScore: user.contributionScore,
    trustLevel: user.trustLevel,
    publicProfileEnabled: user.publicProfileEnabled,
    createdAt: user.createdAt,
    onboardingCompletedAt: user.onboardingCompletedAt,
    onboardingStartedAt: user.onboardingStartedAt,
    onboardingVersion: user.onboardingVersion,
    activatedAt: user.activatedAt,
    needsOnboarding,
  };
}
