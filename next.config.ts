import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // Remove webpack config since we're using dynamic imports for server actions
  // and Next.js handles the bundling automatically

};

export default nextConfig;
