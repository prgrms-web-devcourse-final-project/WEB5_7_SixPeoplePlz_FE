/**
 * 401 오류 시 자동 retry 로직을 추상화한 유틸리티
 */

import { useState, useCallback } from "react";

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (retryCount: number) => void;
  onMaxRetriesExceeded?: () => void;
}

/**
 * 401 오류인지 확인하는 함수
 */
function is401Error(error: any): boolean {
  // Error 객체의 message에서 401 확인
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("401") || message.includes("인증이 만료") || message.includes("unauthorized") || message.includes("인증 실패")) {
      return true;
    }
  }
  
  // Response 객체에서 status 확인
  if (error && typeof error === 'object' && 'status' in error) {
    if (error.status === 401) {
      return true;
    }
  }
  
  // HttpResponse 객체에서 status 확인 (API 클라이언트 사용 시)
  if (error && typeof error === 'object' && 'ok' in error) {
    if (!error.ok && error.status === 401) {
      return true;
    }
  }
  
  // 문자열로 된 에러 메시지 확인
  if (typeof error === 'string') {
    const message = error.toLowerCase();
    if (message.includes("401") || message.includes("인증이 만료") || message.includes("unauthorized") || message.includes("인증 실패")) {
      return true;
    }
  }
  
  // API Error 형태 확인 (apiRequest에서 throw되는 형태)
  if (error && typeof error === 'object' && error.message) {
    const message = error.message.toLowerCase();
    if (message.includes("401") || message.includes("인증이 만료") || message.includes("unauthorized") || message.includes("인증 실패")) {
      return true;
    }
  }
  
  return false;
}

/**
 * 401 오류 시 자동으로 재시도하는 함수를 생성합니다.
 * @param apiCall - API 호출 함수
 * @param config - retry 설정
 * @returns retry 로직이 포함된 함수
 */
export function createRetryableApiCall<T>(
  apiCall: () => Promise<T>,
  config: RetryConfig = {}
): () => Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 100,
    onRetry,
    onMaxRetriesExceeded
  } = config;

  let retryCount = 0;

  const retryableCall = async (isRetry = false): Promise<T> => {
    try {
      const result = await apiCall();
      retryCount = 0; // 성공 시 재시도 카운트 초기화
      return result;
    } catch (err) {
      // 401 오류인 경우 자동으로 재시도
      if (is401Error(err)) {
        if (!isRetry && retryCount < maxRetries) {
          retryCount++;
          onRetry?.(retryCount);
          
          // 지연 후 재시도
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return retryableCall(true);
        } else {
          // 최대 재시도 횟수 초과 또는 이미 재시도 중인 경우
          onMaxRetriesExceeded?.();
          
          // 토큰 정리 및 로그인 페이지로 리다이렉션
          if (typeof window !== "undefined") {
            // localStorage에서 토큰 제거
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            
            // 현재 페이지를 redirect 파라미터로 추가
            const currentPath = window.location.pathname;
            const redirectParam = currentPath !== "/" ? `?redirect=${encodeURIComponent(currentPath)}` : "";
            window.location.href = `/auth${redirectParam}`;
          }
          
          throw new Error("인증이 만료되었습니다. 페이지를 새로고침해주세요.");
        }
      } else {
        // 401이 아닌 다른 에러는 그대로 throw
        throw err;
      }
    }
  };

  return () => retryableCall(false);
}

/**
 * React 컴포넌트에서 사용할 수 있는 retry 훅
 */
export function useRetryableApiCall<T, P = void>(
  apiCall: (params: P) => Promise<T>,
  config: RetryConfig = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = useCallback(async (params: P) => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      const result = await createRetryableApiCall(() => apiCall(params), {
        ...config,
        onRetry: (count) => {
          setRetryCount(count);
          config.onRetry?.(count);
        },
        onMaxRetriesExceeded: () => {
          setError("인증이 만료되었습니다. 페이지를 새로고침해주세요.");
          config.onMaxRetriesExceeded?.();
        }
      })();
      
      return result;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, config]);

  return {
    executeWithRetry,
    loading,
    error,
    retryCount
  };
} 