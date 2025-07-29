/**
 * 인증 제출 바텀시트 - 통일된 BottomSheet 시스템 사용
 * - 일관된 UI/UX와 애니메이션
 * - 통일된 섹션 구조와 스타일링
 * - 향상된 이미지 업로드 및 관리
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  BottomSheet,
  BottomSheetSection,
  ModalActions,
} from "@/components/ui";
import {
  Camera,
  Check,
  ImageIcon,
  Plus,
  Upload,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { uploadFile } from "@/lib/api/files";
import { createProof } from "@/lib/api/proofs";
import { ProofCreateRequest } from "../../docs/data-contracts";
import { useAlert } from "./ui";

interface VerificationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: number;
  contractTitle: string;
  contractGoal: string;
  onSuccess: () => void;
}

export function VerificationBottomSheet({
  isOpen,
  onClose,
  contractId,
  contractTitle,
  contractGoal,
  onSuccess,
}: VerificationBottomSheetProps) {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert, AlertComponent } = useAlert();

  useEffect(() => {
    if (isOpen) {
      // Reset state when opened
      setImages([]);
      setImagePreviews([]);
      setMemo("");
      setShowConfirmModal(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const currentImages = [...images, ...newFiles].slice(0, 3);
    setImages(currentImages);

    const newPreviews = currentImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;

    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    setImages(newImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const handleSubmit = () => {
    if (images.length === 0) {
      showAlert({
        message: "최소 1장의 사진을 업로드해주세요.",
        type: "warning",
      });
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setIsLoading(true);
    try {
      const imageUrls = await Promise.all(
        images.map((image) => uploadFile(image))
      );

      const proofData: ProofCreateRequest = {
        firstImageKey: imageUrls[0],
        secondImageKey: imageUrls.length > 1 ? imageUrls[1] : undefined,
        thirdImageKey: imageUrls.length > 2 ? imageUrls[2] : undefined,
        comment: memo,
      };

      await createProof(contractId, proofData);

      showAlert({
        message: "인증이 제출되었습니다!",
        type: "success",
      });
      onSuccess();
    } catch (error) {
      console.error("인증 제출 실패:", error);
      showAlert({
        message: "인증 제출에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
      onClose();
    }
  };

  const handleClose = () => {
    setImages([]);
    setImagePreviews([]);
    setMemo("");
    setShowConfirmModal(false);
    onClose();
  };

  return (
    <>
      <AlertComponent />
      <BottomSheet
        isOpen={isOpen}
        onClose={handleClose}
        title="인증하기"
        height="xl"
        headerIcon={<Camera className="w-5 h-5 text-blue-600" />}
        footer={
          <ModalActions>
            <Button variant="outline" fullWidth onClick={handleClose}>
              취소
            </Button>
            <Button
              fullWidth
              onClick={handleSubmit}
              disabled={images.length === 0}
              variant="primary"
            >
              <Upload className="w-4 h-4 mr-2" />
              인증 제출하기
            </Button>
          </ModalActions>
        }
      >
        <div className="space-y-6">
          {/* 계약 정보 */}
          <BottomSheetSection variant="highlighted">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg text-gray-900 mb-1">
                  {contractTitle}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {contractGoal}
                </p>
              </div>
            </div>
          </BottomSheetSection>

          {/* 사진 업로드 */}
          <BottomSheetSection title="인증 사진">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  최대 3장까지 업로드 가능
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {imagePreviews.length}/3
                </span>
              </div>

              {/* 사진 그리드 */}
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={image}
                      alt={`인증 사진 ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* 순서 표시 */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>

                    {/* 이동 버튼들 */}
                    {imagePreviews.length > 1 && (
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {index > 0 && (
                          <button
                            onClick={() => moveImage(index, index - 1)}
                            className="p-1 bg-white bg-opacity-80 rounded text-gray-600 hover:bg-opacity-100"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                        {index < imagePreviews.length - 1 && (
                          <button
                            onClick={() => moveImage(index, index + 1)}
                            className="p-1 bg-white bg-opacity-80 rounded text-gray-600 hover:bg-opacity-100"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* 업로드 버튼 */}
                {imagePreviews.length < 3 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">사진 추가</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>
          </BottomSheetSection>

          {/* 메모 작성 */}
          <BottomSheetSection title="인증 메모 (선택사항)">
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="오늘의 실행에 대해 간단히 적어주세요&#10;예: 1시간 30분 운동 완료! 오늘은 스쿼트 위주로 했어요."
              rows={4}
              maxLength={200}
              className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed placeholder:text-gray-400"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>목표와 관련된 구체적인 내용을 적어보세요</span>
              <span>{memo.length}/200</span>
            </div>
          </BottomSheetSection>

          {/* 주의사항 */}
          <BottomSheetSection variant="warning">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-orange-800">인증 안내사항</p>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• 목표와 관련된 명확한 증거가 포함되어야 합니다</li>
                  <li>• 사진은 선명하고 인증 내용을 확인할 수 있어야 합니다</li>
                  <li>• 허위 인증 시 감독자에 의해 거절될 수 있습니다</li>
                </ul>
              </div>
            </div>
          </BottomSheetSection>
        </div>
      </BottomSheet>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  인증을 제출하시겠습니까?
                </h3>
                <p className="text-sm text-gray-600">
                  제출된 인증은 감독자의 검토를 거쳐 승인됩니다.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowConfirmModal(false)}
                >
                  취소
                </Button>
                <Button
                  fullWidth
                  onClick={confirmSubmit}
                  loading={isLoading}
                  variant="success"
                >
                  제출하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
