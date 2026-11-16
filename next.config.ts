import type { NextConfig } from "next";

// Same source as sanity/env.ts, so switching projects is an env change only.
const sanityProjectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "eiuo7osi";

const nextConfig: NextConfig = {
  // CI builds once on GitHub and ships .next/standalone to EC2 (see deploy/),
  // so the server never runs `npm ci` or `next build` next to the live app.
  output: "standalone",
  images: {
    // Blog covers, author photos and inline article images live on Sanity's
    // CDN. Scoped to this project's path so the optimizer can't be pointed at
    // arbitrary third-party images.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: `/images/${sanityProjectId}/**`,
      },
    ],
  },
};

export default nextConfig;
