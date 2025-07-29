/**
 * 초대 코드 입력 모달 컴포넌트
 * - 사용자가 초대 링크를 직접 입력할 수 있는 모달
 * - 링크 유효성 검사 및 리다이렉션
 * - 예시 코드 스타일 적용
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button, ModalActions, ModalSection } from "./ui";
import { Link, AlertTriangle, Users } from "lucide-react";

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 정보 아이콘 컴포넌트
const InfoIcon = () => (
  <svg
    style={{ flexShrink: 0 }}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
  </svg>
);

export function InviteCodeModal({ isOpen, onClose }: InviteCodeModalProps) {
  const [inviteUrl, setInviteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const extractInviteCode = (url: string): string | null => {
    try {
      // URL에서 초대 코드 추출
      const patterns = [
        /\/invite\/([a-zA-Z0-9]+)/, // /invite/code 패턴
        /invite\/([a-zA-Z0-9]+)/, // invite/code 패턴
        /^([a-zA-Z0-9]+)$/, // 코드만 입력한 경우
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!inviteUrl.trim()) {
      setError("초대 링크 또는 초대 코드를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const inviteCode = extractInviteCode(inviteUrl.trim());

      if (!inviteCode) {
        setError("올바른 초대 링크 형식이 아닙니다.");
        return;
      }

      // 초대 페이지로 리다이렉션
      router.push(`/invite/${inviteCode}`);
      onClose();
    } catch (err) {
      setError("초대 링크 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setInviteUrl("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "28rem",
          backgroundColor: "var(--surface-color)",
          borderRadius: "1rem",
          padding: "1.5rem",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
          margin: "1rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2rem",
              height: "2rem",
              borderRadius: "50%",
              backgroundColor: "#dcfce7",
            }}
          >
            <Users size={20} color="#22c55e" />
          </div>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text-color-strong)",
            }}
          >
            계약 초대 받기
          </h3>
        </div>

        {/* 설명 */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          <p
            style={{
              color: "var(--text-color-normal)",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            친구로부터 받은 초대 링크를 입력하여
            <br />
            계약의 감독자로 참여해보세요!
          </p>
        </div>

        {/* 입력 필드 */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-color-strong)",
              marginBottom: "0.5rem",
            }}
          >
            초대 링크 또는 초대 코드
          </label>
          <div style={{ position: "relative" }}>
            <Link
              size={16}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-color-light)",
              }}
            />
            <input
              type="text"
              value={inviteUrl}
              onChange={(e) => setInviteUrl(e.target.value)}
              placeholder="https://jinjjahalgae.xyz/invite/abc123 또는 abc123"
              disabled={isLoading}
              style={{
                width: "100%",
                paddingLeft: "2.5rem",
                paddingRight: "1rem",
                paddingTop: "0.75rem",
                paddingBottom: "0.75rem",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                backgroundColor: isLoading ? "#f9fafb" : "var(--surface-color)",
                color: "var(--text-color-strong)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary-color)";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-color)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                padding: "0.75rem",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              <AlertTriangle
                size={16}
                color="#dc2626"
                style={{ flexShrink: 0, marginTop: "0.125rem" }}
              />
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#dc2626",
                }}
              >
                {error}
              </p>
            </div>
          )}
        </div>

        {/* 안내 정보 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
            padding: "0.875rem",
            backgroundColor: "#fff4e6",
            borderRadius: "0.5rem",
            color: "#e8590c",
            fontSize: "0.8125rem",
            fontWeight: 500,
            marginBottom: "1.5rem",
          }}
        >
          <InfoIcon />
          <div>
            <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
              💡 이런 형태의 링크를 입력하세요:
            </p>
            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
              <li>https://jinjjahalgae.xyz/invite/abc123</li>
              <li>invite/abc123</li>
              <li>abc123 (코드만)</li>
            </ul>
          </div>
        </div>

        {/* 버튼 */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
          }}
        >
          <Button
            variant="outline"
            fullWidth
            onClick={handleClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            variant="dark"
            fullWidth
            onClick={handleSubmit}
            disabled={isLoading || !inviteUrl.trim()}
            loading={isLoading}
          >
            초대 받기
          </Button>
        </div>
      </div>
    </div>
  );
}
