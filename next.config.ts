import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors
  },
};

export default nextConfig;
