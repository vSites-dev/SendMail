import "./src/env.js";
import type { NextConfig } from "next";

const config: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
      },
      {
        hostname: "lh3.googleusercontent.com",
      },
      {
        hostname: "picsum.photos",
      },
      {
        hostname: "localhost",
        port: "8080",
      },
    ],
  },
};

export default config;
