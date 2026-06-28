import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(frontendRoot, "..");

function wpImageRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    {
      protocol: "http",
      hostname: "localhost",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "localhost",
      pathname: "/**",
    },
  ];

  const apiUrl = process.env.WORDPRESS_API_URL;
  if (apiUrl) {
    try {
      const { protocol, hostname } = new URL(apiUrl);
      const normalizedProtocol = protocol.replace(":", "") as "http" | "https";
      if (hostname && !patterns.some((pattern) => pattern.hostname === hostname)) {
        patterns.push({
          protocol: normalizedProtocol,
          hostname,
          pathname: "/**",
        });
      }
    } catch {
      /* ignore invalid URL */
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
  },
  images: {
    remotePatterns: wpImageRemotePatterns(),
  },
};

export default nextConfig;
