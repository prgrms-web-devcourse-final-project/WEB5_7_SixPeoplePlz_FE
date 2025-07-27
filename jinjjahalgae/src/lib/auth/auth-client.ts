/**
 * 통합 인증 클라이언트
 * - API 클라이언트 통합 관리
 * - 토큰 자동 관리 및 리프레시
 * - 일관된 에러 핸들링
 */

import { Api } from "../../../docs/Api";
import { envConfig } from "../env";
import { tokenManager } from "./token-manager";

// API 클라이언트 싱글톤 인스턴스
let apiClientInstance: Api<string> | null = null;

/**
 * 토큰을 Authorization 헤더에 자동으로 추가하는 securityWorker
 */
const securityWorker = async (securityData: string | null) => {
  const token = tokenManager.getAccessToken();

  if (!token) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * 통합 API 클라이언트 인스턴스 생성/반환
 */
export const getApiClient = (): Api<string> => {
  if (!apiClientInstance) {
    apiClientInstance = new Api<string>({
      baseUrl: envConfig.api.baseUrl,
      securityWorker,
      customFetch: async (...args) => {
        const [url] = args;
        const response = await fetch(...args);

        console.log(`🌐 API 요청: ${url} -> ${response.status}`);

        // 401 에러 시 토큰 리프레시 시도
        if (response.status === 401) {
          console.log("🔒 401 오류 감지, 토큰 리프레시 시도");
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            console.log("🔄 토큰 리프레시 성공, 요청 재시도");
            // 새로운 토큰으로 재요청
            const [url, options] = args;
            const newOptions = {
              ...options,
              headers: {
                ...options?.headers,
                Authorization: `Bearer ${tokenManager.getAccessToken()}`,
              },
            };
            const retryResponse = await fetch(url, newOptions);
            console.log(`🔄 재시도 결과: ${retryResponse.status}`);
            return retryResponse;
          } else {
            console.log("❌ 토큰 리프레시 실패, 로그인 페이지로 이동");
            // 리프레시 실패 시에만 로그인 페이지로 이동
            handleAuthError();
          }
        }

        // 403 에러 시 로그인 페이지로 리다이렉션
        if (response.status === 403) {
          console.log("🚫 403 오류 감지, 로그인 페이지로 이동");
          handleAuthError();
        }

        return response;
      },
    });
  }

  return apiClientInstance;
};

/**
 * 토큰 리프레시 함수
 */
const refreshAccessToken = async (): Promise<boolean> => {
  console.log("🔄 토큰 리프레시 시도 중...");
  const refreshToken = tokenManager.getRefreshToken();

  if (!refreshToken) {
    console.log("❌ 리프레시 토큰이 없습니다");
    return false;
  }

  try {
    console.log("📡 리프레시 API 호출 중...");
    const response = await fetch(`${envConfig.api.baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    console.log("📥 리프레시 응답 상태:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("📦 리프레시 응답 데이터:", data);

      // MSW 환경에서는 result 객체 안에 토큰이 있음
      const accessToken = data.result?.accessToken || data.accessToken;
      const newRefreshToken = data.result?.refreshToken || data.refreshToken;

      if (accessToken) {
        console.log("💾 새로운 토큰 저장 중...");
        tokenManager.setAccessToken(accessToken);
        if (newRefreshToken) {
          tokenManager.setRefreshToken(newRefreshToken);
        }
        console.log("✅ 토큰 리프레시 성공");
        return true;
      } else {
        console.log("❌ 응답에 액세스 토큰이 없습니다");
      }
    } else {
      console.log("❌ 리프레시 요청 실패:", response.status);
    }
  } catch (error) {
    console.error("❌ 토큰 리프레시 오류:", error);
  }

  return false;
};

/**
 * 인증 에러 처리 (401, 403)
 */
const handleAuthError = () => {
  console.log("🚨 인증 에러 처리 시작");
  // 토큰 정리
  tokenManager.removeAccessToken();
  tokenManager.removeRefreshToken();

  // 현재 페이지를 redirect 파라미터로 추가
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    const redirectParam =
      currentPath !== "/" ? `?redirect=${encodeURIComponent(currentPath)}` : "";
    console.log(`🏃 로그인 페이지로 리다이렉트: /auth${redirectParam}`);
    window.location.href = `/auth${redirectParam}`;
  }
};

/**
 * API 클라이언트 인스턴스 재생성 (토큰 변경 시)
 */
export const resetApiClient = () => {
  apiClientInstance = null;
};
