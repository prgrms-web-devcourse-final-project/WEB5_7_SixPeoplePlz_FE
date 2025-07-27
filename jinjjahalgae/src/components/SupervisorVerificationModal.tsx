/**
 * 감독자 인증 검토 바텀시트 컴포넌트
 * - 감독자가 인증을 승인/거절할 때 사용하는 통합 바텀시트
 * - 인증 이미지 미리보기 및 네비게이션
 * - 피드백 프리셋과 코멘트 작성
 * - 일관된 UI/UX 제공
 */

import React, { useState, useEffect } from "react";
import { BottomSheet, Button, ModalActions, BottomSheetSection } from "./ui";
import {
  Check,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
  Eye,
  Image,
  AlertTriangle,
} from "lucide-react";
import { getImageUrl } from "@/lib/env";
import { useAlert } from "./ui";

// 피드백 프리셋
const APPROVAL_PRESETS = [
  "잘하셨습니다! 👍",
  "목표 달성을 위해 화이팅! 💪",
  "꾸준히 하고 계시네요 👏",
  "완벽한 인증이에요! ✨",
];

const REJECTION_PRESETS = [
  "좀 더 명확한 인증 사진이 필요해요",
  "인증 기준에 맞지 않는 것 같습니다",
  "다시 한번 확인해주세요",
  "사진이 흐려서 확인이 어려워요",
];

interface SupervisorVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (action: "approve" | "reject", comment: string) => void;
  verification: {
    id: number;
    images: string[]; // imageKey 배열 (null이 아닌 값들만)
    memo?: string;
    createdAt: string;
    contractTitle: string;
    contractorName: string;
    isReProof?: boolean;
    remainingTime?: string;
  };
  isLoading?: boolean;
}

