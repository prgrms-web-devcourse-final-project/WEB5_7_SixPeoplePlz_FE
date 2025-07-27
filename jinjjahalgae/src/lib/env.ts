/**
 * 환경 설정 유틸리티
 * 환경변수 기반으로 앱 설정을 관리
 */

export const envConfig = {
  // API 설정
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
    isMockEnabled: process.env.NEXT_PUBLIC_MOCK_API === "true",
  },

  // OAuth 설정
  oauth: {
    kakao: {
      clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "",
    },
    naver: {
      clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "",
    },
  },

  // 파일 업로드 설정
  upload: {
    maxFileSize: parseInt(
      process.env.NEXT_PUBLIC_FILE_UPLOAD_MAX_SIZE || "10485760"
    ), // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },

  // AWS S3 설정
  s3: {
    baseUrl:
      process.env.NEXT_PUBLIC_S3_BASE_URL ||
      "https://your-s3-bucket.s3.amazonaws.com",
  },

  // CloudFront 이미지 서버 설정
  image: {
    baseUrl: "https://d1qzpg7izxuhtn.cloudfront.net",
  },

  // 개발 환경 설정
  dev: {
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
  },
};

// 환경 설정 검증
export const validateEnvConfig = () => {
  const errors: string[] = [];

  if (!envConfig.api.baseUrl) {
    errors.push("NEXT_PUBLIC_API_URL is required");
  }

  if (envConfig.api.isMockEnabled && !envConfig.dev.isDevelopment) {
    console.warn("⚠️ MSW is enabled in production environment");
  }

  if (errors.length > 0) {
    throw new Error(`Environment configuration errors:\n${errors.join("\n")}`);
  }
};

// 디버그 정보 출력
export const logEnvInfo = () => {
  if (envConfig.dev.isDevelopment) {
    console.log("🌍 Environment Configuration:");
    console.log("- API Base URL:", envConfig.api.baseUrl);
    console.log("- Mock API Enabled:", envConfig.api.isMockEnabled);
    console.log("- Environment:", process.env.NODE_ENV);
  }
};

// CloudFront 이미지 URL 생성 유틸리티
export const getImageUrl = (imageKey?: string) => {
  if (!imageKey || imageKey === "null" || imageKey === "undefined") return "";

  // null/이나 undefined/ 등이 포함된 경우 제거
  const cleanKey = imageKey.replace(/^(null|undefined)\//, "");

  // 빈 문자열이 되면 빈 문자열 반환
  if (!cleanKey) return "";

  return `${envConfig.image.baseUrl}/${cleanKey}`;
};
