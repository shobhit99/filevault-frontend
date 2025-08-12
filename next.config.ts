import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove proxy rewrites to avoid conflicts with direct API calls
  // The frontend will make direct calls to the Django backend
};

export default nextConfig;
