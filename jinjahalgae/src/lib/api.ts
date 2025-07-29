/**
 * API 클라이언트 설정 및 공통 함수
 * @deprecated 이 파일은 deprecated 되었습니다.
 * 새로운 통합 auth 시스템을 사용하세요: @/lib/auth
 *
 * - 기본 API 설정
 * - 토큰 관리
 * - 에러 핸들링
 * - API 호출 배칭 처리
 */

import { envConfig } from "./env";
import { batchManager } from "./api/batch-manager";

const API_BASE_URL = envConfig.api.baseUrl;

// @deprecated src/lib/auth/token-manager.ts 사용
export const tokenManager = {
  getAccessToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  },

  setAccessToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  },

  removeAccessToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
  },

  getRefreshToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  },

  setRefreshToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("refreshToken", token);
    }
  },

  removeRefreshToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("refreshToken");
    }
  },
};

// @deprecated src/lib/auth/auth-client.ts의 getApiClient() 사용
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = tokenManager.getAccessToken();

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const url = `${API_BASE_URL}/api${endpoint}`;
  const method = options.method || 'GET';
  
  // 요청 키 생성
  const requestKey = batchManager.generateRequestKey(
    url,
    method,
    options.body,
    undefined
  );

  // 배칭 처리로 실제 요청 실행
  const response = await batchManager.executeBatchRequest(requestKey, () => 
    fetch(url, config)
  );

  // Response 객체를 clone하여 사용 (body stream 중복 읽기 방지)
  const clonedResponse = response instanceof Response ? response.clone() : response;

  // 401 에러 시 토큰 리프레시 시도
  if (clonedResponse.status === 401) {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const accessToken = refreshData.result?.accessToken || refreshData.accessToken;
          const newRefreshToken = refreshData.result?.refreshToken || refreshData.refreshToken;

          if (accessToken) {
            tokenManager.setAccessToken(accessToken);
            if (newRefreshToken) {
              tokenManager.setRefreshToken(newRefreshToken);
            }

            // 새로운 토큰으로 재요청
            const newConfig = {
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${accessToken}`,
              },
            };

            const retryResponse = await batchManager.executeBatchRequest(requestKey, () => 
              fetch(url, newConfig)
            );

            const retryClonedResponse = retryResponse instanceof Response ? retryResponse.clone() : retryResponse;

            if (retryClonedResponse.ok) {
              if (retryClonedResponse.status === 204) {
                return {} as T;
              }
              return retryClonedResponse.json();
            }
          }
        }
      } catch (refreshError) {
        console.error("❌ 토큰 리프레시 실패:", refreshError);
      }
    }

    // 리프레시 실패 시 로그인 페이지로 리다이렉션
    tokenManager.removeAccessToken();
    tokenManager.removeRefreshToken();
    
    // retry.ts가 작동할 수 있도록 에러를 throw
    throw new Error("인증이 만료되었습니다. 페이지를 새로고침해주세요.");
    
    // 아래 코드는 실행되지 않음 (에러 throw로 인해)
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const redirectParam = currentPath !== "/" ? `?redirect=${encodeURIComponent(currentPath)}` : "";
      window.location.href = `/auth${redirectParam}`;
    }
  }
  
  // 일반 오류 처리
  if (!clonedResponse.ok) {
    // 오류 응답에서 메시지를 파싱 시도
    let errorMessage = `API Error: ${clonedResponse.status}`;
    
    try {
      const errorData = await clonedResponse.json();
      if (errorData && typeof errorData === 'object' && 'message' in errorData) {
        errorMessage = errorData.message;
      }
    } catch (parseError) {
      // JSON 파싱 실패 시 기본 오류 메시지 사용
    }
    
    throw new Error(errorMessage);
  }

  // 204 No Content인 경우 빈 객체 반환
  if (clonedResponse.status === 204) {
    return {} as T;
  }

  // 성공 응답 파싱
  return clonedResponse.json();
};

// 토큰 리프레시 함수 제거 - auth-client.ts에서 처리
// const refreshAccessToken = async (): Promise<boolean> => {
//   // 이 함수는 더 이상 사용되지 않음
//   // auth-client.ts에서 자동으로 처리됨
// };
