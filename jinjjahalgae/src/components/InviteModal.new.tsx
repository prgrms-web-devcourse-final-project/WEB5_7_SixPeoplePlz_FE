/**
 * 감독자 초대 모달 컴포넌트 - 예시 코드 스타일 적용
 */

"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { createInviteLink } from "@/lib/api/invites";
import { useAlert } from "./ui";

// --- 아이콘 컴포넌트들 (SVG) ---
const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

// --- 색상 팔레트 ---
const COLORS = {
  blue: "#2563eb",
  lightBlue: "#93c5fd",
  bgLightBlue: "#f0f5ff",
  gray: "#e5e7eb",
  red: "#ef4444",
  lightRed: "#fee2e2",
  grayText: "#6b7280",
  green: "#16a34a",
  lightGreen: "#eafdf0",
  yellow: "#facc15",
  darkYellow: "#b45309",
  lightYellow: "#fef3c7",
};

declare global {
  interface Window {
    Kakao: any;
  }
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  contractTitle: string;
}

export function InviteModal({
  isOpen,
  onClose,
  contractId,
  contractTitle,
}: InviteModalProps) {
  const [inviteData, setInviteData] = useState<{
    inviteUrl: string;
    password: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert, AlertComponent } = useAlert();

  const handleCreateInvite = async () => {
    setIsLoading(true);
    setError(null);
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
      setError("초대 링크 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      showAlert({
        message: "복사되었습니다!",
        type: "success",
      });
    } catch (err) {
      console.error("복사 실패", err);
    }
    document.body.removeChild(textArea);
  };

  useEffect(() => {
    if (isOpen && !inviteData) {
      handleCreateInvite();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <AlertComponent />
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-white rounded-2xl p-6 space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="text-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"
                style={{ borderColor: COLORS.blue }}
              ></div>
              <p style={{ color: COLORS.grayText }}>
                초대 링크를 생성하는 중...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={handleCreateInvite}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold"
                style={{ backgroundColor: COLORS.blue }}
              >
                다시 시도
              </button>
            </div>
          ) : inviteData ? (
            <>
              <button
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center space-x-2"
                style={{ backgroundColor: COLORS.yellow }}
                onClick={() => {
                  // 카카오톡 공유 기능 (향후 구현)
                  showAlert({
                    message: "카카오톡 공유 기능은 준비 중입니다.",
                    type: "info",
                  });
                }}
              >
                <MailIcon />
                <span>카카오톡으로 공유하기</span>
              </button>

              <div className="flex items-center space-x-4">
                <hr
                  className="flex-grow border-t"
                  style={{ borderColor: COLORS.gray }}
                />
                <span className="text-sm" style={{ color: COLORS.grayText }}>
                  또는
                </span>
                <hr
                  className="flex-grow border-t"
                  style={{ borderColor: COLORS.gray }}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-semibold"
                  style={{ color: COLORS.grayText }}
                >
                  초대 링크
                </label>
                <div className="flex items-center space-x-2">
                  <p
                    className="flex-grow p-3 rounded-lg bg-gray-100 truncate"
                    style={{ color: COLORS.grayText }}
                  >
                    {inviteData.inviteUrl.length > 30
                      ? `${inviteData.inviteUrl.substring(0, 30)}...`
                      : inviteData.inviteUrl}
                  </p>
                  <button
                    onClick={() => copyToClipboard(inviteData.inviteUrl)}
                    className="p-3 rounded-lg border"
                    style={{ borderColor: COLORS.gray }}
                  >
                    <CopyIcon />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-semibold"
                  style={{ color: COLORS.grayText }}
                >
                  1회용 비밀번호
                </label>
                <div className="flex items-center space-x-2">
                  <p
                    className="flex-grow p-3 rounded-lg bg-gray-100"
                    style={{ color: COLORS.grayText }}
                  >
                    {inviteData.password}
                  </p>
                  <button
                    onClick={() => copyToClipboard(inviteData.password)}
                    className="p-3 rounded-lg border"
                    style={{ borderColor: COLORS.gray }}
                  >
                    <CopyIcon />
                  </button>
                </div>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: COLORS.lightYellow }}
              >
                <h4
                  className="font-bold mb-2"
                  style={{ color: COLORS.darkYellow }}
                >
                  주의사항
                </h4>
                <ul
                  className="space-y-1.5 text-sm list-disc list-inside"
                  style={{ color: COLORS.grayText }}
                >
                  <li>최소 1명의 감독자가 수락해야 계약이 시작됩니다</li>
                  <li>여러 명이 수락한 경우 과반수 승인으로 인증됩니다</li>
                  <li>계약 시작 후에는 감독자 변경이 불가능합니다</li>
                  <li>초대 링크의 유효 시간은 24시간 입니다</li>
                  <li>감독자는 최대 5명까지 초대가 가능합니다</li>
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
        integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
        crossOrigin="anonymous"
        onLoad={() => {
          if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
          }
        }}
      />
    </>
  );
}

export default InviteModal;
