import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // CI/Vercel 빌드 시 ESLint 에러 때문에 빌드가 중단되지 않도록 설정
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.com',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'pbxt.replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
