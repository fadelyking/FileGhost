import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb"
    }
  },
  images: {
    remotePatterns: []
  }
};

export default nextConfig;
