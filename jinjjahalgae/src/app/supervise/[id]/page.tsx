"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X as CloseIcon,
} from "lucide-react";

// API imports
import { getContract, getContractTitleInfo } from "@/lib/api/contracts";
import {
  getSupervisorProofsByMonth,
  getAwaitProofs,
  submitProofFeedback,
  getProof,
} from "@/lib/api/proofs";
import { getImageUrl } from "@/lib/env";
import { isoStringToKoreanDateString } from "@/lib/utils/date";
import {
  SupervisorProofListResponse,
  ProofDetailResponse,
  FeedbackStatus,
  ProofStatus,
  ContractPreviewResponse,
} from "../../../../docs/data-contracts";
import { useAlert } from "@/components/ui";
import { CommonHeader } from "@/components/CommonHeader";
import { getProofListWithCreatedAtMap } from "@/lib/utils/verification";
import ProofCalendar from "@/components/proof/ProofCalendar";
import ProofVerificationCard from "@/components/proof/ProofVerificationCard";
import ProofPendingCard from "@/components/proof/ProofPendingCard";

// --- 타입 정의 (Type Definitions) ---
interface VerificationItem {
  proofId: number;
  status: ProofStatus;
  date: string;
  description: string;
  approvedCount: number;
  totalCount: number;
  imageUrls: string[];
  remainingTime?: string;
  feedbackStatus?: FeedbackStatus | null;
  isReProof?: boolean;
  createdAt?: string;
  imageKey?: string;
}

interface VerificationModalState {
  isOpen: boolean;
  type: "approve" | "reject" | null;
  item: VerificationItem | null;
}

interface ContractInfo {
  title: string;
  goal: string;
}

// --- 상수 관리 (Constant Management) ---
const COLORS = {
  blue: "#2563eb",
  lightBlue: "#93c5fd",
  bgLightBlue: "#f0f5ff",
  gray: "#e5e7eb",
  textGray: "#6b7280",
  red: "#ef4444",
  lightRed: "#fee2e2",
  green: "#16a34a",
  lightGreen: "#eafdf0",
  yellow: "#f59e0b",
  lightYellow: "#fef3c7",
  reAuthBg: "#fffbeb",
  reAuthBorder: "#fde68a",
};

// 헬퍼 함수들
const convertProofToVerificationItem = (
  proof: SupervisorProofListResponse
): VerificationItem[] => {
  const items: VerificationItem[] = [];

  if (proof.originalProof) {
    items.push({
      proofId: proof.originalProof.proofId || 0,
      status: proof.originalProof.status || ProofStatus.APPROVE_PENDING,
      date: "", // getProof API에서 createdAt으로 업데이트 예정
      createdAt: (proof.originalProof as any).createdAt || proof.date || "",
      description: "", // API로 별도 조회 필요
      approvedCount: proof.originalProof.completeSupervisors || 0,
      totalCount: proof.originalProof.totalSupervisors || 0,
      imageKey: proof.originalProof.imageKey || "",
      imageUrls: proof.originalProof.imageKey
        ? [getImageUrl(proof.originalProof.imageKey)]
        : [],
      feedbackStatus: proof.originalFeedbackStatus,
      isReProof: false,
    });
  }

  if (proof.reProof) {
    items.push({
      proofId: proof.reProof.proofId || 0,
      status: proof.reProof.status || ProofStatus.APPROVE_PENDING,
      date: "", // getProof API에서 createdAt으로 업데이트 예정
      createdAt: (proof.reProof as any).createdAt || proof.date || "",
      description: "", // API로 별도 조회 필요
      approvedCount: proof.reProof.completeSupervisors || 0,
      totalCount: proof.reProof.totalSupervisors || 0,
      imageKey: proof.reProof.imageKey || "",
      imageUrls: proof.reProof.imageKey
        ? [getImageUrl(proof.reProof.imageKey)]
        : [],
      feedbackStatus: proof.reProofFeedbackStatus,
      isReProof: true,
    });
  }

  return items;
};

