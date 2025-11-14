import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    domains: ["kld-election-system.s3.ap-southeast-2.amazonaws.com"],
  },
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
