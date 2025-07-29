/**
 * 계약서 미리보기 페이지 - THEME_GUIDE 적용
 * 한국식 깔끔한 디자인으로 업데이트
 */

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getContract } from "@/lib/api/contracts";
import { ContractPreviewResponse } from "../../../../../docs/data-contracts";
import { Button, Card, useAlert } from "@/components/ui";
import {
  ArrowLeft,
  Share2,
  Printer,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { templates } from "@/components/contract-create/TemplateStep";
import { CommonHeader } from "@/components/CommonHeader";

export default function ContractPreviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [contract, setContract] = useState<ContractPreviewResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContract();
  }, []);

  const fetchContract = async () => {
    try {
      const data = await getContract(parseInt(params.id));
      setContract(data.result);
    } catch (error) {
      console.error("계약 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${contract?.contractBasicResponse?.title} 계약서`,
          text: `목표 달성 계약서`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("공유 취소:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showAlert({
        message: "링크가 클립보드에 복사되었습니다.",
        type: "success",
      });
    }
  };

  if (!contract) return null;

  return (
    <>
      <AlertComponent />
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="container-mobile">
          {/* 헤더 */}
          <CommonHeader title="계약 미리보기" />

          {/* 계약서 내용 */}
                      <main className="py-6 pb-24 bg-[#f0f5ff] flex-grow">
            {/* 개발용 템플릿 선택기 (프로덕션에서는 제거) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  개발용 템플릿 테스트:
                </p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set("template", template.id);
                        window.location.href = url.toString();
                      }}
                      className="px-3 py-1 text-xs bg-white border border-yellow-300 rounded hover:bg-yellow-100"
                    >
                      {template.icon} {template.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 템플릿 기반 계약서 렌더링 */}
            {(() => {
              // API에서 type 필드를 제공하지 않으므로 기본값으로 BASIC 사용
              // TODO: API에서 type 필드가 추가되면 contract.contractBasicResponse?.type 사용
              // 개발 중에는 URL searchParams나 localStorage로 템플릿을 테스트할 수 있음
              let contractType = "BASIC"; // contract.contractBasicResponse?.type || "BASIC";

              // URL에서 template 파라미터가 있으면 사용 (테스트용)
              if (typeof window !== "undefined") {
                const searchParams = new URLSearchParams(
                  window.location.search
                );
                const templateParam = searchParams.get("template");
                if (
                  templateParam &&
                  templates.find((t) => t.id === templateParam)
                ) {
                  contractType = templateParam;
                }
              }

              const selectedTemplate = templates.find(
                (t) => t.id === contractType
              );
              if (!selectedTemplate) {
                // 기본 템플릿 사용
                const defaultTemplate = templates.find((t) => t.id === "BASIC");
                if (!defaultTemplate) return null;

                const PreviewComponent = defaultTemplate.previewComponent;
                const formData = {
                  templateId: "BASIC" as const,
                  title: contract.contractBasicResponse?.title || "",
                  goal: contract.contractBasicResponse?.goal || "",
                  reward: contract.contractBasicResponse?.reward || "",
                  penalty: contract.contractBasicResponse?.penalty || "",
                  totalProof: contract.contractBasicResponse?.totalProof || 0,
                  oneOff: false, // API에서 제공되지 않으므로 기본값 사용
                  startDate: contract.contractBasicResponse?.startDate || "",
                  endDate: contract.contractBasicResponse?.endDate || "",
                  signatureImageKey: null, // TODO: 서명 이미지 필드가 API에 추가되면 사용
                  signatureImageUrl: null, // TODO: 서명 이미지 URL 필드가 API에 추가되면 사용
                };

                return (
                  <div className="print:shadow-none print:border-0">
                    <PreviewComponent formData={formData} />
                  </div>
                );
              }

              const PreviewComponent = selectedTemplate.previewComponent;
              const formData = {
                templateId: contractType as
                  | "BASIC"
                  | "CASUAL"
                  | "CHILD"
                  | "STUDENT"
                  | "JOSEON",
                title: contract.contractBasicResponse?.title || "",
                goal: contract.contractBasicResponse?.goal || "",
                reward: contract.contractBasicResponse?.reward || "",
                penalty: contract.contractBasicResponse?.penalty || "",
                totalProof: contract.contractBasicResponse?.totalProof || 0,
                oneOff: false, // API에서 제공되지 않으므로 기본값 사용
                startDate: contract.contractBasicResponse?.startDate || "",
                endDate: contract.contractBasicResponse?.endDate || "",
                signatureImageKey: null, // TODO: 서명 이미지 필드가 API에 추가되면 사용
                signatureImageUrl: null, // TODO: 서명 이미지 URL 필드가 API에 추가되면 사용
              };

              return (
                <div className="print:shadow-none print:border-0">
                  <PreviewComponent formData={formData} />
                </div>
              );
            })()}
          </main>
        </div>
      </div>
    </>
  );
}
