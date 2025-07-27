import React from "react";
import { X, CheckCircle, XCircle } from "lucide-react";

interface ProofStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const ProofStatusModal: React.FC<ProofStatusModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen) return null;
  const isApproved = data.status === "APPROVED";
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold">
            {isApproved ? "인증 승인" : "인증 거절"}
          </h2>
          {isApproved ? (
            <div className="flex items-center gap-1 text-sm text-[#15803d] font-semibold">
              <CheckCircle className="w-5 h-5" />
              <span>승인</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-[#ef4444] font-semibold">
              <XCircle className="w-5 h-5" />
              <span>거절</span>
            </div>
          )}
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-md p-4 min-h-[8rem]">
          <p className="text-[#6b7280] whitespace-pre-wrap">{data.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default ProofStatusModal;
