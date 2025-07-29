"use client";

import { useState, useEffect } from "react";
import type { FormData } from "@/app/contracts/create/page";
import { Button, Card } from "@/components/ui";
import { Target, Edit, FileText } from "lucide-react";
import { SignatureModal } from "@/components/SignatureModal";
import { templates } from "./TemplateStep"; // 템플릿 데이터 가져오기
import { getImageUrl } from "@/lib/env";
import { getMyInfo } from "@/lib/api/users";
import { MyInfoResponse } from "../../../docs/data-contracts";

interface PreviewStepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onPrev: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function PreviewStep({
  formData,
  setFormData,
  onPrev,
  onSubmit,
  isLoading,
}: PreviewStepProps) {
  const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<MyInfoResponse | null>(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getMyInfo();
        if (response.success && response.result) {
          setUserInfo(response.result);
        }
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSignatureSave = (
    signatureImageKey: string,
    signatureImageUrl: string
  ) => {
    setFormData({
      ...formData,
      signatureImageKey: signatureImageKey,
      signatureImageUrl: signatureImageUrl,
    });
    setSignatureModalOpen(false);
  };

  const selectedTemplate = templates.find(
    (t: { id: string }) => t.id === formData.templateId
  );

  // 참여자 정보 구성 (실제 사용자 정보 포함)
  const participants = userInfo
    ? [
        {
          userName: userInfo.nickname || userInfo.name || "사용자",
          role: "CONTRACTOR" as const,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            최종 확인 및 서명
          </h2>
          <p className="text-sm text-gray-600">
            계약 내용을 꼼꼼히 확인하고 서명해주세요.
          </p>
        </div>
      </div>

      {/* 선택된 템플릿 미리보기 */}
      {selectedTemplate && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            선택한 템플릿 미리보기
          </h3>
          <selectedTemplate.previewComponent
            formData={formData}
            participants={participants} // 실제 사용자 정보 전달
            contractorSignatureKey={formData.signatureImageKey || undefined}
            supervisorSignatures={[]}
          />
        </div>
      )}

      {/* 서명 영역 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">서명</h3>
          {formData.signatureImageKey ? (
            <div className="space-y-4">
              <p className="text-sm text-green-600 font-semibold">
                서명이 완료되었습니다.
              </p>
              <div className="border rounded-lg p-4 bg-white flex justify-center items-center">
                <img
                  src={
                    formData.signatureImageUrl ||
                    getImageUrl(formData.signatureImageKey)
                  }
                  alt="서명"
                  className="h-24"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSignatureModalOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                서명 수정하기
              </Button>
            </div>
          ) : (
            <div className="text-center py-4 border-2 border-dashed rounded-lg">
              <p className="text-sm text-gray-500 mb-4">
                계약서에 서명해주세요.
              </p>
              <Button
                variant="primary"
                onClick={() => setSignatureModalOpen(true)}
              >
                서명하기
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-3 pt-6">
        <Button variant="outline" size="md" onClick={onPrev} className="flex-1">
          이전
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={isLoading || !formData.signatureImageKey}
          className="flex-1"
        >
          {isLoading
            ? "생성 중..."
            : !formData.signatureImageKey
            ? "서명이 필요합니다"
            : "완료"}
        </Button>
      </div>

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onComplete={handleSignatureSave}
      />
    </div>
  );
}
