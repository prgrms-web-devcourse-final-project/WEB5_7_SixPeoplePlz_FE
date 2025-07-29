/**
 * 계약 인증 승인/거절 모달 컴포넌트
 * - 감독자가 인증을 승인하거나 거절할 때 사용
 * - 코멘트 작성 기능 및 프리셋 제공
 * - 인증 사진 확인 기능
 */

import React, { useState } from "react";
import { Modal, ModalActions, Button, ModalSection } from "./ui";
import {
  Check,
  X,
  Plus,
  Camera,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { getImageUrl } from "@/lib/env";

import { useAlert } from "./ui";

// 피드백 프리셋
const APPROVAL_PRESETS = [
  "잘하셨습니다! 👍",
  "목표 달성을 위해 화이팅! 💪",
  "꾸준히 하고 계시네요 👏",
];

const REJECTION_PRESETS = [
  "좀 더 명확한 인증 사진이 필요해요",
  "인증 기준에 맞지 않는 것 같습니다",
  "다시 한번 확인해주세요",
];

interface VerificationReviewModalProps {
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
  };
  isLoading?: boolean;
}

export function VerificationReviewModal({
  isOpen,
  onClose,
  onSubmit,
  verification,
  isLoading = false,
}: VerificationReviewModalProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { showAlert, AlertComponent } = useAlert();

  // 이미지 인덱스가 유효한 범위에 있는지 확인하고 조정
  const validImageIndex = Math.min(
    selectedImageIndex,
    Math.max(0, (verification.images?.length || 1) - 1)
  );

  const handleActionSelect = (selectedAction: "approve" | "reject") => {
    setAction(selectedAction);
    setShowCommentInput(true);
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
    setShowCommentInput(false);
    setSelectedImageIndex(0);
    onClose();
  };

  const currentPresets =
    action === "approve" ? APPROVAL_PRESETS : REJECTION_PRESETS;

  if (!isOpen) return null;

  return (
    <>
      <AlertComponent />
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="인증 심사"
        size="xl"
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
          <ModalActions>
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
                : "결정하기"}
            </Button>
          </ModalActions>
        }
      >
        <div className="space-y-6">
          {/* 인증 정보 */}
          <ModalSection variant="highlighted">
            <h3 className="font-medium text-gray-900 mb-2">
              {verification.contractTitle}
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>인증자:</strong> {verification.contractorName}
              </p>
              <p>
                <strong>제출일:</strong>{" "}
                {new Date(verification.createdAt).toLocaleString("ko-KR")}
              </p>
              <p>
                <strong>인증 사진:</strong> {verification.images?.length || 0}장
              </p>
            </div>
          </ModalSection>

          {/* 인증 사진들 */}
          <ModalSection title="인증 사진">
            {verification.images && verification.images.length > 0 ? (
              <>
                {/* 메인 이미지 */}
                <div className="relative mb-3">
                  <img
                    src={getImageUrl(verification.images[validImageIndex])}
                    alt={`인증 사진 ${validImageIndex + 1}`}
                    className="w-full h-64 object-cover rounded-lg border"
                  />

                  {/* 이미지 네비게이션 */}
                  {verification.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            validImageIndex > 0
                              ? validImageIndex - 1
                              : verification.images.length - 1
                          )
                        }
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            validImageIndex < verification.images.length - 1
                              ? validImageIndex + 1
                              : 0
                          )
                        }
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* 이미지 인디케이터 */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        {validImageIndex + 1} / {verification.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* 썸네일 목록 */}
                {verification.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {verification.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-colors ${
                          validImageIndex === index
                            ? "border-blue-500"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
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
              </>
            ) : (
              /* 이미지가 없는 경우 */
              <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">인증 사진이 없습니다</p>
              </div>
            )}
          </ModalSection>

          {/* 인증 메모 */}
          {verification.memo && (
            <ModalSection title="인증 메모" variant="highlighted">
              <p className="text-gray-700">{verification.memo}</p>
            </ModalSection>
          )}

          {/* 심사 결정 */}
          <ModalSection title="심사 결정">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleActionSelect("approve")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  action === "approve"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  승인
                </div>
              </button>

              <button
                onClick={() => handleActionSelect("reject")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  action === "reject"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <X className="w-5 h-5" />
                  거절
                </div>
              </button>
            </div>
          </ModalSection>

          {/* 코멘트 작성 */}
          {showCommentInput && (
            <ModalSection title={`코멘트${action === "reject" ? " *" : ""}`}>
              {/* 프리셋 버튼들 */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {currentPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetClick(preset)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder={
                  action === "approve"
                    ? "인증을 승인합니다. 좋은 습관 만들기 화이팅! (선택사항)"
                    : action === "reject"
                    ? "거절 사유를 구체적으로 적어주세요. (필수)"
                    : "승인/거절 선택 후 코멘트를 작성해주세요."
                }
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-1">{comment.length}/300</p>
            </ModalSection>
          )}

          {/* 심사 가이드라인 */}
          <ModalSection title="심사 가이드라인" variant="info">
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 목표와 관련된 명확한 증거가 있는지 확인</li>
              <li>• 사진이 선명하고 인증 내용을 확인할 수 있는지 검토</li>
              <li>• 의심스러운 부분이 있다면 구체적인 사유와 함께 거절</li>
              <li>• 격려와 응원의 메시지로 동기부여 제공</li>
            </ul>
          </ModalSection>
        </div>
      </Modal>
    </>
  );
}
