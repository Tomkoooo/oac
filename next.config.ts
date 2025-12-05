import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker builds
  reactCompiler: true,
};

export default nextConfig;
