/**
 * 캔버스 기반 서명 컴포넌트
 * - 터치/마우스로 서명 가능
 * - 서명을 이미지로 변환하여 S3 업로드
 * - 깔끔한 UI/UX 제공
 */

import { useRef, useState, useEffect } from "react";
import { X, RotateCcw, Check, PenTool } from "lucide-react";
import { Modal, Button, ModalActions, ModalSection } from "./ui";
import { uploadFile } from "../lib/api/files";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (signatureImageKey: string, signatureImageUrl: string) => void;
}

export function SignatureModal({
  isOpen,
  onClose,
  onComplete,
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // 캔버스 크기를 CSS 크기와 맞춤
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // CSS 크기 설정
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";

        // 실제 캔버스 크기 설정 (고해상도용)
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // 컨텍스트 스케일링
        ctx.scale(dpr, dpr);

        // 캔버스 초기화 - 깨끗한 흰색 배경
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, rect.width, rect.height);

        // 서명을 위한 스타일 설정
        ctx.strokeStyle = "#000000"; // 순수한 검은색
        ctx.lineWidth = 3; // 적절한 선 굵기
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation = "source-over";
      }
      setHasSignature(false);
      setError(null);
    }
  }, [isOpen]);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // CSS 크기 기준으로 좌표 계산 (DPR 적용하지 않음)
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    return { x, y };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if ("touches" in e) {
      e.preventDefault();
    }

    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    if ("touches" in e) {
      e.preventDefault();
    }

    const { x, y } = getCoordinates(e);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      const rect = canvas.getBoundingClientRect();

      // 캔버스 전체를 깨끗한 흰색으로 초기화
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, rect.width, rect.height);

      // 다시 그리기 스타일 설정
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      setHasSignature(false);
    }
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    setIsUploading(true);
    setError(null);

    try {
      // 캔버스를 Blob으로 변환
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("캔버스 변환 실패"));
            }
          },
          "image/png",
          0.9
        );
      });

      // File 객체로 변환
      const fileName = `signature_${Date.now()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      // presigned URL을 사용하여 S3에 업로드
      const fileKey = await uploadFile(file);

      // 캔버스를 데이터 URL로도 변환 (미리보기용)
      const signatureImageUrl = canvas.toDataURL("image/png");

      onComplete(fileKey, signatureImageUrl);
      onClose();
    } catch (error) {
      console.error("서명 업로드 실패:", error);
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );

      // 개발 환경에서는 임시 키로 계속 진행
      if (process.env.NODE_ENV === "development") {
        const tempKey = `signature_${Date.now()}`;
        const signatureImageUrl = canvas.toDataURL("image/png");
        onComplete(tempKey, signatureImageUrl);
        onClose();
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="서명하기"
      size="lg"
      headerIcon={<PenTool className="w-5 h-5 text-blue-600" />}
      footer={
        <ModalActions>
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 쓰기
          </Button>
          <Button
            onClick={saveSignature}
            disabled={!hasSignature || isUploading}
            loading={isUploading}
            variant="success"
          >
            <Check className="w-4 h-4 mr-2" />
            서명 완료
          </Button>
        </ModalActions>
      }
    >
      <div className="space-y-6">
        {/* 안내 메시지 */}
        <ModalSection variant="info">
          <p className="text-blue-800 text-sm">
            💡 <strong>팁:</strong> 명확하고 읽기 쉬운 서명을 작성해주세요.
            서명은 계약서에 영구적으로 기록됩니다.
          </p>
        </ModalSection>

        {/* 서명 영역 */}
        <ModalSection title="서명 영역">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              아래 영역에 손가락이나 마우스로 서명해주세요
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="w-full h-48 bg-white rounded-lg border-2 border-gray-300 cursor-crosshair block"
                style={{
                  touchAction: "none",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                  WebkitTapHighlightColor: "transparent",
                  maxWidth: "100%",
                  height: "12rem",
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          </div>
        </ModalSection>

        {/* 에러 메시지 */}
        {error && (
          <ModalSection variant="warning">
            <p className="text-orange-800 text-sm">
              ⚠️ <strong>오류:</strong> {error}
            </p>
          </ModalSection>
        )}
      </div>
    </Modal>
  );
}
