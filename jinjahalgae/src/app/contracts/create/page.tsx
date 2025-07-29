/**
 * 계약 생성 페이지 - THEME_GUIDE 적용
 * 한국식 깔끔한 디자인으로 업데이트
 * 각 스텝별로 컴포넌트 분리하여 가독성과 확장성 개선
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createContract } from "@/lib/api/contracts";
import { CreateContractRequest } from "../../../../docs/data-contracts";
import { ArrowLeft } from "lucide-react";
import { dateStringToKoreanTimeISO } from "@/lib/utils/date";
import { CommonHeader } from "@/components/CommonHeader";
import { useRetryableApiCall } from "@/lib/utils/retry";

// 분리된 스텝 컴포넌트들
import GoalStep from "@/components/contract-create/GoalStep";
import RewardStep from "@/components/contract-create/RewardStep";
import TemplateStep from "@/components/contract-create/TemplateStep";
import PreviewStep from "@/components/contract-create/PreviewStep";
import { useAlert } from "@/components/ui";

type CreateStep = "template" | "goal" | "reward" | "preview";

export interface FormData {
  title: string;
  goal: string;
  totalProof: number;
  oneOff: boolean;
  reward: string;
  penalty: string;
  startDate: string;
  endDate: string;
  templateId: "BASIC" | "CASUAL" | "CHILD" | "STUDENT" | "JOSEON";
  signatureImageKey: string | null;
  signatureImageUrl: string | null;
}

export interface StepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
  onPrev?: () => void;
  onCancel?: () => void;
}

export default function CreateContractPage() {
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [step, setStep] = useState<CreateStep>("template");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    goal: "",
    totalProof: 1,
    oneOff: false,
    reward: "",
    penalty: "",
    startDate: "",
    endDate: "",
    templateId: "BASIC",
    signatureImageKey: null,
    signatureImageUrl: null,
  });

  const handleNext = () => {
    const steps: CreateStep[] = ["template", "goal", "reward", "preview"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const steps: CreateStep[] = ["template", "goal", "reward", "preview"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else if (currentIndex === 0) {
      // 템플릿 선택 단계에서 이전 버튼 클릭 시 계약 생성 취소
      handleCancel();
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // 브라우저 뒤로가기 버튼 처리 - alert 없이 바로 뒤로가기
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // 뒤로가기 시 바로 이동
      window.history.back();
    };

    // 초기 히스토리 상태 설정
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  const { executeWithRetry: createContractWithRetry } = useRetryableApiCall(
    (requestData: CreateContractRequest) => createContract(requestData),
    {
      maxRetries: 3,
      retryDelay: 100
    }
  );

  const handleSubmit = async () => {
    setIsLoading(true);

    // 계약 시작일이 오늘인지 확인
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (
      formData.startDate &&
      now.getDate() === tomorrow.getDate() &&
      now.getMonth() === tomorrow.getMonth() &&
      now.getFullYear() === tomorrow.getFullYear()
    ) {
      showAlert({
        message:
          "계약 시작일이 되었습니다. 날짜를 다시 선택해주세요. 목표 설정 화면으로 돌아갑니다.",
        type: "warning",
      });
      setStep("goal");
      setIsLoading(false);
      return;
    }

    const {
      title,
      goal,
      startDate,
      endDate,
      totalProof,
      oneOff,
      reward,
      penalty,
      templateId,
      signatureImageKey,
    } = formData;

    const requestData: CreateContractRequest = {
      title,
      goal,
      startDate: dateStringToKoreanTimeISO(startDate),
      endDate: dateStringToKoreanTimeISO(endDate),
      totalProof,
      oneOff,
      reward,
      penalty,
      type: templateId,
      signatureImageKey: signatureImageKey ?? "temp-signature-key",
    };

    try {
      const newContract = await createContractWithRetry(requestData);
      if (newContract?.result?.contractId) {
        router.replace(`/contracts/${newContract.result.contractId}/created`);
      } else {
        console.error("Failed to get contract ID after creation.", newContract);
        showAlert({
          message: "계약 생성에 실패했습니다. 다시 시도해주세요.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("계약 생성 실패:", error);
      showAlert({
        message: "계약 생성에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    const props = {
      formData,
      setFormData,
      onNext: handleNext,
      onPrev: handlePrev,
      onCancel: handleCancel,
    };
    switch (step) {
      case "template":
        return <TemplateStep {...props} />;
      case "goal":
        return <GoalStep {...props} />;
      case "reward":
        return <RewardStep {...props} />;
      case "preview":
        return (
          <PreviewStep
            {...props}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = {
    template: 25,
    goal: 50,
    reward: 75,
    preview: 100,
  }[step];

  const stepTitle = {
    template: "계약서 템플릿 선택",
    goal: "목표 설정",
    reward: "보상 및 벌칙 설정",
    preview: "최종 미리보기 및 서명",
  }[step];

  return (
    <>
      <AlertComponent />
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="container-mobile">
          <CommonHeader title={stepTitle} onBack={handlePrev} />
          <div className="px-4 py-2 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">단계 {step === 'template' ? '1' : step === 'goal' ? '2' : step === 'reward' ? '3' : '4'}/4</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full">
              <div
                className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <main className="flex-grow overflow-y-auto p-6 bg-[#f0f5ff]">
            {renderStep()}
          </main>
        </div>
      </div>
    </>
  );
}
