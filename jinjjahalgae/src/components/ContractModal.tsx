/**
 * 계약서 모달 컴포넌트 - 템플릿 시스템 사용
 * - 계약서 전체 내용을 선택된 템플릿으로 표시
 * - 서명 기능 포함
 * - 다운로드 기능
 */

import { useState } from "react";
import { Download, FileText, PenTool, Palette } from "lucide-react";
import { Modal, Button, ModalActions } from "./ui";
import { ContractPreviewResponse } from "../../docs/data-contracts";
import { templates } from "./contract-create/TemplateStep";
import type { FormData } from "@/app/contracts/create/page";
import html2canvas from "html2canvas";
import { useAlert } from "./ui";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: ContractPreviewResponse;
  showSignature?: boolean;
  onSign?: (signature: string) => void;
}

// API 응답 데이터를 FormData 형식으로 변환하는 함수
const convertContractToFormData = (
  contract: ContractPreviewResponse
): FormData => {
  const basic = contract.contractBasicResponse;

  // API에서 제공하는 템플릿 타입을 사용, 없으면 기본값
  const templateId = (contract as any).type || (basic as any)?.type || "BASIC";

  return {
    title: basic?.title || "",
    goal: basic?.goal || "",
    reward: basic?.reward || "",
    penalty: basic?.penalty || "",
    totalProof: basic?.totalProof || 0,
    startDate: basic?.startDate || "",
    endDate: basic?.endDate || "",
    templateId: templateId as
      | "BASIC"
      | "JOSEON"
      | "CASUAL"
      | "CHILD"
      | "STUDENT",
    signatureImageKey: null, // 계약서 조회에서는 서명 이미지가 없을 수 있음
    signatureImageUrl: null,
    oneOff: false, // 기본값
  };
};

