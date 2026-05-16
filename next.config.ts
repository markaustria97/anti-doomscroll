import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    "/api/copilot/challenge": ["./node_modules/@github/copilot-linux-x64/**/*"],
    "/api/copilot/challenges/generate": [
      "./node_modules/@github/copilot-linux-x64/**/*",
    ],
    "/api/copilot/challenges/review": [
      "./node_modules/@github/copilot-linux-x64/**/*",
    ],
  },
};

export default withSerwist(nextConfig);