export function SupervisorVerificationModal({
  isOpen,
  onClose,
  onSubmit,
  verification,
  isLoading = false,
}: SupervisorVerificationModalProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const { showAlert, AlertComponent } = useAlert();

  // 이미지 인덱스 유효성 검사
  const validImageIndex = Math.max(
    0,
    Math.min(selectedImageIndex, verification.images.length - 1)
  );

  // 이미지 배열이 변경되면 인덱스 재설정
  useEffect(() => {
    if (verification.images.length === 0) {
      setSelectedImageIndex(0);
    } else if (selectedImageIndex >= verification.images.length) {
      setSelectedImageIndex(Math.max(0, verification.images.length - 1));
    }
  }, [verification.images.length, selectedImageIndex]);

  const handleActionSelect = (selectedAction: "approve" | "reject") => {
    setAction(selectedAction);
  };

  const handlePresetClick = (preset: string) => {
    if (comment.trim()) {
      setComment(comment + " " + preset);
    } else {
      setComment(preset);
    }
  };

  const handleSubmit = () => {
    if (!action) {
      showAlert({
        message: "승인 또는 거절을 선택해주세요.",
        type: "warning",
      });
      return;
    }

    if (action === "reject" && !comment.trim()) {
      showAlert({
        message: "거절 시에는 사유를 입력해주세요.",
        type: "warning",
      });
      return;
    }

    onSubmit(action, comment);
    handleClose();
  };

  const handleClose = () => {
    setAction(null);
    setComment("");
    setSelectedImageIndex(0);
    setShowImageModal(false);
    onClose();
  };

  const handleImageNavigation = (direction: "prev" | "next") => {
    if (verification.images.length <= 1) return;

    if (direction === "prev") {
      setSelectedImageIndex(
        validImageIndex > 0
          ? validImageIndex - 1
          : verification.images.length - 1
      );
    } else {
      setSelectedImageIndex(
        validImageIndex < verification.images.length - 1
          ? validImageIndex + 1
          : 0
      );
    }
  };

  const currentPresets =
    action === "approve" ? APPROVAL_PRESETS : REJECTION_PRESETS;

  if (!isOpen) return null;

  return (
    <>
      <AlertComponent />
      <BottomSheet
        isOpen={isOpen}
        onClose={handleClose}
        title="인증 검토"
        height="xl"
        headerIcon={
          action === "approve" ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : action === "reject" ? (
            <X className="w-5 h-5 text-red-600" />
          ) : (
            <Camera className="w-5 h-5 text-blue-600" />
          )
        }
        footer={
          <ModalActions noPadding>
            <Button variant="secondary" fullWidth onClick={handleClose}>
              취소
            </Button>
            <Button
              fullWidth
              onClick={handleSubmit}
              disabled={
                !action || isLoading || (action === "reject" && !comment.trim())
              }
              loading={isLoading}
              variant={
                action === "approve"
                  ? "success"
                  : action === "reject"
                  ? "danger"
                  : "primary"
              }
            >
              {action === "approve"
                ? "승인하기"
                : action === "reject"
                ? "거절하기"
                : "결정 필요"}
            </Button>
          </ModalActions>
        }
      >
        <div className="space-y-6">
          {/* 계약 정보 */}
          <BottomSheetSection variant="highlighted">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">
                {verification.contractTitle}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">인증자:</span>{" "}
                  {verification.contractorName}
                </p>
                <p>
                  <span className="font-medium">제출일:</span>{" "}
                  {new Date(verification.createdAt).toLocaleString("ko-KR")}
                </p>
                <p>
                  <span className="font-medium">인증 이미지:</span>{" "}
                  {verification.images.length > 0
                    ? `${verification.images.length}장`
                    : "없음"}
                </p>
                {verification.isReProof && (
                  <p className="text-orange-600 font-medium">🔄 재인증 요청</p>
                )}
                {verification.remainingTime && (
                  <p className="text-blue-600 font-medium">
                    ⏰ {verification.remainingTime}
                  </p>
                )}
              </div>
            </div>
          </BottomSheetSection>

          {/* 인증 이미지 */}
          <BottomSheetSection title="인증 사진">
            {verification.images.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Image className="w-12 h-12 mb-3 text-gray-400" />
                <p className="text-sm">제출된 인증 사진이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 메인 이미지 */}
                <div className="relative">
                  <div
                    className="relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setShowImageModal(true)}
                  >
                    <img
                      src={getImageUrl(verification.images[validImageIndex])}
                      alt={`인증 사진 ${validImageIndex + 1}`}
                      className="w-full h-64 object-cover"
                    />

                    {/* 확대 보기 오버레이 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    </div>

                    {/* 이미지 네비게이션 */}
                    {verification.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageNavigation("prev");
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageNavigation("next");
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* 이미지 인디케이터 */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                          {validImageIndex + 1} / {verification.images.length}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 썸네일 목록 */}
                {verification.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {verification.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`
                          flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all
                          ${
                            validImageIndex === index
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`썸네일 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </BottomSheetSection>

          {/* 인증 메모 */}
          {verification.memo && (
            <BottomSheetSection title="인증 메모" variant="highlighted">
              <p className="text-gray-700 leading-relaxed">
                {verification.memo}
              </p>
            </BottomSheetSection>
          )}

          {/* 검토 결정 */}
          <BottomSheetSection title="검토 결정">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleActionSelect("approve")}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    action === "approve"
                      ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200"
                      : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <Check className="w-6 h-6" />
                  <span className="font-medium">승인</span>
                </div>
              </button>

              <button
                onClick={() => handleActionSelect("reject")}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    action === "reject"
                      ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200"
                      : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <X className="w-6 h-6" />
                  <span className="font-medium">거절</span>
                </div>
              </button>
            </div>
          </BottomSheetSection>

          {/* 피드백 작성 */}
          {action && (
            <BottomSheetSection
              title={`피드백 ${action === "reject" ? "(필수)" : "(선택)"}`}
            >
              {/* 프리셋 버튼들 */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">빠른 입력:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentPresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handlePresetClick(preset)}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  rows={4}
                  placeholder={
                    action === "approve"
                      ? "칭찬과 격려의 메시지를 남겨주세요 (선택사항)"
                      : "거절 사유를 구체적으로 작성해주세요 (필수)"
                  }
                  maxLength={300}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {action === "reject"
                      ? "거절 사유는 필수입니다"
                      : "격려 메시지로 동기부여를 제공해보세요"}
                  </span>
                  <span>{comment.length}/300</span>
                </div>
              </div>
            </BottomSheetSection>
          )}

          {/* 검토 가이드라인 */}
          <BottomSheetSection title="검토 가이드라인" variant="info">
            <ul className="text-sm text-blue-800 space-y-1.5">
              <li>• 목표와 관련된 명확한 증거가 포함되어 있는지 확인하세요</li>
              <li>
                • 사진이 선명하고 인증 내용을 명확히 보여주는지 검토하세요
              </li>
              <li>• 의심스러운 부분은 구체적인 사유와 함께 거절해주세요</li>
              <li>• 승인 시에는 격려 메시지로 계속 동기부여를 제공해주세요</li>
            </ul>
          </BottomSheetSection>
        </div>
      </BottomSheet>
    </>
  );
}
