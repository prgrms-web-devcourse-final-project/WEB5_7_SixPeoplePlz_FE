import React from "react";
import { ThumbsUp, ThumbsDown, Clock, AlertTriangle } from "lucide-react";
import { getImageUrl } from "@/lib/env";

interface ProofPendingCardProps {
  item: {
    proofId: number;
    status: string;
    date: string;
    description: string;
    imageUrls?: string[];
    imageKey?: string;
    isReProof?: boolean;
    remainingTime?: string;
  };
  onImageClick: (item: any) => void;
  onOpenVerificationModal: (type: "approve" | "reject", item: any) => void;
}

const COLORS = {
  blue: "#2563eb",
  red: "#ef4444",
  yellow: "#f59e0b",
  lightYellow: "#fef3c7",
  textGray: "#6b7280",
  reAuthBg: "#fffbeb",
  reAuthBorder: "#fde68a",
};

const ProofPendingCard: React.FC<ProofPendingCardProps> = ({
  item,
  onImageClick,
  onOpenVerificationModal,
}) => {
  const isReAuth = item.isReProof || false;

  const getStatusText = (status: string, isReProof: boolean = false) => {
    if (isReProof) return "재인증 대기중";
    switch (status) {
      case "APPROVE_PENDING":
        return "승인 대기중";
      default:
        return "대기중";
    }
  };

  return (
    <div
      className="rounded-xl shadow-sm p-4 border"
      style={{
        backgroundColor: isReAuth ? COLORS.reAuthBg : "white",
        borderColor: isReAuth ? COLORS.reAuthBorder : "transparent",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <button
            onClick={() => onImageClick(item)}
            className="flex-shrink-0"
            aria-label={`${item.date} 인증 사진 보기`}
          >
            <img
              src={
                item.imageKey
                  ? getImageUrl(item.imageKey)
                  : item.imageUrls && item.imageUrls.length > 0
                  ? item.imageUrls[0]
                  : "https://placehold.co/100x100/e2e8f0/e2e8f0?text="
              }
              alt="인증 사진 썸네일"
              className="w-16 h-16 rounded-lg object-cover cursor-pointer transition-transform hover:scale-105"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src =
                  "https://placehold.co/100x100/e2e8f0/64748b?text=Error";
              }}
            />
          </button>
          <div className="flex-grow min-w-0">
            <p className="font-bold text-gray-800 text-base truncate">
              {item.date.replace(/-/g, ".")}
            </p>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {item.description}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-1 flex-shrink-0">
          <div
            className="inline-flex items-center text-xs py-1 px-2 rounded-md"
            style={{
              backgroundColor: isReAuth ? "white" : COLORS.lightYellow,
              color: COLORS.yellow,
            }}
          >
            <Clock size={14} className="mr-1.5" />
            <span className="font-semibold">
              {getStatusText(item.status, isReAuth)}
            </span>
          </div>
          {item.remainingTime && (
            <p
              className="text-xs font-medium"
              style={{ color: COLORS.textGray }}
            >
              {item.remainingTime}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={() => onOpenVerificationModal("approve", item)}
          className="w-full font-bold py-2.5 px-4 rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2 text-white"
          style={{ backgroundColor: COLORS.blue }}
        >
          <ThumbsUp size={18} />
          <span>승인</span>
        </button>
        <button
          onClick={() => onOpenVerificationModal("reject", item)}
          className="w-full font-bold py-2.5 px-4 rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2 text-white"
          style={{ backgroundColor: COLORS.red }}
        >
          <ThumbsDown size={18} />
          <span>거절</span>
        </button>
      </div>
    </div>
  );
};

export default ProofPendingCard;
