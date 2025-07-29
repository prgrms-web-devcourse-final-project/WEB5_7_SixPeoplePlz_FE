/**
 * 카카오 OAuth 인가 코드 처리 컴포넌트
 * 인가 코드를 받아 백엔드 서버로 로그인 요청을 보냅니다.
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { exchangeKakaoCodeForToken } from "@/lib/actions/kakao-auth";
import { useAlert } from "./ui";
import { useFcmToken } from "./FcmTokenProvider";

const Auth2Redirect = () => {
  const [code, setCode] = useState<string | null>(null);
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const { fcmToken } = useFcmToken();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URL(window.location.href).searchParams;
      const authCode = urlParams.get("code");
      const state = urlParams.get("state");

      if (authCode) {
        setCode(authCode);
        // state가 있으면 리다이렉트 경로로 사용
        if (state) {
          localStorage.setItem("kakao_redirect_path", state);
        }
      } else {
        // 인가 코드가 없는 경우 에러 처리
        console.error("인가 코드를 찾을 수 없습니다.");
        router.replace("/auth");
      }
    }
  }, [router]);

  const kakaoLogin = async () => {
    if (!code) return;

    try {
      // FCM 토큰 상태 확인 (alert 제거)

      // 서버 액션을 통해 카카오 로그인 처리 (이미 백엔드 API 호출 포함)
      const result = await exchangeKakaoCodeForToken(code, fcmToken);

      if (
        result.success &&
        result.result?.accessToken &&
        result.result?.refreshToken
      ) {
        // 토큰을 직접 저장 (중복 API 호출 방지)
        const { tokenManager } = await import("@/lib/auth");
        tokenManager.setAccessToken(result.result.accessToken);
        tokenManager.setRefreshToken(result.result.refreshToken);

        // API 클라이언트 재생성
        const { resetApiClient } = await import("@/lib/auth/auth-client");
        resetApiClient();


        // 로그인 성공 후 리다이렉트 처리
        const savedRedirectPath = localStorage.getItem("kakao_redirect_path");
        if (savedRedirectPath) {
          localStorage.removeItem("kakao_redirect_path");
          router.replace(savedRedirectPath);
        } else {
          router.replace("/");
        }
      } else {
        throw new Error(result.error || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("카카오 로그인 실패:", error);
      showAlert({
        message: "로그인에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
      router.replace("/auth");
    }
  };

  useEffect(() => {
    if (code !== null) {
      kakaoLogin();
    }
  }, [code]);

  return <AlertComponent />;
};

export default Auth2Redirect;
