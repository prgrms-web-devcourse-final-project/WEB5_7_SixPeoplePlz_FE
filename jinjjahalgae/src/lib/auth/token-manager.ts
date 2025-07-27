/**
 * 토큰 관리자
 * - 액세스 토큰과 리프레시 토큰의 저장/조회/삭제
 * - localStorage 기반 토큰 관리
 */

export const tokenManager = {
  // 액세스 토큰 관련
  getAccessToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  },

  setAccessToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  },

  removeAccessToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
  },

  // 리프레시 토큰 관련
  getRefreshToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  },

  setRefreshToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("refreshToken", token);
    }
  },

  removeRefreshToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("refreshToken");
    }
  },

  // 모든 토큰 정리
  clearAllTokens: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  // 토큰 존재 여부 확인
  hasTokens: (): boolean => {
    return !!(tokenManager.getAccessToken() && tokenManager.getRefreshToken());
  },
};
