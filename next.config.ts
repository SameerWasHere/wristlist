import type { NextConfig } from "next";
import path from "node:path";

const AUTH_DISABLED = process.env.NEXT_PUBLIC_DISABLE_AUTH === "1";

const nextConfig: NextConfig = {
  // When NEXT_PUBLIC_DISABLE_AUTH=1 (set only in .env.local for Claude Preview),
  // swap @clerk/nextjs and @clerk/nextjs/server for local stubs so the site
  // renders without Clerk's cross-origin accounts.dev script injection.
  ...(AUTH_DISABLED && {
    turbopack: {
      // Turbopack resolves these relative to the project root.
      resolveAlias: {
        "@clerk/nextjs": "./lib/clerk-stub/client.tsx",
        "@clerk/nextjs/server": "./lib/clerk-stub/server.ts",
      },
    },
    webpack: (config) => {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@clerk/nextjs": path.resolve(__dirname, "lib/clerk-stub/client.tsx"),
        "@clerk/nextjs/server": path.resolve(__dirname, "lib/clerk-stub/server.ts"),
      };
      return config;
    },
  }),
};

export default nextConfig;
