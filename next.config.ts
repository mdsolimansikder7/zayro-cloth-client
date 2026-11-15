import type { NextConfig } from "next";

const backendUrl = (process.env.BACKEND_URL ?? "https://zayro-server.vercel.app")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        // Google profile photos (OAuth)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // GitHub avatars (optional for future)
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
      },
      {
        protocol: "https",
        hostname: "pub-9a3dc5b1868f449dae974281c69d556b.r2.dev",
      },
    ],
  },
};

export default nextConfig;
