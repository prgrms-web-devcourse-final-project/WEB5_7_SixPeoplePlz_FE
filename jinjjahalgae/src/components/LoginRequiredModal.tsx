/**
 * 로그인 요청 모달 컴포넌트
 * - 미로그인 사용자에게 로그인 요청
 * - 소셜 로그인 버튼 제공
 * - 기능 이용을 위한 로그인 필요성 안내
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button, ModalActions, ModalSection } from "./ui";
import { authService } from "@/lib/auth";
import { Lock, Check, MessageCircle, LogIn } from "lucide-react";
import { useAlert } from "./ui";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  redirectPath?: string;
}

export function LoginRequiredModal({
  isOpen,
  onClose,
  message = "로그인이 필요한 서비스입니다.",
  redirectPath,
}: LoginRequiredModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert, AlertComponent } = useAlert();

  const handleSocialLogin = async (provider: "kakao" | "naver") => {
    setIsLoading(true);
    try {
      // 실제 구현에서는 OAuth 인증 후 받은 accessToken을 사용
      // 여기서는 예시로 더미 토큰을 사용
      const dummyToken = `dummy_${provider}_token`;

      await authService.socialLogin(provider.toUpperCase(), dummyToken);

      onClose();

      // 리다이렉트 경로가 있으면 해당 페이지로, 없으면 메인으로
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      showAlert({
        message: "로그인에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    onClose();
    const redirectUrl = redirectPath
      ? `?redirect=${encodeURIComponent(redirectPath)}`
      : "";
    router.push(`/auth${redirectUrl}`);
  };

  return (
    <>
      <AlertComponent />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="로그인 필요"
        headerIcon={<Lock className="w-5 h-5 text-blue-600" />}
        footer={
          <ModalActions>
            <Button variant="outline" fullWidth onClick={onClose}>
              닫기
            </Button>
            <Button variant="outline" fullWidth onClick={handleGoToLogin}>
              <LogIn className="w-4 h-4 mr-2" />
              로그인 페이지로
            </Button>
          </ModalActions>
        }
      >
        <div className="space-y-6">
          {/* 메시지 */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              로그인이 필요해요
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
          </div>

          {/* 혜택 안내 */}
          <ModalSection
            title="로그인하면 이런 기능을 사용할 수 있어요!"
            variant="info"
          >
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                목표 달성 계약 생성 및 관리
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                인증 사진 업로드 및 관리
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                감독자로 참여하여 다른 사람 도움
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                목표 달성 통계 및 히스토리 확인
              </li>
            </ul>
          </ModalSection>

          {/* 소셜 로그인 버튼들 */}
          <ModalSection title="간편 로그인">
            <div className="space-y-3">
              <button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg py-3 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={() => handleSocialLogin("kakao")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    카카오로 시작하기
                  </>
                )}
              </button>

              <Button
                fullWidth
                variant="success"
                onClick={() => handleSocialLogin("naver")}
                disabled={isLoading}
                loading={isLoading}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                네이버로 시작하기
              </Button>
            </div>
          </ModalSection>
        </div>
      </Modal>
    </>
  );
}
