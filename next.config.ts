import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native SQLite driver must not be bundled.
  serverExternalPackages: ["@libsql/client", "libsql"],
};

export default nextConfig;
