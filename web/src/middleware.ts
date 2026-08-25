import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Private or account surfaces — keep them out of the index. Public pages are left indexable. */
const PRIVATE_PREFIXES = [
  "/login",
  "/register",
  "/onboarding",
  "/profile",
  "/moderation",
  "/taskmatch/profile",
  "/reviews/new",
  "/issues/new",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivate = PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const response = NextResponse.next();
  if (isPrivate) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/onboarding",
    "/onboarding/:path*",
    "/profile",
    "/profile/:path*",
    "/moderation",
    "/moderation/:path*",
    "/taskmatch/profile",
    "/reviews/new",
    "/issues/new",
  ],
};
