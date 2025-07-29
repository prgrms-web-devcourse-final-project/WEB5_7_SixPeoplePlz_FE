/**
 * 통합 인증 클라이언트
 * - API 클라이언트 통합 관리
 * - 토큰 자동 관리 및 리프레시
 * - 일관된 에러 핸들링
 * - API 호출 배칭 처리
 */

import { Api } from "../../../docs/Api";
import { envConfig } from "../env";
import { tokenManager } from "./token-manager";
import { batchManager } from "../api/batch-manager";

// API 클라이언트 싱글톤 인스턴스
let apiClientInstance: Api<string> | null = null;

// refresh batching/locking
let refreshPromise: Promise<boolean> | null = null;
let isRefreshing = false;

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
 * 배칭된 fetch 함수
 */
const batchedFetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
  const [url, options] = args;
  const method = options?.method || 'GET';
  
  // 요청 키 생성
  const requestKey = batchManager.generateRequestKey(
    url.toString(),
    method,
    options?.body,
    undefined // query는 URL에 포함되어 있음
  );

  // 배칭 처리로 실제 fetch 실행
  const response = await batchManager.executeBatchRequest(requestKey, () => fetch(...args));
  
  // Response 객체를 clone하여 반환 (body stream 중복 읽기 방지)
  return response instanceof Response ? response.clone() : response;
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
        
        // 배칭된 fetch 사용
        const response = await batchedFetch(...args);

        // 401 에러 시 토큰 리프레시 시도
        if (response.status === 401) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // 새로운 토큰으로 재요청 (배칭 처리 포함)
            const [url, options] = args;
            const newOptions = {
              ...options,
              headers: {
                ...options?.headers,
                Authorization: `Bearer ${tokenManager.getAccessToken()}`,
              },
            };
            const retryResponse = await batchedFetch(url, newOptions);
            return retryResponse;
          } else {
            // 리프레시 실패 시 에러 throw (retry.ts에서 처리)
            throw new Error("인증이 만료되었습니다. 페이지를 새로고침해주세요.");
          }
        }

        // 403 에러 시 에러 throw
        if (response.status === 403) {
          throw new Error("접근 권한이 없습니다. 다시 로그인해주세요.");
        }

        return response;
      },
    });
  }

  return apiClientInstance;
};

/**
 * 토큰 리프레시 함수 (동시성 안전)
 */
const refreshAccessToken = async (): Promise<boolean> => {
  // 이미 진행 중인 refresh가 있으면 그걸 기다림
  if (refreshPromise) {
    return refreshPromise;
  }

  // 중복 호출 방지
  if (isRefreshing) {
    return new Promise((resolve) => {
      const checkRefresh = () => {
        if (!isRefreshing) {
          resolve(true);
        } else {
          setTimeout(checkRefresh, 100);
        }
      };
      checkRefresh();
    });
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      refreshPromise = null;
      return false;
    }

    try {
      const response = await fetch(`${envConfig.api.baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();

        // MSW 환경에서는 result 객체 안에 토큰이 있음
        const accessToken = data.result?.accessToken || data.accessToken;
        const newRefreshToken = data.result?.refreshToken || data.refreshToken;

        if (accessToken) {
          tokenManager.setAccessToken(accessToken);
          if (newRefreshToken) {
            tokenManager.setRefreshToken(newRefreshToken);
          }
          isRefreshing = false;
          refreshPromise = null;
          return true;
        } else {
        }
      } else {
      }
    } catch (error) {
    }
    
    isRefreshing = false;
    refreshPromise = null;
    return false;
  })();
  
  return refreshPromise;
};

/**
 * API 클라이언트 인스턴스 재생성 (토큰 변경 시)
 */
export const resetApiClient = () => {
  apiClientInstance = null;
};

/**
 * 배칭 상태 조회 (디버깅용)
 */
export const getBatchStatus = () => {
  return batchManager.getBatchStatus();
};

/**
 * 모든 배칭 요청 초기화 (디버깅용)
 */
export const clearAllBatches = () => {
  batchManager.clearAllBatches();
};
