import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// next-pwa uses webpack, which conflicts with Turbopack in dev.
// Only wrap with PWA in production builds.
const buildConfig = async (): Promise<NextConfig> => {
  const base: NextConfig = {
    reactStrictMode: true,
    turbopack: {},
  };

  if (isDev) return base;

  const withPWA = (await import("next-pwa")).default;
  return withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
  })(base);
};

export default buildConfig();
