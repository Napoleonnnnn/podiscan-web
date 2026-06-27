import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.117.95.21"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;