import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.130.197.249"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;