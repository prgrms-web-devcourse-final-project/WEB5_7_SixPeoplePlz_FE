/**
 * 계약 관련 유틸리티 함수들
 */

import { ContractListResponse } from "@/../docs/data-contracts";

// 계약 진행률 계산
export const getProgressPercentage = (contract: ContractListResponse) => {
  if (!contract.achievementRatio) return 0;
  const [current, total] = contract.achievementRatio.split("/").map(Number);
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

// 계약 기간 진행률 계산
export const getDeadlineProgress = (contract: ContractListResponse) => {
  if (!contract.startDate || !contract.endDate) return 0;

  const now = new Date();
  const start = new Date(contract.startDate);
  const end = new Date(contract.endDate);

  if (now < start) return 0;
  if (now > end) return 100;

  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();

  // 시분초 단위까지 정확하게 계산
  const progress = (elapsed / totalDuration) * 100;
  
  // 소수점 2자리까지 반올림하여 정확도 향상
  return Math.round(progress * 100) / 100;
};

// 주간 빈도 계산 (감독 탭용)
export const getWeeklyFrequency = (contract: ContractListResponse) => {
  if (!contract.achievementRatio || !contract.startDate || !contract.endDate)
    return "미정";

  const [, total] = contract.achievementRatio.split("/").map(Number);
  const start = new Date(contract.startDate);
  const end = new Date(contract.endDate);
  const weeksDiff = Math.ceil(
    (end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  if (weeksDiff <= 0) return "미정";

  const weeklyFreq = Math.round(total / weeksDiff);
  return `주 ${weeklyFreq}회`;
};

// 계약 상태에 따른 버튼 정보 반환
export const getContractStatus = (contract: ContractListResponse) => {
  const now = new Date();
  const startDate = new Date(contract.startDate!);

  // 계약 상태별 처리
  switch (contract.contractStatus) {
    case "PENDING":
      return {
        canVerify: false,
        buttonText: "승인 대기중",
        buttonVariant: "ghost" as const,
      };

    case "IN_PROGRESS":
      return {
        canVerify: true,
        buttonText: "인증하기",
        buttonVariant: "dark" as const,
      };

    case "COMPLETED":
      return {
        canVerify: false,
        buttonText: "완료됨",
        buttonVariant: "outline" as const,
      };

    case "FAILED":
      return {
        canVerify: false,
        buttonText: "실패",
        buttonVariant: "outline" as const,
      };

    case "ABANDONED":
      return {
        canVerify: false,
        buttonText: "포기됨",
        buttonVariant: "outline" as const,
      };

    case "WAIT_RESULT":
      return {
        canVerify: false,
        buttonText: "결과 대기중",
        buttonVariant: "ghost" as const,
      };

    default:
      // 시작일이 아직 안 됨 (날짜 기반 체크)
      if (now < startDate) {
        return {
          canVerify: false,
          buttonText: "시작 전",
          buttonVariant: "ghost" as const,
        };
      }

      return {
        canVerify: false,
        buttonText: "종료됨",
        buttonVariant: "outline" as const,
      };
  }
};

// 날짜 포맷팅
export const formatDate = (
  dateString: string,
  format: "short" | "long" = "long"
) => {
  const date = new Date(dateString);

  if (format === "short") {
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * 카카오톡 공유 메시지 생성 (감독자 초대)
 */
export function getKakaoInviteShareMessage({
  inviterName = "계약자",
  contractTitle = "계약서",
  inviteUrl,
  password,
}: {
  inviterName?: string;
  contractTitle?: string;
  inviteUrl: string;
  password: string;
}): string {
  return `[
진짜할게]
당신을 ${inviterName}님의 ${contractTitle} 계약 감독으로 초대합니다.
아래 링크로 접속하여 계약 내용을 확인하고 서명해주세요.
- 초대 링크: ${inviteUrl}
- 비밀번호: ${password}
* 이 링크는 24시간 동안 유효합니다.`;
}
