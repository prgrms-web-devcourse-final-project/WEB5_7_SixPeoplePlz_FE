/**
 * 인증 상태 관리 래퍼 컴포넌트
 * - 로그인 상태 확인
 * - 401/403 에러 시 자동 로그인 페이지 리다이렉션
 * - 토큰 만료 시 자동 리프레시 시도
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService, tokenManager } from "@/lib/auth";

interface AuthWrapperProps {
  children: React.ReactNode;
}

// 로그인이 필요하지 않은 페이지들
const PUBLIC_ROUTES = [
  "/auth",
  "/login",
  "/invite",
  "/login/oauth2/code/kakao",
  "/login/oauth2/code/naver",
];

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 현재 경로가 공개 라우트인지 확인
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    checkAuthStatus();
  }, [pathname]);

  const checkAuthStatus = async () => {
    // 공개 라우트인 경우 인증 체크 스킵
    if (isPublicRoute) {
      setIsLoading(false);
      setIsAuthenticated(true); // 공개 라우트는 인증된 것으로 처리
      return;
    }

    // 토큰이 없는 경우 로그인 페이지로 리다이렉션
    if (!authService.isAuthenticated()) {
      redirectToLogin();
      return;
    }

    try {
      // 사용자 정보 조회로 토큰 유효성 검증
      await authService.getCurrentUser();
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("인증 확인 실패:", error);

      // 401 에러인 경우 토큰 리프레시 시도
      if (error.message?.includes("401")) {
        const refreshed = await authService.refreshTokens();
        if (refreshed) {
          try {
            await authService.getCurrentUser();
            setIsAuthenticated(true);
          } catch (retryError) {
            console.error("리프레시 후 재시도 실패:", retryError);
            redirectToLogin();
            return;
          }
        } else {
          redirectToLogin();
          return;
        }
      } else if (error.message?.includes("403")) {
        // 403 에러인 경우 바로 로그인 페이지로
        redirectToLogin();
        return;
      } else {
        // 기타 에러는 일단 인증된 것으로 처리 (네트워크 오류 등)
        setIsAuthenticated(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToLogin = () => {
    // 현재 페이지를 redirect 파라미터로 추가하여 로그인 후 돌아갈 수 있도록 함
    const redirectUrl =
      pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";

    // 토큰 정리
    tokenManager.clearAllTokens();

    router.push(`/auth${redirectUrl}`);
  };

  // 로딩 중인 경우
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 (리다이렉션 중)
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
