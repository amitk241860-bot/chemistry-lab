import path from "path";
import type { NextConfig } from "next";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  // Pin tracing root to project folder so Next.js does not walk up into
  // unreadable Android Termux ancestor directories (/data/data, /data, /)
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "/data/data/**",
          "/data/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
