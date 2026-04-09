import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: ".next",
  images: {
    unoptimized: true,
  },
  env: {
    GEMINI_API_KEY: "AIzaSyBD3QycLZuyJA500YKXYyYeUcuv7x6P6Lw",
  },
};

export default nextConfig;
