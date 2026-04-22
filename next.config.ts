import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    "@github/copilot",
    "@github/copilot-sdk",
    "@github/copilot-linux-x64",
    "@github/copilot-linux-arm64",
  ],
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/@github/copilot/**/*",
      "./node_modules/@github/copilot-sdk/**/*",
      "./node_modules/@github/copilot-linux-x64/**/*",
      "./node_modules/@github/copilot-linux-arm64/**/*",
    ],
  },
};

export default withSerwist(nextConfig);
