import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // MSW 관련 설정: 서버 사이드에서 MSW 모듈 제외
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("msw/node");
    }

    return config;
  },
};

export default nextConfig;
