import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb"
    }
  },
  proxyClientMaxBodySize: "30mb",
  images: {
    remotePatterns: []
  }
};

export default nextConfig;
