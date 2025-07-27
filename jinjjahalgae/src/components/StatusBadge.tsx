/**
 * 계약 상태 뱃지 컴포넌트
 * 메인 페이지와 상세 페이지에서 공통으로 사용
 */

import React from "react";

// 계약 상태 타입 정의
export type ContractStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "ABANDONED"
  | "WAIT_RESULT"
  | string;

// 상태별 스타일 정의
const STATUS_STYLES = {
  PENDING: {
    backgroundColor: "#f1f3f5",
    color: "#868e96",
    text: "시작 전",
  },
  IN_PROGRESS: {
    backgroundColor: "#e7f5ff",
    color: "#1c7ed6",
    text: "진행중",
  },
  COMPLETED: {
    backgroundColor: "#dcfce7",
    color: "#22c55e",
    text: "이행완료",
  },
  FAILED: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    text: "이행실패",
  },
  ABANDONED: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    text: "계약 포기",
  },
  WAIT_RESULT: {
    backgroundColor: "#f0f9ff",
    color: "#0284c7",
    text: "정산 대기중",
  },
} as const;

// 기본 스타일 (알 수 없는 상태)
const DEFAULT_STYLE = {
  backgroundColor: "#f1f3f5",
  color: "#868e96",
  text: "시작 전",
};

// 상태에 따른 스타일 반환 함수
export const getStatusStyle = (status: ContractStatus) => {
  return STATUS_STYLES[status as keyof typeof STATUS_STYLES] || DEFAULT_STYLE;
};

// 상태에 따른 텍스트 반환 함수
export const getStatusText = (status: ContractStatus) => {
  return getStatusStyle(status).text;
};

// 상태 뱃지 컴포넌트 (인라인 스타일 버전)
interface StatusBadgeProps {
  status: ContractStatus;
  className?: string;
  style?: React.CSSProperties;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
  style = {},
}) => {
  const statusStyle = getStatusStyle(status);

  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full ${className}`}
      style={{
        backgroundColor: statusStyle.backgroundColor,
        color: statusStyle.color,
        ...style,
      }}
    >
      {statusStyle.text}
    </span>
  );
};

// Tailwind CSS 버전 (필요시 사용)
export const StatusBadgeTailwind: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const getStatusClasses = (status: ContractStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-600";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-600";
      case "COMPLETED":
        return "bg-green-50 text-green-600";
      case "FAILED":
      case "ABANDONED":
        return "bg-red-50 text-red-600";
      case "WAIT_RESULT":
        return "bg-sky-50 text-sky-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusClasses(
        status
      )} ${className}`}
    >
      {getStatusText(status)}
    </span>
  );
};

export default StatusBadge;
