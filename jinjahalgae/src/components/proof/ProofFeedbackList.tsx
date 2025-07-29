import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface ProofFeedbackListProps {
  feedbacks: any[];
  onFeedbackClick?: (feedback: any) => void;
  statusKey?: string;
  commentKey?: string;
  createdAtKey?: string;
}

const ProofFeedbackList: React.FC<ProofFeedbackListProps> = ({
  feedbacks = [],
  onFeedbackClick,
  statusKey = "status",
  commentKey = "comment",
  createdAtKey = "createdAt",
}) => {
  if (!feedbacks.length) return null;
  return (
    <div className="space-y-3">
      {feedbacks.map((feedback, index) => (
        <div
          key={index}
          onClick={
            onFeedbackClick ? () => onFeedbackClick(feedback) : undefined
          }
          className="bg-white border border-[#e5e7eb] rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div>
            <p className="text-xs text-[#6b7280]">
              {feedback[createdAtKey]
                ? new Date(feedback[createdAtKey]).toLocaleDateString("ko-KR")
                : ""}
            </p>
            <p className="font-semibold">
              {feedback[commentKey] || "코멘트 없음"}
            </p>
          </div>
          {feedback[statusKey] === "APPROVED" ? (
            <div className="flex items-center gap-1 text-sm text-[#15803d] font-semibold">
              <CheckCircle />
              <span>승인</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-[#ef4444] font-semibold">
              <XCircle />
              <span>거절</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProofFeedbackList;
