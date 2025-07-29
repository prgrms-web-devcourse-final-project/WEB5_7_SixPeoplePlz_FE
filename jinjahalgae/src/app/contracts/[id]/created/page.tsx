/**
 * 계약 생성 완료 페이지 - 예시 코드와 완전히 동일한 디자인
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { ArrowLeft, Mail, Copy } from "lucide-react";
import { createInviteLink } from "@/lib/api/invites";
import { getContract } from "@/lib/api/contracts";
import { useAlert } from "@/components/ui";
import { CommonHeader } from "@/components/CommonHeader";
import { getMyInfo } from "@/lib/api/users";
import { getKakaoInviteShareMessage } from "@/lib/utils/contract";

declare global {
  interface Window {
    Kakao: any;
  }
}

// --- Helper Components ---
const CopyableField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="w-full">
      <label className="text-sm font-semibold text-[#6b7280] mb-1.5 block">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="flex-grow bg-white border border-[#e5e7eb] rounded-lg px-4 py-3 text-[#6b7280] truncate">
          {value}
        </div>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 p-3 bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-50 transition-colors"
          aria-label={`${label} 복사`}
        >
          {copied ? (
            <span className="text-xs font-bold text-[#16a34a]">복사됨!</span>
          ) : (
            <Copy size={20} className="text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function ContractCreatedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [inviteData, setInviteData] = useState<{
    inviteUrl: string;
    password: string;
  } | null>(null);
  const [contractData, setContractData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isKakaoSdkLoaded, setIsKakaoSdkLoaded] = useState(false);
  const [myInfo, setMyInfo] = useState<any>(null);

  // 페이지 로드 시 자동으로 초대 링크 생성 및 계약 정보 조회
  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params;
      await handleCreateInvite(resolvedParams.id);
      await fetchContractData(resolvedParams.id);
      // 내 닉네임 정보도 불러오기
      try {
        const userInfoData = await getMyInfo();
        if (userInfoData.success) {
          setMyInfo(userInfoData.result || null);
        }
      } catch (e) {
        setMyInfo(null);
      }
    };
    loadData();
  }, [params]);

  const fetchContractData = async (contractId: string) => {
    try {
      const response = await getContract(Number(contractId));
      if (response.result) {
        setContractData(response.result);
      }
    } catch (error) {
      console.error("계약 정보 조회 실패:", error);
    }
  };

  const handleCreateInvite = async (contractId: string) => {
    setIsLoading(true);
    try {
      const response = await createInviteLink(Number(contractId));
      if (response.result?.inviteUrl && response.result?.password) {
        setInviteData({
          inviteUrl: response.result.inviteUrl,
          password: response.result.password,
        });
      } else {
        throw new Error("초대 링크 정보가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("초대 링크 생성 실패:", error);
      showAlert({
        message: "초대 링크 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoShare = () => {
    if (!isKakaoSdkLoaded) {
      showAlert({
        message: "카카오 공유 기능이 로드 중입니다. 잠시 후 다시 시도해주세요.",
        type: "warning",
      });
      return;
    }

    if (!inviteData) {
      showAlert({
        message: "초대 정보가 없습니다. 먼저 초대 링크를 생성해주세요.",
        type: "warning",
      });
      return;
    }

    if (typeof window !== "undefined" && window.Kakao) {
      try {
        const contractTitle =
          contractData?.contractBasicResponse?.title || "계약서";
        // 내 닉네임 또는 이름 사용
        let inviterName = "계약자";
        if (myInfo) {
          inviterName = myInfo.nickname || myInfo.name || "계약자";
        }
        const message = getKakaoInviteShareMessage({
          inviterName,
          contractTitle,
          inviteUrl: inviteData.inviteUrl,
          password: inviteData.password,
        });
        window.Kakao.Share.sendDefault({
          objectType: "text",
          text: message,
          link: {
            mobileWebUrl: inviteData.inviteUrl,
            webUrl: inviteData.inviteUrl,
          },
        });
      } catch (error) {
        console.error("카카오 공유 실패:", error);
        showAlert({
          message: "카카오톡 공유에 실패했습니다. 다시 시도해주세요.",
          type: "error",
        });
      }
    } else {
      showAlert({
        message: "카카오 공유 기능이 로드 중입니다. 잠시 후 다시 시도해주세요.",
        type: "warning",
      });
    }
  };

  return (
    <>
      <AlertComponent />
      {/* Pretendard 폰트 및 전역 스타일 적용 */}

      <Script
        src="https://developers.kakao.com/sdk/js/kakao.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY!);
          setIsKakaoSdkLoaded(true);
        }}
      />

      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="container-mobile">
          {/* --- 헤더 --- */}
          <CommonHeader title="계약 생성 완료" />

          {/* --- 스크롤 가능한 컨텐츠 영역 --- */}
                      <main className="flex-grow overflow-y-auto p-6 bg-[#f0f5ff]">
            {/* --- 메인 컨텐츠 카드 --- */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  계약이 생성되었습니다!
                </h2>
                <p className="text-base text-[#6b7280]">
                  이제 감독자들을 초대하여 계약을 시작해보세요 (최대 5명)
                </p>
              </div>

              {/* 계약 정보 섹션 */}
              <div className="w-full bg-gray-50 border border-gray-200 p-5 rounded-xl mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  "{contractData?.contractBasicResponse?.title || "계약서 제목"}
                  "
                </h3>
                <p className="text-sm text-[#6b7280] mt-1">
                  {contractData?.contractBasicResponse?.startDate &&
                  contractData?.contractBasicResponse?.endDate
                    ? (() => {
                        const startDate = new Date(
                          contractData.contractBasicResponse.startDate
                        );
                        const endDate = new Date(
                          contractData.contractBasicResponse.endDate
                        );
                        const isOneDay =
                          contractData.contractBasicResponse.totalProof === 1 &&
                          Math.abs(endDate.getTime() - startDate.getTime()) <=
                            24 * 60 * 60 * 1000;

                        if (isOneDay) {
                          return `${startDate.toLocaleDateString()} (하루 계약)`;
                        } else {
                          return `${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`;
                        }
                      })()
                    : "계약 기간"}
                </p>
              </div>

              {/* 카카오톡 버튼 */}
              <button
                onClick={handleKakaoShare}
                disabled={!isKakaoSdkLoaded || !inviteData}
                className="w-full bg-[#facc15] text-gray-800 font-bold py-3.5 px-4 rounded-lg hover:bg-amber-400 transition-colors duration-300 flex items-center justify-center gap-2 mb-6"
              >
                <Mail size={20} />
                <span>카카오톡으로 감독 요청하기</span>
              </button>

              {/* 구분선 */}
              <div className="flex items-center w-full mb-6">
                <div className="flex-grow border-t border-[#e5e7eb]"></div>
                <span className="flex-shrink mx-4 text-sm text-[#6b7280]">
                  또는
                </span>
                <div className="flex-grow border-t border-[#e5e7eb]"></div>
              </div>

              {/* 링크 및 비밀번호 섹션 (text-left 추가) */}
              <div className="w-full space-y-4 mb-8 text-left">
                {inviteData ? (
                  <>
                    <CopyableField
                      label="초대 링크"
                      value={inviteData.inviteUrl}
                    />
                    <CopyableField
                      label="1회용 비밀번호"
                      value={inviteData.password}
                    />
                  </>
                ) : (
                  <div className="text-center text-[#6b7280]">
                    {isLoading
                      ? "초대 링크 생성 중..."
                      : "초대 링크를 생성하는 중입니다."}
                  </div>
                )}
              </div>

              {/* 주의사항 */}
              <div className="w-full bg-[#fef3c7] p-4 rounded-lg text-left">
                <h4 className="font-bold text-sm text-[#ef4444] mb-3">
                  주의사항
                </h4>
                <ul className="space-y-1.5 text-xs text-[#6b7280]">
                  <li className="flex items-start">
                    <span className="text-[#ef4444] mr-1.5 mt-0.5">•</span>
                    <span>최소 1명의 감독자가 수락해야 계약이 시작됩니다</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#ef4444] mr-1.5 mt-0.5">•</span>
                    <span>
                      여러 명이 수락한 경우 과반수 승인으로 인증됩니다
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#ef4444] mr-1.5 mt-0.5">•</span>
                    <span>계약 시작 후에는 감독자 변경이 불가능합니다</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#ef4444] mr-1.5 mt-0.5">•</span>
                    <span>초대 링크의 유효 시간은 24시간 입니다</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#ef4444] mr-1.5 mt-0.5">•</span>
                    <span>감독자는 최대 5명까지 초대가 가능합니다</span>
                  </li>
                </ul>
              </div>
            </div>
            {/* --- 메인 컨텐츠 카드 끝 --- */}
          </main>
        </div>
      </div>
    </>
  );
}