export function ContractModal({
  isOpen,
  onClose,
  contract,
  showSignature = false,
  onSign,
}: ContractModalProps) {
  const [signature, setSignature] = useState("");
  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const handleSign = () => {
    if (signature.trim() && onSign) {
      onSign(signature);
      setSignature("");
      setIsSignatureMode(false);
    }
  };

  const applyInlineStyles = (element: HTMLElement) => {
    // 기본 스타일 적용
    element.style.backgroundColor = "#ffffff";
    element.style.color = "#000000";
    element.style.fontFamily = "Arial, sans-serif";
    element.style.fontSize = "14px";
    element.style.lineHeight = "1.5";
    element.style.padding = "20px";
    element.style.margin = "0";
    element.style.border = "1px solid #e5e7eb";
    element.style.borderRadius = "8px";
    element.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";

    // 모든 하위 요소에 스타일 적용
    const allElements = element.querySelectorAll("*");
    allElements.forEach((el) => {
      const element = el as HTMLElement;
      const computedStyle = window.getComputedStyle(element);

      // 텍스트 스타일
      element.style.color = computedStyle.color || "#000000";
      element.style.fontFamily =
        computedStyle.fontFamily || "Arial, sans-serif";
      element.style.fontSize = computedStyle.fontSize || "14px";
      element.style.fontWeight = computedStyle.fontWeight || "normal";
      element.style.lineHeight = computedStyle.lineHeight || "1.5";
      element.style.textAlign = computedStyle.textAlign || "left";

      // 배경 스타일
      element.style.backgroundColor =
        computedStyle.backgroundColor || "transparent";
      element.style.border = computedStyle.border || "none";
      element.style.borderRadius = computedStyle.borderRadius || "0";
      element.style.padding = computedStyle.padding || "0";
      element.style.margin = computedStyle.margin || "0";

      // 레이아웃 스타일
      element.style.display = computedStyle.display || "block";
      element.style.visibility = "visible";
      element.style.position = "static";
    });

    // 인라인 요소들 (span, strong, em 등) 특별 처리
    const inlineElements = element.querySelectorAll(
      "span, strong, em, b, i, u, mark"
    );
    inlineElements.forEach((el) => {
      const element = el as HTMLElement;
      const computedStyle = window.getComputedStyle(element);

      // 인라인 요소의 특수 스타일 강제 적용
      element.style.display = "inline";
      element.style.verticalAlign = "baseline";
      element.style.fontWeight = computedStyle.fontWeight || "normal";
      element.style.fontStyle = computedStyle.fontStyle || "normal";
      element.style.textDecoration = computedStyle.textDecoration || "none";
      element.style.color = computedStyle.color || "#000000";
      element.style.backgroundColor =
        computedStyle.backgroundColor || "transparent";
    });

    // 밑줄 스타일 강제 적용
    const underlineElements = element.querySelectorAll(
      ".basic-heading, .yakjjo-heading, .casual-heading, .child-heading, .student-heading"
    );
    underlineElements.forEach((el) => {
      const element = el as HTMLElement;
      element.style.borderBottom = "1px solid #d1d5db";
      element.style.paddingBottom = "0.5rem";
      element.style.marginBottom = "0.75rem";
      element.style.display = "block";
      element.style.fontWeight = "bold";
      element.style.fontSize = "1.125rem";
    });

    // 중앙정렬 스타일 강제 적용
    const centerElements = element.querySelectorAll(
      ".basic-center-text, .yakjjo-center-text, .casual-center-text, .child-center-text, .student-center-text"
    );
    centerElements.forEach((el) => {
      const element = el as HTMLElement;
      element.style.textAlign = "center";
      element.style.display = "block";
      element.style.margin = "1.5rem 0";
    });

    // 불릿포인트 스타일 강제 적용
    const listElements = element.querySelectorAll(
      ".basic-list, .yakjjo-list, .casual-list, .child-list, .student-list"
    );
    listElements.forEach((el) => {
      const element = el as HTMLElement;
      element.style.listStyleType = "disc";
      element.style.paddingLeft = "1.5rem";
      element.style.margin = "0.5rem 0";
    });

    const listItemElements = element.querySelectorAll(
      ".basic-list-item, .yakjjo-list-item, .casual-list-item, .child-list-item, .student-list-item"
    );
    listItemElements.forEach((el) => {
      const element = el as HTMLElement;
      element.style.display = "list-item";
      element.style.margin = "0.25rem 0";
    });
  };

  const handleDownload = async () => {
    console.log("계약서 다운로드 시작");
    const element = document.getElementById("contract-content");
    if (!element) {
      console.error("contract-content 요소를 찾을 수 없습니다.");
      showAlert({
        message: "다운로드할 내용을 찾을 수 없습니다.",
        type: "error",
      });
      return;
    }

    try {
      console.log("html2canvas 캡처 시작...");

      // 캡처 전에 스타일 적용
      applyInlineStyles(element);

      // 간단한 설정으로 캡처
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        useCORS: true,
        scale: 2,
        allowTaint: true,
        logging: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        onclone: (clonedDoc) => {
          console.log("클론된 문서에서 스타일 적용 중...");
          const clonedElement = clonedDoc.getElementById("contract-content");
          if (clonedElement) {
            // 기본 스타일 강제 적용
            clonedElement.style.backgroundColor = "#ffffff";
            clonedElement.style.color = "#000000";
            clonedElement.style.fontFamily = "Arial, sans-serif";
            clonedElement.style.fontSize = "14px";
            clonedElement.style.lineHeight = "1.5";
            clonedElement.style.padding = "20px";
            clonedElement.style.margin = "0";
            clonedElement.style.border = "1px solid #e5e7eb";
            clonedElement.style.borderRadius = "8px";
            clonedElement.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";

            // 모든 하위 요소에 기본 스타일 적용
            const allElements = clonedElement.querySelectorAll("*");
            allElements.forEach((el) => {
              const element = el as HTMLElement;
              const computedStyle = window.getComputedStyle(element);

              // 텍스트 관련 스타일 강제 적용
              element.style.color = computedStyle.color || "#000000";
              element.style.fontFamily =
                computedStyle.fontFamily || "Arial, sans-serif";
              element.style.fontSize = computedStyle.fontSize || "14px";
              element.style.fontWeight = computedStyle.fontWeight || "normal";
              element.style.lineHeight = computedStyle.lineHeight || "1.5";
              element.style.textAlign = computedStyle.textAlign || "left";

              // 배경 관련 스타일 강제 적용
              element.style.backgroundColor =
                computedStyle.backgroundColor || "transparent";
              element.style.border = computedStyle.border || "none";
              element.style.borderRadius = computedStyle.borderRadius || "0";
              element.style.padding = computedStyle.padding || "0";
              element.style.margin = computedStyle.margin || "0";

              // 레이아웃 관련 스타일 강제 적용
              element.style.display = computedStyle.display || "block";
              element.style.visibility = "visible";
              element.style.position = "static";
            });

            // 인라인 요소들 (span, strong, em 등) 특별 처리
            const inlineElements = clonedElement.querySelectorAll(
              "span, strong, em, b, i, u, mark"
            );
            inlineElements.forEach((el) => {
              const element = el as HTMLElement;
              const computedStyle = window.getComputedStyle(element);

              // 인라인 요소의 특수 스타일 강제 적용
              element.style.display = "inline";
              element.style.verticalAlign = "baseline";
              element.style.fontWeight = computedStyle.fontWeight || "normal";
              element.style.fontStyle = computedStyle.fontStyle || "normal";
              element.style.textDecoration =
                computedStyle.textDecoration || "none";
              element.style.color = computedStyle.color || "#000000";
              element.style.backgroundColor =
                computedStyle.backgroundColor || "transparent";
            });

            // 밑줄 스타일 강제 적용
            const underlineElements = clonedElement.querySelectorAll(
              ".basic-heading, .yakjjo-heading, .casual-heading, .child-heading, .student-heading"
            );
            underlineElements.forEach((el) => {
              const element = el as HTMLElement;
              element.style.borderBottom = "1px solid #d1d5db";
              element.style.paddingBottom = "0.5rem";
              element.style.marginBottom = "0.75rem";
              element.style.display = "block";
              element.style.fontWeight = "bold";
              element.style.fontSize = "1.125rem";
            });

            // 중앙정렬 스타일 강제 적용
            const centerElements = clonedElement.querySelectorAll(
              ".basic-center-text, .yakjjo-center-text, .casual-center-text, .child-center-text, .student-center-text"
            );
            centerElements.forEach((el) => {
              const element = el as HTMLElement;
              element.style.textAlign = "center";
              element.style.display = "block";
              element.style.margin = "1.5rem 0";
            });

            // 불릿포인트 스타일 강제 적용
            const listElements = clonedElement.querySelectorAll(
              ".basic-list, .yakjjo-list, .casual-list, .child-list, .student-list"
            );
            listElements.forEach((el) => {
              const element = el as HTMLElement;
              element.style.listStyleType = "disc";
              element.style.paddingLeft = "1.5rem";
              element.style.margin = "0.5rem 0";
            });

            const listItemElements = clonedElement.querySelectorAll(
              ".basic-list-item, .yakjjo-list-item, .casual-list-item, .child-list-item, .student-list-item"
            );
            listItemElements.forEach((el) => {
              const element = el as HTMLElement;
              element.style.display = "list-item";
              element.style.margin = "0.25rem 0";
            });

            // 특별한 클래스들에 대한 스타일 강제 적용
            const basicElements = clonedElement.querySelectorAll(
              ".basic-container, .yakjjo-container, .casual-container, .child-container, .student-container"
            );
            basicElements.forEach((el) => {
              const element = el as HTMLElement;
              element.style.backgroundColor = "#ffffff";
              element.style.border = "1px solid #e5e7eb";
              element.style.borderRadius = "8px";
              element.style.padding = "20px";
              element.style.margin = "10px 0";
              element.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            });

            // 제목 스타일 강제 적용
            const titleElements = clonedElement.querySelectorAll(
              ".basic-title, .yakjjo-title, .casual-title, .child-title, .student-title"
            );
            titleElements.forEach((el) => {
              const element = el as HTMLElement;
              element.style.fontSize = "1.25rem";
              element.style.fontWeight = "bold";
              element.style.textAlign = "center";
              element.style.marginBottom = "1.5rem";
              element.style.color = "#1e3a8a";
            });

            // 헤딩 스타일 강제 적용
            const headingElements = clonedElement.querySelectorAll(
              ".basic-heading, .yakjjo-heading, .casual-heading, .child-heading, .student-heading"
            );
            headingElements.forEach((el) => {
              const element = el as HTMLElement;
              element.style.fontSize = "1.125rem";
              element.style.fontWeight = "bold";
              element.style.marginBottom = "0.75rem";
              element.style.borderBottom = "1px solid #d1d5db";
              element.style.paddingBottom = "0.5rem";
              element.style.color = "#374151";
            });

            // 하이라이트 스타일 강제 적용
            const highlightElements = clonedElement.querySelectorAll(
              ".basic-highlight, .casual-highlight, .child-highlight, .student-highlight, .highlight"
            );
            highlightElements.forEach((el) => {
              const element = el as HTMLElement;
              element.style.fontWeight = "bold";
              element.style.color = "#2563eb";
            });

            // Joseon 템플릿의 highlight 스타일 특별 처리
            const joseonHighlightElements =
              clonedElement.querySelectorAll(".highlight");
            joseonHighlightElements.forEach((el) => {
              const element = el as HTMLElement;
              element.style.fontWeight = "800";
              element.style.color = "#A0522D";
              element.style.backgroundColor = "rgba(160, 82, 45, 0.1)";
              element.style.padding = "2px 4px";
              element.style.borderRadius = "3px";
            });

            // 페널티 스타일 강제 적용
            const penaltyElements = clonedElement.querySelectorAll(
              ".basic-penalty, .yakjjo-penalty, .casual-penalty, .child-penalty, .student-penalty"
            );
            penaltyElements.forEach((el) => {
              const element = el as HTMLElement;
              element.style.fontWeight = "bold";
              element.style.color = "#dc2626";
            });

            // 서명 영역 스타일 강제 적용
            const signatureElements = clonedElement.querySelectorAll(
              ".basic-signature-row, .yakjjo-signature-row, .casual-signature-row, .child-signature-row, .student-signature-row"
            );
            signatureElements.forEach((el) => {
              const element = el as HTMLElement;
              element.style.display = "table";
              element.style.width = "100%";
              element.style.marginBottom = "0.75rem";
            });

            console.log("스타일 적용 완료");
          }
        },
      });

      console.log("캔버스 생성 완료, 크기:", canvas.width, "x", canvas.height);

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("캔버스 크기가 0입니다.");
      }

      const dataUrl = canvas.toDataURL("image/png", 0.9);
      console.log("데이터 URL 생성 완료, 길이:", dataUrl.length);

      if (dataUrl === "data:," || dataUrl.length < 100) {
        throw new Error("빈 이미지가 생성되었습니다.");
      }

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `contract_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("다운로드 완료");
    } catch (error) {
      console.error("다운로드 중 오류 발생:", error);
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";
      showAlert({
        message: `다운로드 중 오류가 발생했습니다: ${errorMessage}`,
        type: "error",
      });

      // 대안 방법: 브라우저 인쇄 기능 사용
      console.log("대안 방법으로 브라우저 인쇄 기능을 사용합니다.");
      window.print();
    }
  };

  const handleClose = () => {
    setIsSignatureMode(false);
    setSignature("");
    onClose();
  };

  // API 데이터를 FormData로 변환
  const formData = convertContractToFormData(contract);

  // 선택된 템플릿 ID가 없으면 API에서 제공하는 템플릿 ID 사용
  const currentTemplateId = selectedTemplateId || formData.templateId;

  // 해당 템플릿 선택
  const selectedTemplate =
    templates.find((t) => t.id === currentTemplateId) || templates[0];
  const PreviewComponent = selectedTemplate.previewComponent;

  // formData의 templateId를 현재 선택된 것으로 업데이트
  const currentFormData = {
    ...formData,
    templateId: currentTemplateId as
      | "BASIC"
      | "JOSEON"
      | "CASUAL"
      | "CHILD"
      | "STUDENT",
  };

  // API 응답에서 서명 정보 추출
  const contractorParticipant = contract.participants?.find(
    (p) => p.basicInfo?.role === "CONTRACTOR"
  );
  const contractorSignatureKey = contractorParticipant?.signatureImageKey;

  const supervisorSignatures = (contract.participants || [])
    .filter((p) => {
      const role = p.basicInfo?.role;
      const valid = p.basicInfo?.valid;
      return role === "SUPERVISOR" && valid;
    })
    .map((p) => ({
      name: p.basicInfo?.userName || "감독자",
      signatureKey: p.signatureImageKey!,
    }))
    .filter((sig) => typeof sig.signatureKey === "string" && sig.signatureKey);

  // Map participants to ParticipantSimpleResponse[] for PreviewComponent
  const simpleParticipants = (contract.participants || []).map((p) => ({
    userId: p.basicInfo?.userId,
    userName: p.basicInfo?.userName,
    role: p.basicInfo?.role,
    valid: p.basicInfo?.valid,
  }));

  const { showAlert, AlertComponent } = useAlert();

  return (
    <>
      <AlertComponent />
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        onBackdropClick={handleClose}
        title="계약서"
        size="xl"
        headerIcon={<FileText className="w-5 h-5 text-blue-600" />}
        footer={
          <ModalActions>
            {showSignature && !isSignatureMode ? (
              <>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
                <Button onClick={() => setIsSignatureMode(true)}>
                  <PenTool className="w-4 h-4 mr-2" />
                  서명하기
                </Button>
              </>
            ) : isSignatureMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsSignatureMode(false)}
                >
                  취소
                </Button>
                <Button
                  onClick={handleSign}
                  disabled={!signature.trim()}
                  variant="success"
                >
                  서명 완료
                </Button>
              </>
            ) : (
              <Button variant="outline" fullWidth onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
            )}
          </ModalActions>
        }
      >
        <div
          id="contract-content"
          className="space-y-6 bg-white p-4 rounded-lg shadow-sm"
        >
          {/* 템플릿으로 계약서 렌더링 */}
          <div className="p-4 bg-white">
            <PreviewComponent
              formData={currentFormData}
              participants={simpleParticipants}
              contractorSignatureKey={contractorSignatureKey}
              supervisorSignatures={supervisorSignatures}
            />
          </div>

          {/* 서명 섹션 (서명 모드일 때만 표시) */}
          {isSignatureMode && (
            <div className="mt-6 p-4 border-t">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    성명을 입력하여 서명해주세요
                  </label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="본인의 성명을 입력하세요"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  입력하신 성명으로 전자서명이 이루어집니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
