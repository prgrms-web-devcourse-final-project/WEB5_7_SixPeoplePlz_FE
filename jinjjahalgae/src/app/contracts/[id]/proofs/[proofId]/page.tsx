"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  X,
  ArrowLeft,
  Home,
} from "lucide-react";

// API imports
import { getProof } from "@/lib/api/proofs";
import { getContract } from "@/lib/api/contracts";
import { getImageUrl } from "@/lib/env";
import { isoStringToKoreanDateString } from "@/lib/utils/date";
import {
  ProofDetailResponse,
  ContractPreviewResponse,
} from "../../../../../../docs/data-contracts";
import { CommonHeader } from "@/components/CommonHeader";
import ProofDetail from "@/components/proof/ProofDetail";

// --- 아이콘 컴포넌트 ---
const ChevronLeftIcon = () => <ChevronLeft size={24} />;
const CheckCircleIcon = ({ className = "h-5 w-5 text-[#15803d]" }) => (
  <CheckCircle className={className} />
);
const XCircleIcon = ({ className = "h-5 w-5 text-[#ef4444]" }) => (
  <XCircle className={className} />
);
const XIcon = () => <X size={24} className="text-[#6b7280]" />;
const ArrowLeftIcon = () => <ArrowLeft size={24} />;
const HomeIcon = () => <Home size={24} />;

// --- 이미지 슬라이더 컴포넌트 ---
const ImageSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    if (sliderRef.current) {
      sliderRef.current.style.transition = "none";
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const moveX = clientX - startX;
    setTranslateX(moveX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (sliderRef.current) {
      sliderRef.current.style.transition = "transform 0.3s ease-in-out";
    }

    const threshold = sliderRef.current?.clientWidth
      ? sliderRef.current.clientWidth / 4
      : 100;

    if (translateX < -threshold && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (translateX > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }

    setTranslateX(0);
  };

  const goToSlide = (index: number) => {
    if (sliderRef.current) {
      sliderRef.current.style.transition = "transform 0.3s ease-in-out";
    }
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={sliderRef}
        className="flex"
        style={{
          transform: `translateX(calc(-${
            currentIndex * 100
          }% + ${translateX}px))`,
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {images.map((imgSrc, index) => (
          <div key={index} className="flex-shrink-0 w-full">
            <img
              src={imgSrc}
              alt={`인증 사진 ${index + 1}`}
              className="w-full h-auto object-cover rounded-md select-none"
              draggable="false"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://placehold.co/600x400/e5e7eb/6b7280?text=Image+Not+Found";
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center my-3 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentIndex === index ? "bg-[#2563eb]" : "bg-[#e5e7eb]"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// --- 상태 모달 컴포넌트 ---
interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const StatusModal = ({ isOpen, onClose, data }: StatusModalProps) => {
  if (!isOpen) return null;
  const isApproved = data.status === "APPROVED";
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <XIcon />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold">
            {isApproved ? "인증 승인" : "인증 거절"}
          </h2>
          {isApproved ? (
            <div className="flex items-center gap-1 text-sm text-[#15803d] font-semibold">
              <CheckCircleIcon className="w-5 h-5" />
              <span>승인</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-[#ef4444] font-semibold">
              <XCircleIcon className="w-5 h-5" />
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

// --- 메인 컴포넌트 ---
const ProofDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const proofId = parseInt(params.proofId as string);
  const contractId = parseInt(params.id as string);

  const [proofDetail, setProofDetail] = useState<ProofDetailResponse | null>(
    null
  );
  const [contractInfo, setContractInfo] =
    useState<ContractPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReasonData, setSelectedReasonData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 인증 상세 정보 조회
        const proofResponse = await getProof(proofId);
        const proofData = (proofResponse as any).result || proofResponse;
        setProofDetail(proofData);

        // 계약 정보 조회
        const contractResponse = await getContract(contractId);
        const contractData =
          (contractResponse as any).result || contractResponse;
        setContractInfo(contractData);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (proofId && contractId) {
      loadData();
    }
  }, [proofId, contractId]);

  const handleReasonClick = (feedback: any) => {
    if (feedback.comment) {
      setSelectedReasonData(feedback);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReasonData(null);
  };

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

  if (loading) {
    return (
      <div className="font-pretendard bg-[#f0f5ff] min-h-screen p-0 sm:p-4 flex justify-center">
        <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !proofDetail) {
    return (
      <div className="font-pretendard bg-[#f0f5ff] min-h-screen p-0 sm:p-4 flex justify-center">
        <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl">
          <div className="text-center py-12">
            <XCircle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-gray-600">
              {error || "인증 정보를 찾을 수 없습니다."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const images = proofDetail.imageKeys?.map((key) => getImageUrl(key)) || [];
  const status = proofDetail.status || "APPROVE_PENDING";
  const createdDate = proofDetail.createdAt
    ? new Date(proofDetail.createdAt).toLocaleDateString("ko-KR")
    : "";

  return (
    <div className="font-pretendard bg-[#f0f5ff] min-h-screen p-0 sm:p-4 flex justify-center">
      <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl">
        <CommonHeader
          title={`${createdDate} 인증`}
          rightContent={
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(
                status
              )}`}
            >
              {getStatusText(status)}
            </span>
          }
        />

        <main className="p-4 space-y-6">
          <ProofDetail
            proofDetail={proofDetail}
            onFeedbackClick={handleReasonClick}
          />
        </main>
      </div>

      <StatusModal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={selectedReasonData}
      />
    </div>
  );
};

export default ProofDetailPage;
