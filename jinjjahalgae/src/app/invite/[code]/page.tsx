/**
 * 초대 페이지 - 감독자 초대 링크 처리
 * - 비밀번호 입력
 * - 계약서 미리보기
 * - 감독자 서명
 * - 로그인 처리
 */

"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  checkInviteExists,
  verifyInvitePassword,
  getContractDetailByInvite,
} from "@/lib/api/invites";
import { signContractAsSupervisor } from "@/lib/api/contracts";
import { uploadFile } from "@/lib/api/files";

import { authService } from "@/lib/auth";
import { Button } from "@/components/ui";
import { InviteContractInfoResponse } from "../../../../docs/data-contracts";
import { SignatureModal } from "@/components/SignatureModal";
import { getImageUrl } from "@/lib/env";
import { templates } from "@/components/contract-create/TemplateStep";
import type { FormData } from "@/app/contracts/create/page";
import { createKakaoAuthUrl } from "@/lib/kakao";
import { ArrowLeft } from "lucide-react";
import { useAlert } from "@/components/ui";
import { CommonHeader } from "@/components/CommonHeader";

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

// 백 화살표 아이콘
const BackArrowIcon = () => <ArrowLeft className="w-6 h-6" />;

// 로그인 모달 컴포넌트
function LoginModal({
  onClose,
  onKakaoLogin,
  onNaverLogin,
  currentPassword,
}: {
  onClose: () => void;
  onKakaoLogin: () => void;
  onNaverLogin: () => void;
  currentPassword: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginProvider, setLoginProvider] = useState<"KAKAO" | "NAVER" | null>(
    null
  );
  const { showAlert } = useAlert();

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setLoginProvider("KAKAO");
    try {
      // 현재 상태를 세션 스토리지에 저장 (비밀번호 포함)
      sessionStorage.setItem(
        "pendingInvite",
        JSON.stringify({
          code: window.location.pathname.split("/").pop(),
          password: currentPassword, // 현재 입력된 비밀번호 저장
          step: "password",
        })
      );

      // 카카오 OAuth URL로 리다이렉트
      const kakaoAuthUrl = createKakaoAuthUrl(
        `/invite/${window.location.pathname.split("/").pop()}`
      );
      window.location.href = kakaoAuthUrl;
    } catch (error) {
      console.error("카카오 로그인 실패:", error);
      showAlert({
        message: "카카오 로그인에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
      setIsLoading(false);
      setLoginProvider(null);
    }
  };

  const handleNaverLogin = async () => {
    setIsLoading(true);
    setLoginProvider("NAVER");
    try {
      // 현재 상태를 세션 스토리지에 저장 (비밀번호 포함)
      sessionStorage.setItem(
        "pendingInvite",
        JSON.stringify({
          code: window.location.pathname.split("/").pop(),
          password: currentPassword, // 현재 입력된 비밀번호 저장
          step: "password",
        })
      );

      // 네이버 OAuth URL로 리다이렉트
      const state = `STATE_STRING_${encodeURIComponent(
        `/invite/${window.location.pathname.split("/").pop()}`
      )}`;
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
      setLoginProvider(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-sm p-6 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 제목과 설명 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            로그인이 필요해요
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            계약서에 서명하기 위해
            <br />
            로그인을 진행해주세요
          </p>
        </div>

        {/* 로그인 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full bg-[#fee500] hover:bg-[#fdd835] text-black font-semibold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && loginProvider === "KAKAO" ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
            ) : (
              <KakaoIcon />
            )}
            {isLoading && loginProvider === "KAKAO"
              ? "로그인 중..."
              : "카카오로 계속하기"}
          </button>

          <button
            onClick={handleNaverLogin}
            disabled={isLoading}
            className="w-full bg-[#03c75a] hover:bg-[#00b04f] text-white font-semibold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && loginProvider === "NAVER" ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <NaverIcon />
            )}
            {isLoading && loginProvider === "NAVER"
              ? "로그인 중..."
              : "네이버로 계속하기"}
          </button>
        </div>

        {/* 하단 안내 텍스트 */}
        <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
          로그인 시 서비스 이용약관 및<br />
          개인정보 처리방침에 동의한 것으로 간주됩니다
        </p>
      </div>
    </div>
  );
}

export default function InvitePage(props: {
  params: Promise<{ code: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const [step, setStep] = useState<
    "password" | "preview" | "sign" | "complete"
  >("password");
  const [password, setPassword] = useState("");
  const [signatureImageKey, setSignatureImageKey] = useState<string | null>(
    null
  );
  const [signatureImageUrl, setSignatureImageUrl] = useState<string | null>(
    null
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [contract, setContract] = useState<InviteContractInfoResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { showAlert, AlertComponent } = useAlert();

  const handlePasswordSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const verifyResult = await verifyInvitePassword(params.code, {
        password,
      });

      if (verifyResult.success && verifyResult.result?.contractUuid) {
        // 계약서 상세 정보 가져오기
        const contractDetail = await getContractDetailByInvite(
          params.code,
          verifyResult.result.contractUuid
        );

        if (contractDetail.success && contractDetail.result) {
          setContract(contractDetail.result);
          setStep("preview");
        } else {
          setError("계약 정보를 불러올 수 없습니다.");
        }
      } else {
        setError("비밀번호 확인에 실패했습니다.");
      }
    } catch (err: any) {
      // API 에러 응답에서 message를 바로 사용
      if (err?.message) {
        setError(err.message);
      } else {
        setError("비밀번호가 틀렸거나 계약 정보를 불러올 수 없습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [params.code, password]);

  useEffect(() => {
    const checkAuthAndInvite = async () => {
      // 로그인 상태 확인
      const isLoggedIn = authService.isAuthenticated();
      setIsLoggedIn(isLoggedIn);

      // 초대 링크 유효성 검사
      try {
        await checkInviteExists(params.code);
      } catch (err) {
        setError("유효하지 않은 초대 링크입니다.");
      }
    };

    checkAuthAndInvite();
  }, [params.code]);

  // 로그인 상태 변화 감지 (로그인 후 돌아왔을 때)
  useEffect(() => {
    const handleFocus = () => {
      const isLoggedIn = authService.isAuthenticated();
      setIsLoggedIn(isLoggedIn);
    };

    // 페이지 포커스 시 로그인 상태 확인
    window.addEventListener("focus", handleFocus);

    // 초기 로그인 상태 확인
    handleFocus();

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // 로그인 후 돌아왔을 때 자동으로 서명 단계로 이동
  useEffect(() => {
    // 로그인 후 미리보기 단계에서 바로 서명 단계로 넘어가지 않도록 제거
    // 사용자가 직접 "계약서에 서명하기" 버튼을 눌러야 서명 단계로 이동
  }, [isLoggedIn, step]);

  // 로그인 후 돌아왔을 때 세션 스토리지에서 상태 복원
  useEffect(() => {
    if (isLoggedIn) {
      const pendingInvite = sessionStorage.getItem("pendingInvite");
      if (pendingInvite) {
        try {
          const inviteData = JSON.parse(pendingInvite);
          sessionStorage.removeItem("pendingInvite");

          // 현재 페이지의 코드와 일치하는지 확인
          if (inviteData.code === params.code) {
            // 비밀번호 입력 단계에서 로그인한 경우 자동으로 계약서 미리보기로 이동
            if (inviteData.step === "password" && step === "password") {
              // 저장된 비밀번호가 있다면 복원하고 자동으로 검증 수행
              if (inviteData.password) {
                setPassword(inviteData.password);
                // 비동기로 검증 수행
                const performVerification = async () => {
                  setLoading(true);
                  setError(null);

                  try {
                    const verifyResult = await verifyInvitePassword(
                      params.code,
                      {
                        password: inviteData.password,
                      }
                    );

                    if (
                      verifyResult.success &&
                      verifyResult.result?.contractUuid
                    ) {
                      // 계약서 상세 정보 가져오기
                      const contractDetail = await getContractDetailByInvite(
                        params.code,
                        verifyResult.result.contractUuid
                      );

                      if (contractDetail.success && contractDetail.result) {
                        setContract(contractDetail.result);
                        // 로그인 후 미리보기 단계로 이동
                        setStep("preview");
                      } else {
                        setError("계약 정보를 불러올 수 없습니다.");
                      }
                    } else {
                      setError("비밀번호 확인에 실패했습니다.");
                    }
                  } catch (err: any) {
                    // API 에러 응답에서 message를 바로 사용
                    if (err?.message) {
                      setError(err.message);
                    } else {
                      setError(
                        "비밀번호가 틀렸거나 계약 정보를 불러올 수 없습니다."
                      );
                    }
                  } finally {
                    setLoading(false);
                  }
                };

                performVerification();
              }
            }
          }
        } catch (error) {
          console.error("저장된 초대 정보 복원 실패:", error);
        }
      }
    }
  }, [isLoggedIn, params.code, step]);

  const handleSignContract = () => {
    // 로그인 상태를 다시 한번 확인
    const currentIsLoggedIn = authService.isAuthenticated();
    setIsLoggedIn(currentIsLoggedIn);

    if (!currentIsLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    setStep("sign");
  };

  const handleSignComplete = async () => {
    if (!signatureImageKey) {
      showAlert({ message: "서명을 완료해주세요.", type: "warning" });
      return;
    }
    if (!contract?.uuid) {
      setError("계약 정보가 올바르지 않습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // UUID를 사용해서 감독자 서명 API 호출
      await signContractAsSupervisor(contract.contractId!, signatureImageKey);
      // 성공하면 감독중 탭으로 이동
      router.push("/?tab=supervising");
    } catch (err) {
      // 오류 메시지를 바로 표시
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("서명에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 글로벌 스타일
  const GlobalStyles = () => (
    <style>{`
      body {
        font-family: 'Pretendard-Regular', sans-serif;
      }
    `}</style>
  );

  return (
    <>
      <GlobalStyles />
      <AlertComponent />
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="container-mobile flex flex-col items-center justify-center p-4">
          <main className="w-full bg-white rounded-lg shadow-md p-8">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {step === "password" && (
              <PasswordStep
                password={password}
                setPassword={setPassword}
                onSubmit={handlePasswordSubmit}
                isLoading={loading}
              />
            )}

            {step === "preview" && contract && (
              <PreviewStep
                contract={contract}
                isLoggedIn={isLoggedIn}
                onLogin={() => setIsLoginModalOpen(true)}
                onSign={handleSignContract}
                signatureImageKey={signatureImageKey}
                signatureImageUrl={signatureImageUrl}
                onComplete={handleSignComplete}
              />
            )}

            {step === "sign" && contract && (
              <SignStep
                contract={contract}
                signatureImageKey={signatureImageKey}
                signatureImageUrl={signatureImageUrl}
                setSignatureImageKey={setSignatureImageKey}
                setSignatureImageUrl={setSignatureImageUrl}
                onComplete={handleSignComplete}
                isLoading={loading}
                setStep={setStep}
              />
            )}
          </main>
        </div>

        {isLoginModalOpen && (
          <LoginModal
            onClose={() => setIsLoginModalOpen(false)}
            onKakaoLogin={() => setIsLoginModalOpen(false)}
            onNaverLogin={() => setIsLoginModalOpen(false)}
            currentPassword={password}
          />
        )}
      </div>
    </>
  );
}

function PasswordStep({
  password,
  setPassword,
  onSubmit,
  isLoading,
}: {
  password: string;
  setPassword: (password: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">비밀번호 입력</h2>
        <p className="text-slate-600 mt-2">
          계약서를 보기 위해 비밀번호를 입력해주세요
        </p>
      </div>

      <div className="w-full mb-6">
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="초대 비밀번호를 입력하세요"
          className="w-full px-4 py-3 text-base text-slate-700 bg-white border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-shadow duration-200"
          required
        />
      </div>

      <button
        type="submit"
        disabled={!password || isLoading}
        className="w-full bg-[#2563eb] text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? "확인 중..." : "확인"}
      </button>
    </form>
  );
}

function PreviewStep({
  contract,
  isLoggedIn,
  onLogin,
  onSign,
  signatureImageKey,
  signatureImageUrl,
  onComplete,
}: {
  contract: InviteContractInfoResponse;
  isLoggedIn: boolean;
  onLogin: () => void;
  onSign: () => void;
  signatureImageKey?: string | null;
  signatureImageUrl?: string | null;
  onComplete?: () => void;
}) {
  // contract.type에 따라 적절한 템플릿 선택
  const contractType = contract.type || "BASIC";
  const selectedTemplate = templates.find((t) => t.id === contractType);

  // 템플릿을 찾지 못한 경우 기본 템플릿 사용
  const template = selectedTemplate || templates.find((t) => t.id === "BASIC")!;
  const PreviewComponent = template.previewComponent;

  // FormData 형식으로 변환
  const formData: FormData = {
    templateId: contractType as
      | "BASIC"
      | "JOSEON"
      | "CASUAL"
      | "CHILD"
      | "STUDENT",
    title: contract.title || "",
    goal: contract.goal || "",
    reward: contract.reward || "",
    penalty: contract.penalty || "",
    totalProof: contract.totalProof || 1,
    oneOff: contract.oneOff || false,
    startDate: contract.startDate || "",
    endDate: contract.endDate || "",
    signatureImageKey: null,
    signatureImageUrl: null,
  };

  // 참여자 정보 (감독자 초대 상황이므로 계약자 정보만 있음)
  const participants = [
    {
      userName: contract.contractorName,
      role: "CONTRACTOR" as const,
    },
  ];

  // 서명이 있는지 확인 (업로드된 키가 있는지만 체크)
  const hasSignature = signatureImageKey !== null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {hasSignature ? "서명 완료" : "계약서 미리보기"}
        </h2>
        <p className="text-slate-600 mt-2">
          {hasSignature
            ? "서명이 완료되었습니다. 완료 버튼을 눌러 계약을 확정해주세요."
            : isLoggedIn
            ? `${contract.contractorName}님의 계약서입니다`
            : `${contract.contractorName}님의 계약서를 확인해보세요`}
        </p>
      </div>

      {/* 템플릿 기반 계약서 렌더링 */}
      <div className="bg-white rounded-lg shadow-sm border border-[#e5e7eb] overflow-hidden">
        <PreviewComponent
          formData={formData}
          participants={participants}
          contractorSignatureKey="INVITATION_PREVIEW"
          supervisorSignatures={
            hasSignature && signatureImageKey
              ? [
                  {
                    name: "서명자",
                    signatureKey: signatureImageKey,
                  },
                ]
              : []
          }
        />
      </div>

      {/* 서명 완료 메시지 (서명이 있는 경우) */}
      {hasSignature && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold text-center">
            ✅ 감독자 서명이 완료되었습니다
          </p>
        </div>
      )}

      {!hasSignature && !isLoggedIn && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-blue-900 font-medium text-sm">
                서명을 위해 로그인이 필요해요
              </p>
              <p className="text-blue-700 text-xs mt-1">
                계약서 미리보기는 로그인 없이도 가능합니다
              </p>
            </div>
          </div>
        </div>
      )}

      {hasSignature ? (
        <button
          onClick={onComplete}
          className="w-full bg-[#facc15] hover:bg-yellow-500 text-black font-bold py-4 px-4 rounded-xl text-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
          🎉 완료
        </button>
      ) : (
        <button
          onClick={onSign}
          className="w-full bg-[#facc15] hover:bg-yellow-500 text-black font-bold py-4 px-4 rounded-xl text-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
          {isLoggedIn ? "📝 계약서에 서명하기" : "🔐 로그인 후 서명하기"}
        </button>
      )}
    </div>
  );
}

function SignStep({
  contract,
  signatureImageKey,
  signatureImageUrl,
  setSignatureImageKey,
  setSignatureImageUrl,
  onComplete,
  isLoading,
  setStep, // 추가된 props
}: {
  contract: InviteContractInfoResponse;
  signatureImageKey: string | null;
  signatureImageUrl: string | null;
  setSignatureImageKey: (key: string | null) => void;
  setSignatureImageUrl: (url: string | null) => void;
  onComplete: () => void;
  isLoading: boolean;
  setStep: (step: "password" | "preview" | "sign" | "complete") => void; // 추가된 타입
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showAlert } = useAlert();

  // 캔버스 초기 설정
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // HiDPI(고해상도) 디스플레이 대응
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    setContext(ctx);

    // 리사이즈 이벤트 처리
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 그리기 시작 (마우스/터치)
  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!context) return;
    const { offsetX, offsetY } = getCoordinates(event);
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  // 그리기 (마우스/터치)
  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing || !context) return;
    const { offsetX, offsetY } = getCoordinates(event);
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  // 그리기 종료 (마우스/터치)
  const stopDrawing = () => {
    if (!isDrawing || !context) return;
    context.closePath();
    setIsDrawing(false);
  };

  // 캔버스 초기화
  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSignatureImageKey(null);
    setSignatureImageUrl(null);
  };

  // 서명 저장 후 미리보기로 이동
  const handleSignature = async () => {
    if (!canvasRef.current || !context) return;

    setIsSaving(true);
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL("image/png");

    try {
      // 캔버스를 Blob으로 변환
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("캔버스 변환 실패"));
            }
          },
          "image/png",
          0.9
        );
      });

      // File 객체로 변환
      const fileName = `signature_${Date.now()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      // presigned URL을 사용하여 S3에 업로드
      const fileKey = await uploadFile(file);

      // 상태 업데이트
      setSignatureImageKey(fileKey);
      setSignatureImageUrl(imageData);

      // 서명 저장 후 미리보기로 이동하여 서명 완료된 계약서 보기
      setStep("preview");
    } catch (error) {
      console.error("서명 저장 오류:", error);
      showAlert({
        message: "서명 저장 중 오류가 발생했습니다.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 마우스와 터치 이벤트 좌표를 일관되게 처리
  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };

    const rect = canvas.getBoundingClientRect();
    if ("touches" in event && event.touches && event.touches.length > 0) {
      return {
        offsetX: event.touches[0].clientX - rect.left,
        offsetY: event.touches[0].clientY - rect.top,
      };
    }
    const mouseEvent = event as React.MouseEvent;
    return {
      offsetX: mouseEvent.clientX - rect.left,
      offsetY: mouseEvent.clientY - rect.top,
    };
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-full">
      <p className="text-center text-sm text-[#6b7280] mb-4">
        아래 네모칸에 서명을 입력해주세요.
      </p>

      {/* 서명 입력 영역 */}
      <div className="flex-grow w-full h-64 border-2 border-dashed border-gray-300 rounded-lg mb-6 bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* 버튼 영역 */}
      <div className="grid grid-cols-2 gap-x-4">
        <button
          onClick={clearCanvas}
          className="w-full py-3 bg-[#e5e7eb] text-gray-800 font-bold rounded-lg transition-colors hover:bg-gray-300"
        >
          초기화
        </button>
        <button
          onClick={handleSignature}
          disabled={isSaving || isLoading}
          className="w-full py-3 bg-[#2563eb] text-white font-bold rounded-lg transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSaving || isLoading ? "서명 중..." : "서명하기"}
        </button>
      </div>
    </div>
  );
}
