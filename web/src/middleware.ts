import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isPrivatePath } from "@/lib/indexability";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (isPrivatePath(request.nextUrl.pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

/** Matcher must be a static literal for Next.js. Keep in sync with PRIVATE_PREFIXES. */
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
