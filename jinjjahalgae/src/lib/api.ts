/**
 * API 클라이언트 설정 및 공통 함수
 * @deprecated 이 파일은 deprecated 되었습니다.
 * 새로운 통합 auth 시스템을 사용하세요: @/lib/auth
 *
 * - 기본 API 설정
 * - 토큰 관리
 * - 에러 핸들링
 */

import { envConfig } from "./env";

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

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config);

  // 토큰 만료(401) 또는 권한 없음(403) 시 처리
  if (response.status === 401 || response.status === 403) {
    // 401인 경우 리프레시 시도
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // 새 토큰으로 재요청
        const newToken = tokenManager.getAccessToken();
        const retryResponse = await fetch(`${API_BASE_URL}/api${endpoint}`, {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });

        // 재시도 응답 처리
        if (!retryResponse.ok) {
          // 오류 응답에서 메시지를 파싱 시도
          let errorMessage = `API Error: ${retryResponse.status}`;
          
          try {
            const errorData = await retryResponse.json();
            if (errorData && typeof errorData === 'object' && 'message' in errorData) {
              errorMessage = errorData.message;
            }
          } catch (parseError) {
            // JSON 파싱 실패 시 기본 오류 메시지 사용
          }
          
          throw new Error(errorMessage);
        }

        // 204 No Content인 경우 빈 객체 반환
        if (retryResponse.status === 204) {
          return {} as T;
        }

        // 성공 응답 파싱
        return retryResponse.json();
      }
    }

    // 리프레시 실패하거나 403인 경우 로그인 페이지로 리다이렉트
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
    throw new Error(`Authentication failed: ${response.status}`);
  }

  // 일반 오류 처리
  if (!response.ok) {
    // 오류 응답에서 메시지를 파싱 시도
    let errorMessage = `API Error: ${response.status}`;
    
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === 'object' && 'message' in errorData) {
        errorMessage = errorData.message;
      }
    } catch (parseError) {
      // JSON 파싱 실패 시 기본 오류 메시지 사용
    }
    
    throw new Error(errorMessage);
  }

  // 204 No Content인 경우 빈 객체 반환
  if (response.status === 204) {
    return {} as T;
  }

  // 성공 응답 파싱
  return response.json();
};

// 토큰 리프레시
const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = tokenManager.getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      tokenManager.setAccessToken(data.accessToken);
      return true;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }

  return false;
};

// 파일 업로드용 함수 (deprecated - files.ts의 uploadFile 사용)
// export const apiUpload = async (
//   endpoint: string,
//   file: File,
//   options: RequestInit = {}
// ): Promise<any> => {
//   const token = tokenManager.getAccessToken();
//   const formData = new FormData();
//   formData.append("file", file);

//   const config: RequestInit = {
//     ...options,
//     method: "POST",
//     body: formData,
//     headers: {
//       ...(token && { Authorization: `Bearer ${token}` }),
//       ...options.headers,
//     },
//   };

//   const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config);

//   if (!response.ok) {
//     throw new Error(`Upload Error: ${response.status}`);
//   }

//   return response.json();
// };
