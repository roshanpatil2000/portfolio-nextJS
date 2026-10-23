import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Dev only: mirror all browser console output to the `npm run dev` terminal
  // (default is warnings/errors only), so `[mixpanel] …` event logs show there.
  logging: { browserToTerminal: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
