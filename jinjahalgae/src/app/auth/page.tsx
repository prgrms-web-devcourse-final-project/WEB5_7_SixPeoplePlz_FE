/**
 * 인증 페이지 (로그인/회원가입)
 * - 카카오/네이버 소셜 로그인 버튼 제공
 * - OAuth 인증 처리
 * - JWT 토큰 발급 및 저장
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Code } from "lucide-react";
import { createKakaoAuthUrl } from "@/lib/kakao";
import { authService } from "@/lib/auth";
import { useAlert } from "@/components/ui";
import { CommonHeader } from "@/components/CommonHeader";
import { useFcmToken } from "@/components/FcmTokenProvider";
import { useRetryableApiCall } from "@/lib/utils/retry";

// 카카오 로고 SVG 아이콘
const KakaoIcon = () => (
  <svg
    className="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C7.58172 4 4 6.92513 4 10.5C4 12.8884 5.5813 14.9435 8.125 16.1904L7.22917 19.5L10.5 17.5C10.9917 17.5528 11.4917 17.5833 12 17.5833C16.4183 17.5833 20 14.6582 20 11.0833C20 7.50845 16.4183 4 12 4Z"
      fill="black"
      fillOpacity="0.9"
    ></path>
  </svg>
);

// 네이버 로고 SVG 아이콘
const NaverIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.3335 1.33301H5.66683L10.3335 8.66634V1.33301H14.6668V14.6663H10.3335L5.66683 6.99967V14.6663H1.3335V1.33301Z"
      fill="white"
    />
  </svg>
);

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const { showAlert, AlertComponent } = useAlert();
  const { fcmToken, isLoading: fcmTokenLoading } = useFcmToken();

  // 개발 환경 확인
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    // URL에서 redirect 파라미터 확인
    const redirect = searchParams.get("redirect");
    if (redirect) {
      setRedirectPath(redirect);
    }
  }, [searchParams]);

  const handleKakaoLogin = () => {
    // FCM 토큰 상태 확인 (alert 제거)
  };

  const handleNaverLogin = async () => {
    setIsLoading(true);
    try {
      // FCM 토큰 상태 확인 (alert 제거)

      // 네이버 OAuth URL로 리다이렉트
      // redirect 파라미터가 있으면 state에 포함
      const state = redirectPath
        ? `STATE_STRING_${encodeURIComponent(redirectPath)}`
        : "STATE_STRING";

      const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${
        process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
      }&redirect_uri=${encodeURIComponent(
        window.location.origin
      )}/login/oauth2/code/naver&state=${state}`;

      window.location.href = naverAuthUrl;
    } catch (error) {
      console.error("네이버 로그인 실패:", error);
      showAlert({
        message: "네이버 로그인에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  const { executeWithRetry: testLoginWithRetry } = useRetryableApiCall(
    () => authService.testLogin(),
    {
      maxRetries: 3,
      retryDelay: 100
    }
  );

  const handleTestLogin = async () => {
    setIsTestLoading(true);
    try {
      // FCM 토큰 상태 확인 (alert 제거)

      await testLoginWithRetry();

      // 리다이렉트 처리
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("테스트 로그인 실패:", error);
      showAlert({
        message: "테스트 로그인에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <>
      <AlertComponent />
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            {/* 제목과 설명 */}
            <div className="text-center mb-8">
              <div className="w-32 h-32 mx-auto mb-8">
                <img
                  src="/logo.png"
                  alt="진짜할게 로고"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* 로그인 버튼들 */}
            <div className="flex flex-col space-y-4">
              <div>
                <button
                  onClick={() => {
                    handleKakaoLogin();
                    window.location.href = createKakaoAuthUrl(
                      redirectPath || undefined
                    );
                  }}
                  disabled={isLoading || isTestLoading}
                  className="w-full bg-[#fee500] hover:bg-[#fdd835] text-black font-semibold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-[1.02] shadow-md"
                >
                  <KakaoIcon />
                  카카오로 계속하기
                </button>
              </div>

              <div>
                <button
                  onClick={handleNaverLogin}
                  disabled={isLoading || isTestLoading}
                  className="w-full bg-[#03c75a] hover:bg-[#00b04f] text-white font-semibold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-[1.02] shadow-md"
                >
                  <NaverIcon />
                  네이버로 계속하기
                </button>
              </div>

              {/* 개발 환경에서만 보이는 테스트 로그인 버튼 */}
              {isDev && (
                <div>
                  <button
                    onClick={handleTestLogin}
                    disabled={isLoading || isTestLoading}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-[1.02] shadow-md border-2 border-dashed border-gray-400"
                  >
                    <Code className="w-4 h-4" />
                    개발용 테스트 로그인
                  </button>
                </div>
              )}
            </div>

            {/* FCM 토큰 상태 표시 (개발 환경에서만) */}
            {isDev && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600">
                  FCM 토큰 상태:{" "}
                  {fcmTokenLoading ? "로딩 중..." : fcmToken ? "있음" : "없음"}
                </p>
                {fcmToken && (
                  <p className="text-xs text-gray-500 mt-1 break-all">
                    토큰: {fcmToken.substring(0, 20)}...
                  </p>
                )}
              </div>
            )}

            {/* 하단 안내 텍스트 */}
            <p className="text-xs text-gray-500 text-center mt-8 leading-relaxed">
              로그인 시{" "}
              <a
                href="https://exclusive-pixie-b95.notion.site/23227ad829d080ed9d8ffdd4c2208aae?source=copy_link"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline"
              >
                서비스 이용약관
              </a>{" "}
              및{" "}
              <a
                href="https://exclusive-pixie-b95.notion.site/23227ad829d080bca3c7e90e98e37a0f?source=copy_link"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline"
              >
                개인정보처리방침
              </a>
              에 동의한 것으로 간주됩니다
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
