/**
 * 계약 수정 페이지 - THEME_GUIDE 적용
 * 계약 생성과 동일한 UI 구조 사용
 */

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getContract, updateContract } from "@/lib/api/contracts";
import { ArrowLeft } from "lucide-react";
import { ContractPreviewResponse } from "../../../../../docs/data-contracts";
import {
  dateStringToKoreanTimeISO,
  isoStringToKoreanDateString,
} from "@/lib/utils/date";

// 계약 생성에서 사용하는 컴포넌트들을 재사용
import GoalStep from "@/components/contract-create/GoalStep";
import RewardStep from "@/components/contract-create/RewardStep";
import TemplateStep from "@/components/contract-create/TemplateStep";
import PreviewStep from "@/components/contract-create/PreviewStep";

// 계약 생성과 동일한 타입과 구조 사용
import type { FormData, StepProps } from "@/app/contracts/create/page";
import { useAlert } from "@/components/ui";
import { CommonHeader } from "@/components/CommonHeader";
import { useRetryableApiCall } from "@/lib/utils/retry";

type EditStep = "template" | "goal" | "reward" | "preview";

export default function EditContractPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [step, setStep] = useState<EditStep>("template");
  const [isLoading, setIsLoading] = useState(false);
  const [contract, setContract] = useState<ContractPreviewResponse | null>(
    null
  );
  const [formData, setFormData] = useState<FormData>({
    title: "",
    goal: "",
    totalProof: 7,
    oneOff: false,
    reward: "",
    penalty: "",
    startDate: "",
    endDate: "",
    templateId: "BASIC",
    signatureImageKey: null,
    signatureImageUrl: null,
  });

  useEffect(() => {
    handleFetchContract();
  }, []);

  const { executeWithRetry: fetchContractWithRetry } = useRetryableApiCall(
    () => getContract(parseInt(params.id)),
    {
      maxRetries: 3,
      retryDelay: 100
    }
  );

  const { executeWithRetry: updateContractWithRetry } = useRetryableApiCall(
    (updateData: any) => updateContract(contract?.contractBasicResponse?.contractId!, updateData),
    {
      maxRetries: 3,
      retryDelay: 100
    }
  );

  const handleFetchContract = async () => {
    try {
      const response = await fetchContractWithRetry();
      const data = response.result;
      setContract(data);

      if (data?.contractBasicResponse) {
        const basicInfo = data.contractBasicResponse;
        setFormData({
          title: basicInfo.title ?? "",
          goal: basicInfo.goal ?? "",
          penalty: basicInfo.penalty ?? "",
          reward: basicInfo.reward ?? "",
          totalProof: basicInfo.totalProof ?? 7,
          oneOff: false, // TODO: API에서 oneOff 정보 가져오기
          startDate: basicInfo.startDate
            ? isoStringToKoreanDateString(basicInfo.startDate)
            : "",
          endDate: basicInfo.endDate
            ? isoStringToKoreanDateString(basicInfo.endDate)
            : "",
          templateId: "BASIC", // TODO: API에서 템플릿 타입 정보 가져오기
          signatureImageKey: null, // 수정 시에는 새로운 서명 필요
          signatureImageUrl: null,
        });
      }
    } catch (error) {
      console.error("계약 조회 실패:", error);
      showAlert({
        message: "계약 정보를 불러오는데 실패했습니다.",
        type: "error",
      });
      router.back();
    }
  };

  const handleNext = () => {
    const steps: EditStep[] = ["template", "goal", "reward", "preview"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const steps: EditStep[] = ["template", "goal", "reward", "preview"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const contractId = contract?.contractBasicResponse?.contractId;
      if (!contractId) {
        throw new Error("계약 ID를 찾을 수 없습니다.");
      }

      const updateData = {
        title: formData.title,
        goal: formData.goal,
        penalty: formData.penalty,
        reward: formData.reward,
        totalProof: formData.totalProof,
        oneOff: formData.oneOff,
        startDate: dateStringToKoreanTimeISO(formData.startDate),
        endDate: dateStringToKoreanTimeISO(formData.endDate),
        type: formData.templateId,
        signatureImageKey: formData.signatureImageKey ?? "temp-signature-key",
      };

      const response = await updateContractWithRetry(updateData);

      if (response.success) {
        showAlert({
          message: "계약이 성공적으로 수정되었습니다.",
          type: "success",
        });
        router.push(`/contracts/${contractId}`);
      } else {
        throw new Error("계약 수정에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("계약 수정 실패:", error);

      // 특정 에러 메시지 처리
      if (error.message?.includes("감독자가 서명")) {
        showAlert({
          message: "감독자가 서명한 후에는 계약을 수정할 수 없습니다.",
          type: "warning",
        });
        router.push(
          `/contracts/${contract?.contractBasicResponse?.contractId}`
        );
      } else if (error.message?.includes("버전")) {
        showAlert({
          message: "수정 중 계약서가 변경되었습니다. 페이지를 새로고침합니다.",
          type: "warning",
        });
        window.location.reload();
      } else {
        showAlert({
          message: "계약 수정에 실패했습니다. 다시 시도해주세요.",
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    const props: StepProps = {
      formData,
      setFormData,
      onNext: handleNext,
      onPrev: handlePrev,
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
            formData={formData}
            setFormData={setFormData}
            onPrev={handlePrev}
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

  if (!contract) {
    return (
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="container-mobile">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600 font-medium">로딩 중...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
      <div className="container-mobile">
        <CommonHeader title="계약 수정" onBack={handlePrev} />
        
        {/* 프로그레스바와 단계표시 */}
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
      <AlertComponent />
    </div>
  );
}
