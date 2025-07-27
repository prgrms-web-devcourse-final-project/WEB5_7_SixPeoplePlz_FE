import React from "react";
import { CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { getImageUrl } from "@/lib/env";

interface ProofVerificationCardProps {
  verification: {
    proofId: number;
    status: string;
    createdAt?: string;
    comment?: string;
    imageKey?: string;
    imageUrls?: string[];
    isReProof?: boolean;
    completeSupervisors?: number;
    totalSupervisors?: number;
    rejectedAt?: string; // 거절된 시간
  };
  onClick?: () => void;
  showApprovalCount?: boolean;
  onReProofRequest?: (proofId: number) => void; // 재인증 요청 콜백
}

const COLORS = {
  gray: "#e5e7eb",
  grayText: "#6b7280",
  green: "#16a34a",
  red: "#ef4444",
  yellow: "#f59e0b",
  blue: "#2563eb",
};

const ProofVerificationCard: React.FC<ProofVerificationCardProps> = ({
  verification,
  onClick,
  showApprovalCount = true,
  onReProofRequest,
}) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          text: "승인",
          color: COLORS.green,
          icon: <CheckCircle size={16} color={COLORS.green} />,
        };
      case "APPROVE_PENDING":
        return {
          text: "대기중",
          color: COLORS.yellow,
          icon: <Clock size={16} color={COLORS.yellow} />,
        };
      case "REJECTED":
        return {
          text: "거절됨",
          color: COLORS.red,
          icon: <AlertCircle size={16} color={COLORS.red} />,
        };
      default:
        return {
          text: "알수없음",
          color: COLORS.grayText,
          icon: <AlertCircle size={16} color={COLORS.grayText} />,
        };
    }
  };

  // 24시간 체크 로직
  const canRequestReProof = () => {
    if (verification.status !== "REJECTED" || verification.isReProof) {
      return false;
    }

    if (!verification.rejectedAt) {
      return false;
    }

    const rejectedTime = new Date(verification.rejectedAt);
    const currentTime = new Date();
    const timeDiff = currentTime.getTime() - rejectedTime.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    return hoursDiff < 24;
  };

  const statusInfo = getStatusInfo(verification.status);
  const formattedDate = verification.createdAt
    ? new Date(verification.createdAt)
        .toLocaleDateString("ko-KR")
        .replace(/\. /g, ".")
    : "날짜 없음";

  // 이미지 우선순위: imageKey → imageUrls[0] → placeholder
  const imageSrc = verification.imageKey
    ? getImageUrl(verification.imageKey)
    : verification.imageUrls && verification.imageUrls.length > 0
    ? verification.imageUrls[0]
    : "https://placehold.co/100x100/e2e8f0/e2e8f0?text=";

  const showReProofButton = canRequestReProof();

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="인증 이미지"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ backgroundColor: COLORS.gray }}
            ></div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold">
            {formattedDate}
            {verification.isReProof ? " 재인증" : " 인증"}
          </p>
          <p className="text-sm" style={{ color: COLORS.grayText }}>
            {verification.comment || "인증 완료"}
          </p>
          {showApprovalCount &&
            verification.completeSupervisors !== undefined && (
              <p className="text-xs" style={{ color: COLORS.grayText }}>
                {verification.completeSupervisors}/
                {verification.totalSupervisors} 승인
              </p>
            )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div
            className="flex items-center space-x-1 text-xs"
            style={{ color: statusInfo.color }}
          >
            {statusInfo.icon}
            <span>{statusInfo.text}</span>
          </div>
          
          {/* 재인증 요청 버튼 */}
          {showReProofButton && onReProofRequest && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // 카드 클릭 이벤트 방지
                onReProofRequest(verification.proofId);
              }}
              className="flex items-center space-x-1 text-xs px-2 py-1 rounded-md transition-colors"
              style={{
                backgroundColor: COLORS.blue,
                color: "white",
              }}
            >
              <RefreshCw size={12} />
              <span>재인증 요청</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProofVerificationCard;
