import type { NextConfig } from "next";

/**
 * The browser always talks to the Next origin and Next forwards to the API.
 * This keeps requests same-origin, so the app works from any host without CORS.
 */
const apiOrigin = process.env.API_PROXY_ORIGIN || "http://localhost:5000";

const nextConfig: NextConfig = {
  // Isolated builds (e.g. NEXT_DIST_DIR=.next-verify) must not overwrite the
  // live systemd `.next` output.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
