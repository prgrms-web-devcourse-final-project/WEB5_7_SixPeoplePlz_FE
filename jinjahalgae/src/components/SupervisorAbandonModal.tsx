/**
 * 감독자 계약 포기 전용 모달 컴포넌트
 * - 감독자가 계약을 포기할 때 특별한 경고 메시지 표시
 * - "모든 감독자가 포기하면 계약자는 벌칙을 수행하지 않습니다" 안내
 */

import React, { useState } from "react";
import { Modal, Button, ModalActions, ModalSection } from "./ui";
import { AlertTriangle, Users, X } from "lucide-react";
import { withdrawSupervisorDuring } from "@/lib/api/contracts";
import { useAlert } from "./ui";

interface SupervisorAbandonModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: number;
  contractTitle?: string;
  onSuccess?: () => void;
}

export function SupervisorAbandonModal({
  isOpen,
  onClose,
  contractId,
  contractTitle,
  onSuccess,
}: SupervisorAbandonModalProps) {
  const [step, setStep] = useState<"warning" | "confirm">("warning");
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert, AlertComponent } = useAlert();

  const handleFirstConfirm = () => {
    setStep("confirm");
  };

  const handleFinalConfirm = async () => {
    setIsLoading(true);
    try {
      await withdrawSupervisorDuring(contractId);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("감독 포기 실패:", error);
      showAlert({
        message: "감독 포기에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("warning");
    onClose();
  };

  return (
    <>
      <AlertComponent />
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={step === "warning" ? "감독 포기" : "최종 확인"}
        headerIcon={
          step === "warning" ? (
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          ) : (
            <X className="w-5 h-5 text-red-600" />
          )
        }
        footer={
          <ModalActions>
            {step === "warning" ? (
              <>
                <Button variant="outline" fullWidth onClick={handleClose}>
                  취소
                </Button>
                <Button variant="danger" fullWidth onClick={handleFirstConfirm}>
                  감독 포기하기
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setStep("warning")}
                >
                  이전으로
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleFinalConfirm}
                  disabled={isLoading}
                  loading={isLoading}
                >
                  최종 포기하기
                </Button>
              </>
            )}
          </ModalActions>
        }
      >
        <div className="space-y-6">
          {step === "warning" && (
            <>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  감독을 포기하시겠습니까?
                </h3>
              </div>

              {contractTitle && (
                <ModalSection variant="highlighted">
                  <p className="text-sm text-gray-600 text-center">
                    포기하려는 계약:{" "}
                    <span className="font-medium">{contractTitle}</span>
                  </p>
                </ModalSection>
              )}

              <ModalSection variant="warning">
                <div>
                  <p className="font-medium text-orange-800 mb-1">
                    중요한 안내사항
                  </p>
                  <p className="text-sm text-orange-700 leading-relaxed">
                    만약 <strong>모든 감독자가 포기</strong>한다면 계약자는
                    해당 <strong>벌칙을 수행하지 않습니다.</strong>
                  </p>
                </div>
              </ModalSection>

              <ModalSection title="감독을 포기하면:">
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>해당 계약에 더 이상 접근할 수 없습니다</li>
                  <li>감독중 탭에서 이 계약이 사라집니다</li>
                  <li>계약자의 인증을 검토할 수 없습니다</li>
                </ul>
              </ModalSection>
            </>
          )}

          {step === "confirm" && (
            <>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  정말 감독을 포기하시겠습니까?
                </h3>
              </div>

              <ModalSection variant="warning">
                <p className="text-red-800 font-medium text-center">
                  이 작업은 되돌릴 수 없습니다
                </p>
              </ModalSection>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