const getStatusText = (status: ProofStatus, isReProof: boolean = false) => {
  switch (status) {
    case ProofStatus.APPROVED:
      return "승인 완료";
    case ProofStatus.REJECTED:
      return "거절됨";
    case ProofStatus.APPROVE_PENDING:
    default:
      return isReProof ? "재인증 대기중" : "대기중";
  }
};

const calculateRemainingTime = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const deadline = new Date(created.getTime() + 24 * 60 * 60 * 1000); // 24시간 후
  const remaining = deadline.getTime() - now.getTime();

  if (remaining <= 0) {
    return "시간 초과";
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  return `${hours}시간 남음`;
};

// --- 컴포넌트 (Components) ---

/**
 * 모달이 열렸을 때 body 스크롤을 방지하는 커스텀 훅
 * @param {boolean} isOpen - 모달의 열림 상태
 */
const useLockBodyScroll = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // 컴포넌트가 언마운트될 때 스크롤을 복원합니다.
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
};

/**
 * 승인/거절 시 코멘트를 입력받는 모달
 */
interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  title: string;
  type: "approve" | "reject";
}

const VerificationModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  type,
}: VerificationModalProps) => {
  const [comment, setComment] = useState("");
  useLockBodyScroll(isOpen);

  const handleClose = () => {
    setComment("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(comment);
    handleClose();
  };

  if (!isOpen) return null;

  const approvePresets = [
    "수고했어요!",
    "노력하는 모습이 보기 좋아요",
    "인증 확인했습니다!",
  ];
  const rejectPresets = [
    "날짜도 함께 보여주면 좋을 것 같아요",
    "인증 사진이 명확하지 않아요",
    "장소가 잘 보이지 않아요",
  ];
  const presets = type === "approve" ? approvePresets : rejectPresets;

  const handlePresetClick = (preset: string) => {
    setComment((prev) => (prev ? prev + " " + preset : preset));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-800 text-center">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 mb-4 text-center">
          간단한 코멘트를 입력해주세요
        </p>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                type === "approve" ? "참 잘했어요 :)" : "조금 더 노력해주세요"
              }
              maxLength={100}
              className="w-full h-28 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: COLORS.gray }}
            />
            <span className="absolute bottom-3 right-3 text-xs text-gray-400">
              {comment.length}/100
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {presets.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 hover:bg-blue-100 hover:text-blue-600 border border-gray-200"
                onClick={() => handlePresetClick(preset)}
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full font-bold py-3 px-4 rounded-lg transition-transform active:scale-95 text-white mt-4"
            style={{
              backgroundColor: type === "approve" ? COLORS.blue : COLORS.red,
            }}
          >
            {type === "approve" ? "승인" : "거절"}
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * 이미지 인증 캐러셀 모달
 */
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: VerificationItem | null;
}
const ImageModal = ({ isOpen, onClose, item }: ImageModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  if (!isOpen || !item || !item.imageUrls || item.imageUrls.length === 0) {
    return null;
  }

  const goToPrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide
      ? item.imageUrls.length - 1
      : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const isLastSlide = currentIndex === item.imageUrls.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (
    slideIndex: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    setCurrentIndex(slideIndex);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm m-auto shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 text-center relative">
          <h3 className="text-base font-bold text-gray-800">인증 사진</h3>
          <button
            onClick={onClose}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="닫기"
          >
            <CloseIcon size={24} />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <div className="aspect-square w-full rounded-lg overflow-hidden relative group">
            <img
              src={item.imageUrls[currentIndex]}
              alt={`인증 사진 ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src =
                  "https://placehold.co/400x400/e2e8f0/64748b?text=Image+Error";
              }}
            />
            {item.imageUrls.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="이전 사진"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="다음 사진"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
          {item.imageUrls.length > 1 && (
            <div className="flex justify-center items-center gap-2">
              {item.imageUrls.map((_, slideIndex: number) => (
                <button
                  key={slideIndex}
                  onClick={(e) => goToSlide(slideIndex, e)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                    currentIndex === slideIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  aria-label={`사진 ${slideIndex + 1} 보기`}
                ></button>
              ))}
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 max-h-28 overflow-y-auto">
            <p>{item.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = ({ title }: { title: string }) => {
  const router = useRouter();

  return (
    <header
      className="flex items-center justify-between p-4 flex-shrink-0 z-10 border-b"
      style={{ borderColor: COLORS.gray }}
    >
      <button
        className="p-2"
        style={{ color: COLORS.textGray }}
        aria-label="뒤로 가기"
        onClick={() => router.back()}
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-lg font-bold text-gray-800 absolute left-1/2 -translate-x-1/2">
        {title}
      </h1>
      <div />
    </header>
  );
};

// --- 대기중인 인증 카드는 ProofPendingCard로 대체됨 ---

interface VerificationHistoryItemProps {
  log: VerificationItem | undefined;
  onImageClick: (item: VerificationItem) => void;
  contractId: string;
}

const VerificationHistoryItem = ({
  log,
  onImageClick,
  contractId,
}: VerificationHistoryItemProps) => {
  if (!log) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-center text-gray-500">
        선택한 날짜에 인증 기록이 없습니다.
      </div>
    );
  }

  if (log.status === ProofStatus.APPROVE_PENDING) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-center text-gray-500">
        해당 날짜의 인증은 승인 대기중입니다.
      </div>
    );
  }

  const { status, date, approvedCount, totalCount, imageUrls, proofId } = log;
  const statusConfig: any = {
    [ProofStatus.APPROVED]: {
      textColor: COLORS.green,
      Icon: CheckCircle2,
      text: "승인 완료",
      RightIcon: ThumbsUp,
      rightIconColor: COLORS.blue,
    },
    [ProofStatus.REJECTED]: {
      textColor: COLORS.red,
      Icon: XCircle,
      text: "거절됨",
      RightIcon: ThumbsDown,
      rightIconColor: COLORS.red,
    },
  };
  const config = statusConfig[status];

  if (!config) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 transition-all duration-200">
      <button
        onClick={() => onImageClick(log)}
        className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden"
        style={{ backgroundColor: COLORS.gray }}
        aria-label={`${date} 인증 사진 보기`}
      >
        <img
          src={
            imageUrls && imageUrls.length > 0
              ? imageUrls[0]
              : "https://placehold.co/100x100/e2e8f0/e2e8f0?text="
          }
          alt={`${date} 인증 기록`}
          className="w-full h-full object-cover"
        />
      </button>
      <div className="flex-grow">
        <p className="font-bold text-gray-800">
          {date.replace(/-/g, ".")} 인증
        </p>
        <div
          className="flex items-center text-sm font-bold mt-1.5"
          style={{ color: config.textColor }}
        >
          <config.Icon size={18} className="mr-1.5" />
          <span>{config.text}</span>
        </div>
        <p className="text-xs mt-1" style={{ color: COLORS.textGray }}>
          {approvedCount} / {totalCount} 승인
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <config.RightIcon size={28} style={{ color: config.rightIconColor }} />
        {proofId && (
          <a
            href={`/supervise/${contractId}/detail/${proofId}`}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
          >
            상세보기
          </a>
        )}
      </div>
    </div>
  );
};

// --- 달력 컴포넌트는 ProofCalendar로 대체됨 ---

// --- 메인 화면 컴포넌트 (Main Screen Component) ---
const SupervisorContractDetailScreen = () => {
  const params = useParams();
  const contractId = parseInt(params.id as string);

  // 상태 관리
  const [verifications, setVerifications] = useState<{
    [key: string]: VerificationItem[];
  }>({});
  const [pendingVerifications, setPendingVerifications] = useState<
    VerificationItem[]
  >([]);
  const [contractInfo, setContractInfo] = useState<ContractInfo>({
    title: "",
    goal: "",
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 이미지 모달 상태
  const [imageModalItem, setImageModalItem] = useState<VerificationItem | null>(
    null
  );

  // 인증 처리 모달 상태
  const [verificationModalState, setVerificationModalState] =
    useState<VerificationModalState>({
      isOpen: false,
      type: null,
      item: null,
    });

  const { showAlert, AlertComponent } = useAlert();

  // 데이터 로딩
  useEffect(() => {
    const loadPendingProofs = async () => {
      try {
        // 대기중인 인증 목록 조회
        const awaitProofsResponse = await getAwaitProofs(contractId);
        const pendingItems: VerificationItem[] = [];

        for (const proof of awaitProofsResponse) {
          // getAwaitProofs API는 직접 proof 객체들의 배열을 반환
          const imageUrls: string[] = [];
          if (proof.firstImageKey)
            imageUrls.push(getImageUrl(proof.firstImageKey));
          if (proof.secondImageKey)
            imageUrls.push(getImageUrl(proof.secondImageKey));
          if (proof.thirdImageKey)
            imageUrls.push(getImageUrl(proof.thirdImageKey));

          const item: VerificationItem = {
            proofId: proof.proofId,
            status:
              proof.status === "APPROVE_PENDING"
                ? ProofStatus.APPROVE_PENDING
                : ProofStatus.APPROVED,
            date: proof.createdAt
              ? isoStringToKoreanDateString(proof.createdAt)
              : "",
            description: proof.comment || "인증 완료",
            approvedCount: 0, // 대기중인 인증이므로 0
            totalCount: 1, // 임시값
            imageUrls: imageUrls,
            remainingTime: proof.createdAt
              ? calculateRemainingTime(proof.createdAt)
              : undefined,
            feedbackStatus: null,
            isReProof: proof.reProof || false,
          };

          // 대기중인 인증만 추가
          if (item.status === ProofStatus.APPROVE_PENDING) {
            pendingItems.push(item);
          }
        }

        // 재인증이 우선, 그 다음 날짜 순으로 정렬
        pendingItems.sort((a, b) => {
          if (a.isReProof && !b.isReProof) return -1;
          if (!a.isReProof && b.isReProof) return 1;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setPendingVerifications(pendingItems);
      } catch (error) {
        console.error("Error loading pending proofs:", error);
      }
    };

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 계약 정보 조회
        const contractResponse = await getContractTitleInfo(contractId);
        if (contractResponse.success) {
          setContractInfo(contractResponse.result);
        }

        // 대기중인 인증 목록 조회
        await loadPendingProofs();

        // 현재 월의 인증 데이터 조회 (달력용)
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const proofsResponse = await getSupervisorProofsByMonth(
          contractId,
          year,
          month
        );

        // 공통 유틸 사용: createdAt 기준 날짜 매핑
        const verificationsMap = await getProofListWithCreatedAtMap(
          proofsResponse,
          getProof,
          convertProofToVerificationItem
        );
        setVerifications(verificationsMap);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      loadData();
    }
  }, [contractId]);

  const handleOpenImageModal = useCallback((item: VerificationItem) => {
    setImageModalItem(item);
  }, []);

  const handleCloseImageModal = useCallback(() => {
    setImageModalItem(null);
  }, []);

  const handleOpenVerificationModal = useCallback(
    (type: "approve" | "reject", item: VerificationItem) => {
      setVerificationModalState({ isOpen: true, type, item });
    },
    []
  );

  const handleCloseVerificationModal = useCallback(() => {
    setVerificationModalState({ isOpen: false, type: null, item: null });
  }, []);

  const handleSubmitVerification = useCallback(
    async (comment: string) => {
      const { type, item } = verificationModalState;
      if (!type || !item) return;

      try {
        console.log(
          `[${type}] 처리 완료! 대상 ID: ${item.proofId}, 코멘트: ${comment}`
        );

        // API 호출 - 올바른 엔드포인트와 데이터 형식
        await submitProofFeedback(item.proofId, {
          status: type === "approve" ? "APPROVED" : "REJECTED",
          comment: comment || undefined,
        });

        // 로컬 상태 업데이트 (달력용 데이터)
        const newStatus =
          type === "approve" ? ProofStatus.APPROVED : ProofStatus.REJECTED;
        setVerifications((prev) => {
          const updatedVerifications = { ...prev };
          const dateKey = item.date;
          if (updatedVerifications[dateKey]) {
            const updatedItems = updatedVerifications[dateKey].map(
              (verificationItem) => {
                if (verificationItem.proofId === item.proofId) {
                  return {
                    ...verificationItem,
                    status: newStatus,
                    description: comment || verificationItem.description,
                  };
                }
                return verificationItem;
              }
            );
            updatedVerifications[dateKey] = updatedItems;
          }
          return updatedVerifications;
        });

        // 대기중인 인증 목록에서도 제거
        setPendingVerifications((prev) =>
          prev.filter((pendingItem) => pendingItem.proofId !== item.proofId)
        );

        // 모달 닫기
        handleCloseVerificationModal();
      } catch (error) {
        console.error("Error submitting feedback:", error);
        showAlert({
          message: "피드백 제출 중 오류가 발생했습니다.",
          type: "error",
        });
      }
    },
    [verificationModalState, handleCloseVerificationModal, showAlert]
  );

  // pendingVerifications 상태를 사용하도록 변경
  const pendingItems = pendingVerifications;

  const selectedDateString = isoStringToKoreanDateString(
    selectedDate.toISOString()
  );
  const selectedDateVerifications = verifications[selectedDateString] || [];

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: COLORS.bgLightBlue }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: COLORS.bgLightBlue }}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertComponent />
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="container-mobile">
          <CommonHeader title={contractInfo.title || "매일 운동하기"} />
          <main
            className="flex-grow overflow-y-auto p-4 space-y-6"
            style={{ backgroundColor: "#f0f5ff" }}
          >
            <section aria-labelledby="pending-verification-title">
              <h2
                id="pending-verification-title"
                className="text-base font-extrabold mb-2 px-1"
              >
                대기중인 인증 ({pendingItems.length})
              </h2>
              <p
                className="text-xs mb-3 px-1"
                style={{ color: COLORS.textGray }}
              >
                24시간 이내에 승인하지 않는 경우 자동으로 승인처리 됩니다.
              </p>
              <div className="space-y-3">
                {pendingItems.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center text-gray-500">
                    대기중인 인증이 없습니다.
                  </div>
                ) : (
                  pendingItems.map((item) => (
                    <ProofPendingCard
                      key={`${item.proofId}-${item.date}`}
                      item={item}
                      onImageClick={handleOpenImageModal}
                      onOpenVerificationModal={handleOpenVerificationModal}
                    />
                  ))
                )}
              </div>
            </section>
            <section aria-labelledby="verification-status-title">
              <h2
                id="verification-status-title"
                className="text-base font-extrabold mb-3 px-1"
              >
                인증 현황
              </h2>
              <div className="bg-white rounded-xl shadow-sm p-4 mb-4 text-center">
                <p
                  className="text-sm font-semibold"
                  style={{ color: COLORS.textGray }}
                >
                  계약 목표
                </p>
                <p className="text-base font-bold text-gray-800 mt-1">
                  {contractInfo.goal ||
                    "한강 달리기 1시간 아니면 근력운동 30분 하기"}
                </p>
              </div>
              <div className="mb-4">
                <ProofCalendar
                  verifications={verifications}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>
              <div className="space-y-3">
                {selectedDateVerifications.length > 0 ? (
                  selectedDateVerifications.map((verification, index) => (
                    <ProofVerificationCard
                      key={`${verification.proofId}-${index}`}
                      verification={verification}
                      onClick={() =>
                        verification.proofId &&
                        window.location.assign(
                          `/supervise/${params.id}/detail/${verification.proofId}`
                        )
                      }
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center text-gray-500">
                    해당 날짜의 인증 기록이 없습니다
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* 모달들은 메인 레이아웃 외부에 렌더링하여 z-index 문제를 방지합니다. */}
      <ImageModal
        isOpen={!!imageModalItem}
        onClose={handleCloseImageModal}
        item={imageModalItem}
      />
      <VerificationModal
        isOpen={verificationModalState.isOpen}
        onClose={handleCloseVerificationModal}
        onSubmit={handleSubmitVerification}
        title={
          verificationModalState.type === "approve" ? "인증 승인" : "인증 거절"
        }
        type={verificationModalState.type || "approve"}
      />
    </>
  );
};

export default SupervisorContractDetailScreen;
