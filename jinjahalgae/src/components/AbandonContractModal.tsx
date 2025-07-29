/**
 * 계약 포기 확인 모달 컴포넌트
 * - 계약 중도 포기시 경고 메시지 표시
 * - 벌칙 안내 및 확인 절차
 */

import { AlertTriangle } from "lucide-react";
import { Modal, ModalSection, ModalActions, Button } from "./ui";

interface AbandonContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  penalty?: string;
}

export function AbandonContractModal({
  isOpen,
  onClose,
  onConfirm,
  penalty,
}: AbandonContractModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="계약 포기"
      showCloseButton
      headerIcon={<AlertTriangle className="w-6 h-6 text-red-500" />}
    >
      <ModalSection>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            정말 포기하시겠습니까?
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            스스로 계약을 중도포기할 경우,
            <br />
            이전에 정했던 실패 시 벌칙을 수행해야합니다.
            <br />
            중도포기하시겠습니까?
          </p>
        </div>
      </ModalSection>

      {/* 벌칙 표시 */}
      {penalty && (
        <ModalSection>
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="text-sm font-semibold text-red-700 mb-2">
              ⚠️ 수행해야 할 벌칙
            </div>
            <div className="text-sm text-red-800">{penalty}</div>
          </div>
        </ModalSection>
      )}

      <ModalActions>
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button onClick={onClose} variant="secondary">
            취소
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            variant="danger"
          >
            포기하기
          </Button>
        </div>
      </ModalActions>
    </Modal>
  );
}
