import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output: prerequisite for the future self-hosted k3s track (ADR-0005)
  output: "standalone",
  transpilePackages: ["@gabriel/ui"],
};

export default nextConfig;
