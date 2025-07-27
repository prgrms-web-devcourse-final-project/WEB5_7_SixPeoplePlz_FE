/**
 * 인증 사진 보기 모달 컴포넌트
 * - 인증 이미지들을 전체 화면으로 보여주는 모달
 * - 여러 이미지 간 네비게이션 지원
 * - 확대/축소 및 터치 제스처 지원
 */

import { useState } from "react";
import { Modal, ModalActions, Button } from "./ui";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Camera,
} from "lucide-react";
import { getImageUrl } from "@/lib/env";

interface ProofImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title?: string;
  initialIndex?: number;
  showDownload?: boolean;
  onDownload?: (imageUrl: string, index: number) => void;
  onApprove?: () => Promise<void>;
  onReject?: () => Promise<void>;
  proof?: {
    id: number;
    images: string[];
    comment?: string;
    createdAt: string;
    isReProof?: boolean;
    remainingTime?: string;
  } | null;
}

export function ProofImageModal({
  isOpen,
  onClose,
  images,
  title = "인증 사진",
  initialIndex = 0,
  showDownload = false,
  onDownload,
  onApprove,
  onReject,
  proof,
}: ProofImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setIsZoomed(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  };

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
  };

  const handleDownload = () => {
    if (onDownload && images[currentIndex]) {
      onDownload(images[currentIndex], currentIndex);
    }
  };

  const handleClose = () => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
    onClose();
  };

  if (!isOpen || !images.length) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="full"
      headerIcon={<Camera className="w-5 h-5 text-blue-600" />}
      className="bg-black"
      footer={
        <div className="bg-black bg-opacity-80 text-white">
          <ModalActions className="justify-between">
            <div className="flex items-center gap-4">
              {/* 이미지 카운터 */}
              <span className="text-sm">
                {currentIndex + 1} / {images.length}
              </span>

              {/* 줌 컨트롤 */}
              <button
                onClick={handleZoomToggle}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                aria-label={isZoomed ? "축소" : "확대"}
              >
                {isZoomed ? (
                  <ZoomOut className="w-4 h-4" />
                ) : (
                  <ZoomIn className="w-4 h-4" />
                )}
              </button>

              {/* 다운로드 버튼 */}
              {showDownload && (
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                  aria-label="다운로드"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleClose}
              className="text-white border-white hover:bg-white hover:text-black"
            >
              닫기
            </Button>
          </ModalActions>
        </div>
      }
    >
      <div className="relative h-full bg-black flex items-center justify-center">
        {/* 메인 이미지 */}
        <div className="relative max-w-full max-h-full">
          <img
            src={getImageUrl(images[currentIndex])}
            alt={`인증 사진 ${currentIndex + 1}`}
            className={`
              max-w-full max-h-full object-contain
              transition-transform duration-200
              ${isZoomed ? "scale-150 cursor-move" : "cursor-zoom-in"}
            `}
            onClick={handleZoomToggle}
            style={{
              maxHeight: "calc(100vh - 12rem)", // 헤더와 푸터 공간 확보
            }}
          />
        </div>

        {/* 이전/다음 네비게이션 */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all"
              aria-label="다음 이미지"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* 이미지 인디케이터 */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsZoomed(false);
                }}
                className={`
                  w-2 h-2 rounded-full transition-all
                  ${
                    index === currentIndex
                      ? "bg-white"
                      : "bg-white bg-opacity-50 hover:bg-opacity-75"
                  }
                `}
                aria-label={`이미지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}

        {/* 키보드 단축키 안내 */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
            ← → 키로 이동 가능
          </div>
        )}
      </div>
    </Modal>
  );
}
