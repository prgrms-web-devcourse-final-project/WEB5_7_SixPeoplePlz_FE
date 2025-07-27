import React from "react";
import ProofImageSlider from "./ProofImageSlider";
import ProofFeedbackList from "./ProofFeedbackList";
import { getImageUrl } from "@/lib/env";

interface ProofDetailProps {
  proofDetail: any;
  contractInfo?: any;
  onFeedbackClick?: (feedback: any) => void;
}

const ProofDetail: React.FC<ProofDetailProps> = ({
  proofDetail,
  contractInfo,
  onFeedbackClick,
}) => {
  if (!proofDetail) return null;
  const images =
    proofDetail.imageKeys?.map((key: string) =>
      typeof key === "string" ? getImageUrl(key) : ""
    ) || [];
  const status = proofDetail.status || "APPROVE_PENDING";
  const createdDate = proofDetail.createdAt
    ? new Date(proofDetail.createdAt).toLocaleDateString("ko-KR")
    : "";

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "승인완료";
      case "REJECTED":
        return "거절됨";
      case "APPROVE_PENDING":
        return "대기중";
      default:
        return "알 수 없음";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-[#15803d] bg-green-100";
      case "REJECTED":
        return "text-[#ef4444] bg-red-100";
      case "APPROVE_PENDING":
        return "text-[#f59e0b] bg-yellow-100";
      default:
        return "text-[#6b7280] bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-bold">{createdDate} 인증</h1>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(
            status
          )}`}
        >
          {getStatusText(status)}
        </span>
      </div>
      <section>
        <h2 className="text-lg font-bold mb-3">인증 사진</h2>
        <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-sm p-4">
          {images.length > 0 ? (
            <ProofImageSlider images={images} />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">이미지가 없습니다</p>
            </div>
          )}
          {proofDetail.comment && (
            <div className="bg-white border border-[#e5e7eb] rounded-md p-4 min-h-[6rem] mt-4">
              <p className="text-[#6b7280] text-sm">{proofDetail.comment}</p>
            </div>
          )}
        </div>
      </section>
      {proofDetail.feedbacks && proofDetail.feedbacks.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-3">승인/거절 사유</h2>
          <ProofFeedbackList
            feedbacks={proofDetail.feedbacks}
            onFeedbackClick={onFeedbackClick}
          />
        </section>
      )}
    </div>
  );
};

export default ProofDetail;
