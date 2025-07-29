"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Trophy,
  Calendar,
  Users,
  Camera,
  Info,
  Mail,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Bell,
  LogOut,
} from "lucide-react";

// API imports
import { 
  getContract, 
  getContractTitleInfo, 
  getContractPreview,
  withdrawSupervisorBefore,
  withdrawSupervisorDuring,
} from "@/lib/api/contracts";
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
import { ContractModal } from "@/components/ContractModal";
import { SupervisorAbandonModal } from "@/components/SupervisorAbandonModal";
import { getProofListWithCreatedAtMap } from "@/lib/utils/verification";
import ProofCalendar from "@/components/proof/ProofCalendar";
import ProofVerificationCard from "@/components/proof/ProofVerificationCard";
import ProofPendingCard from "@/components/proof/ProofPendingCard";
import { getUnifiedDeadlineProgress } from "@/lib/utils/contract";
import { useRetryableApiCall } from "@/lib/utils/retry";

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
  grayText: "#6b7280",
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return COLORS.yellow;
    case "IN_PROGRESS":
      return COLORS.blue;
    case "COMPLETED":
      return COLORS.green;
    case "FAILED":
      return COLORS.red;
    case "ABANDONED":
      return "#ea580c";
    default:
      return COLORS.grayText;
  }
};

const getSupervisorStatusText = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "참여중";
    case "WITHDRAWN":
      return "참여 철회";
    case "ABANDONED":
      return "중도 포기";
    default:
      return "알 수 없음";
  }
};

const getSupervisorStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return COLORS.green;
    case "WITHDRAWN":
      return COLORS.grayText;
    case "ABANDONED":
      return COLORS.red;
    default:
      return COLORS.grayText;
  }
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
    setComment("");
  };

  const presetComments = {
    approve: [
      "목표를 충실히 달성하신 것 같습니다! 👍",
      "인증 사진이 명확해 보입니다. 승인합니다!",
      "좋은 진전이 보입니다. 계속 화이팅!",
    ],
    reject: [
      "인증 사진이 명확하지 않습니다. 다시 촬영해 주세요.",
      "목표 달성이 확인되지 않습니다.",
      "더 명확한 인증이 필요합니다.",
    ],
  };

  const handlePresetClick = (preset: string) => {
    setComment(preset);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-auto max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button
      onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          <div className="p-6 flex-grow">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                코멘트
              </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                  type === "approve"
                    ? "승인 사유를 입력해주세요..."
                    : "거절 사유를 입력해주세요..."
              }
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                빠른 입력
              </label>
              <div className="space-y-2">
                {presetComments[type].map((preset, index) => (
              <button
                    key={index}
                type="button"
                onClick={() => handlePresetClick(preset)}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
              >
                {preset}
              </button>
            ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
          <button
            type="submit"
              className={`flex-1 py-2 px-4 rounded-lg text-white font-medium ${
                type === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
          >
            {type === "approve" ? "승인" : "거절"}
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * 이미지 보기 모달
 */
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: VerificationItem | null;
}

const ImageModal = ({ isOpen, onClose, item }: ImageModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  useLockBodyScroll(isOpen);

  if (!isOpen || !item) return null;

  const images = item.imageUrls || [];
  if (images.length === 0) return null;

  const goToPrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const goToSlide = (
    slideIndex: number,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    setCurrentImageIndex(slideIndex);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* 닫기 버튼 */}
          <button
            onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
          <CloseIcon size={32} />
          </button>

        {/* 이전 버튼 */}
        {images.length > 1 && (
                <button
                  onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
            <ChevronLeft size={48} />
                </button>
        )}

        {/* 이미지 */}
        <div className="max-w-4xl max-h-full flex items-center justify-center">
          <img
            src={images[currentImageIndex]}
            alt={`인증 이미지 ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* 다음 버튼 */}
        {images.length > 1 && (
                <button
                  onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
            <ChevronRight size={48} />
                </button>
        )}

        {/* 이미지 인디케이터 */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
                <button
                key={index}
                onClick={(e) => goToSlide(index, e)}
                className={`w-3 h-3 rounded-full ${
                  index === currentImageIndex
                    ? "bg-white"
                    : "bg-white bg-opacity-50"
                }`}
              />
              ))}
            </div>
          )}

        {/* 이미지 정보 */}
        <div className="absolute top-4 left-4 text-white">
          <div className="bg-black bg-opacity-50 px-3 py-2 rounded-lg">
            <p className="text-sm">
              {currentImageIndex + 1} / {images.length}
            </p>
        </div>
      </div>
      </div>
    </div>
  );
};

// 메인 컴포넌트
const SupervisorContractDetailScreen = () => {
  const params = useParams();
  const router = useRouter();
  const contractId = parseInt(params.id as string);

  // 탭 상태 추가
  const [activeTab, setActiveTab] = useState<"overview" | "records">("overview");
  
  // 기존 상태들
  const [contractDetail, setContractDetail] = useState<any>(null);
  const [contractInfo, setContractInfo] = useState<ContractInfo>({
    title: "",
    goal: "",
  });
  const [pendingItems, setPendingItems] = useState<VerificationItem[]>([]);
  const [monthlyVerifications, setMonthlyVerifications] = useState<{
    [date: string]: any[];
  }>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [verificationModal, setVerificationModal] =
    useState<VerificationModalState>({
      isOpen: false,
      type: null,
      item: null,
    });
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    item: VerificationItem | null;
  }>({
    isOpen: false,
      item: null,
    });

  // 계약서 미리보기 관련 상태 추가
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractPreview, setContractPreview] = useState<ContractPreviewResponse | null>(null);
  const [loadingContractPreview, setLoadingContractPreview] = useState(false);
  
  // 감독자 액션 관련 상태 추가
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);

  const { showAlert, AlertComponent } = useAlert();

  // 대기중인 인증 로드
    const loadPendingProofs = async () => {
      try {
      const proofs = await getAwaitProofs(contractId);

      if (!proofs || proofs.length === 0) {
        setPendingItems([]);
        return;
      }

      // 각 proof의 상세 정보를 가져와서 createdAt을 업데이트
      const detailedItems: VerificationItem[] = [];

      for (const proof of proofs) {
        const convertedItems = convertProofToVerificationItem(proof);

        for (const item of convertedItems) {
          try {
            const detailResponse = await getProof(item.proofId);
            if (detailResponse && detailResponse) {
              const detail = detailResponse;
              const updatedItem: VerificationItem = {
                ...item,
                createdAt: detail.createdAt || item.createdAt,
                date: detail.createdAt
                  ? isoStringToKoreanDateString(detail.createdAt)
                  : item.date,
                description: detail.comment || "",
                remainingTime: detail.createdAt
                  ? calculateRemainingTime(detail.createdAt)
              : undefined,
              };
              detailedItems.push(updatedItem);
            }
          } catch (error) {
            console.error(`Error fetching proof detail for ${item.proofId}:`, error);
            detailedItems.push(item);
          }
        }
      }

      // createdAt 기준으로 최신순 정렬
      detailedItems.sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      );

      setPendingItems(detailedItems);
      } catch (error) {
        console.error("Error loading pending proofs:", error);
      setPendingItems([]);
    }
  };

  // 월별 인증 기록 로드
  const loadMonthlyVerifications = async () => {
    try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

      const proofs = await getSupervisorProofsByMonth(contractId, year, month);

        const verificationsMap = await getProofListWithCreatedAtMap(
        proofs,
          getProof,
        (proof: any) => {
          const items: any[] = [];
          if (proof.originalProof) {
            items.push({
              proofId: proof.originalProof.proofId,
              status: proof.originalProof.status || "APPROVE_PENDING",
              date: "",
              createdAt: proof.originalProof.createdAt || proof.date,
              comment: "인증 완료",
              imageKey: proof.originalProof.imageKey,
              isReProof: false,
              totalSupervisors: proof.originalProof.totalSupervisors,
              completeSupervisors: proof.originalProof.completeSupervisors,
              rejectedAt: proof.rejectedAt,
              hasReProof: !!proof.reProof,
              feedbackStatus: proof.originalFeedbackStatus,
            });
          }
          if (proof.reProof) {
            items.push({
              proofId: proof.reProof.proofId,
              status: proof.reProof.status || "APPROVE_PENDING",
              date: "",
              createdAt: proof.reProof.createdAt || proof.date,
              comment: "재인증 완료",
              imageKey: proof.reProof.imageKey,
              isReProof: true,
              totalSupervisors: proof.reProof.totalSupervisors,
              completeSupervisors: proof.reProof.completeSupervisors,
              rejectedAt: proof.reProof.rejectedAt,
              feedbackStatus: proof.reProofFeedbackStatus,
            });
          }
          return items;
        }
      );
      setMonthlyVerifications(verificationsMap);
    } catch (err) {
      console.error("월별 인증 기록 조회 실패:", err);
      setMonthlyVerifications({});
    }
  };

  const { executeWithRetry: loadDataWithRetry, loading: dataLoading, error: dataError } = useRetryableApiCall(
    async () => {
      // 계약 상세 정보 조회
      const contractResponse = await getContract(contractId);
      if (contractResponse.success && contractResponse.result) {
        setContractDetail(contractResponse.result);
        const basic = contractResponse.result.contractBasicResponse || {};
        setContractInfo({
          title: basic.title || "",
          goal: basic.goal || "",
        });
      }

      // 병렬로 다른 데이터 로드
      await Promise.all([
        loadPendingProofs(),
        loadMonthlyVerifications(),
      ]);
    },
    {
      maxRetries: 3,
      retryDelay: 100,
      onMaxRetriesExceeded: () => {
        showAlert({
          message: "데이터를 불러오는 중 오류가 발생했습니다.",
          type: "error",
        });
      }
    }
  );

  const handleLoadData = async () => {
    try {
      setLoading(true);
      await loadDataWithRetry();
    } catch (error) {
      console.error("Error loading data:", error);
      showAlert({
        message: "데이터를 불러오는 중 오류가 발생했습니다.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) {
      handleLoadData();
    }
  }, [contractId]);

  // 계약서 미리보기 함수 추가
  const handleShowContract = async () => {
    setLoadingContractPreview(true);
    try {
      const response = await getContractPreview(contractId);
      if (response.success && response.result) {
        setContractPreview(response.result);
        setShowContractModal(true);
      } else {
        showAlert({
          message: "계약서를 불러오는데 실패했습니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching contract preview:", error);
      showAlert({
        message: "계약서를 불러오는데 실패했습니다.",
        type: "error",
      });
    } finally {
      setLoadingContractPreview(false);
    }
  };

  // 감독자 액션 함수들 추가
  const handleWithdraw = async () => {
    try {
      await withdrawSupervisorBefore(contractId);
      showAlert({ message: "참여가 철회되었습니다.", type: "success" });
      router.push("/");
    } catch (error) {
      console.error("Error withdrawing:", error);
      showAlert({
        message: "참여 철회 중 오류가 발생했습니다.",
        type: "error",
      });
    }
  };

  const handleAbandon = async () => {
    try {
      await withdrawSupervisorDuring(contractId);
      showAlert({ message: "중도 포기 처리되었습니다.", type: "success" });
      router.push("/");
    } catch (error) {
      console.error("Error abandoning:", error);
      showAlert({
        message: "중도 포기 중 오류가 발생했습니다.",
        type: "error",
      });
    }
  };

  const handleOpenImageModal = (item: VerificationItem) => {
    setImageModal({ isOpen: true, item });
  };

  const handleCloseImageModal = () => {
    setImageModal({ isOpen: false, item: null });
  };

  const handleOpenVerificationModal = (
    type: "approve" | "reject",
    item: VerificationItem
  ) => {
    setVerificationModal({ isOpen: true, type, item });
  };

  const handleCloseVerificationModal = () => {
    setVerificationModal({ isOpen: false, type: null, item: null });
  };

  const handleSubmitFeedback = async (comment: string) => {
    const { type, item } = verificationModal;
      if (!type || !item) return;

      try {
        await submitProofFeedback(item.proofId, {
          status: type === "approve" ? "APPROVED" : "REJECTED",
        comment,
      });

      showAlert({
        message: `인증이 ${type === "approve" ? "승인" : "거절"}되었습니다.`,
        type: "success",
      });

        handleCloseVerificationModal();
      // 데이터 새로고침 후 페이지 전체 새로고침
      await Promise.all([loadPendingProofs(), loadMonthlyVerifications()]);
      // 페이지 전체 새로고침으로 대기중인 인증과 달력의 인증 목록이 같이 갱신되도록 함
      window.location.reload();
      } catch (error) {
        console.error("Error submitting feedback:", error);
        showAlert({
          message: "피드백 제출 중 오류가 발생했습니다.",
          type: "error",
        });
      }
  };

  // 탭 데이터 준비
  const tabs = [
    {
      id: "overview",
      label: "개요",
      active: activeTab === "overview",
      onClick: () => setActiveTab("overview"),
    },
    {
      id: "records",
      label: "인증 기록",
      active: activeTab === "records",
      onClick: () => setActiveTab("records"),
    },
  ];

  const isBeforeStart = contractDetail?.contractStatus === "PENDING";
  const canWithdraw = isBeforeStart;
  const canAbandon = !isBeforeStart && contractDetail?.contractStatus === "IN_PROGRESS";

  if (loading) {
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
    <>
      <AlertComponent />
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="container-mobile">
          <CommonHeader 
            title={contractInfo.title || "매일 운동하기"} 
            tabs={tabs}
          />
          
                      <main className="px-4 pt-6 pb-4 bg-[#f0f5ff] flex-grow">
            {activeTab === "overview" ? (
              <OverviewView
                contractDetail={contractDetail}
                onShowContract={handleShowContract}
                loadingContractPreview={loadingContractPreview}
                canWithdraw={canWithdraw}
                canAbandon={canAbandon}
                onWithdraw={() => setShowWithdrawModal(true)}
                onAbandon={() => setShowAbandonModal(true)}
              />
            ) : (
              <RecordsView
                contractDetail={contractDetail}
                contractInfo={contractInfo}
                pendingItems={pendingItems}
                monthlyVerifications={monthlyVerifications}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onOpenImageModal={handleOpenImageModal}
                onOpenVerificationModal={handleOpenVerificationModal}
              />
            )}
          </main>

          {/* 모달들 */}
          {showContractModal && contractPreview && (
            <ContractModal
              isOpen={showContractModal}
              onClose={() => setShowContractModal(false)}
              contract={contractPreview}
              showSignature={false}
            />
          )}

          {showWithdrawModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-auto p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  참여 철회
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  정말로 이 계약의 감독 참여를 철회하시겠습니까?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      handleWithdraw();
                      setShowWithdrawModal(false);
                    }}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    철회
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAbandonModal && (
            <SupervisorAbandonModal
              isOpen={showAbandonModal}
              onClose={() => setShowAbandonModal(false)}
              contractId={contractId}
              contractTitle={contractInfo.title}
              onSuccess={() => {
                setShowAbandonModal(false);
                router.push("/");
              }}
            />
          )}

          <VerificationModal
            isOpen={verificationModal.isOpen}
            onClose={handleCloseVerificationModal}
            onSubmit={handleSubmitFeedback}
            title={
              verificationModal.type === "approve" ? "인증 승인" : "인증 거절"
            }
            type={verificationModal.type || "approve"}
          />

          <ImageModal
            isOpen={imageModal.isOpen}
            onClose={handleCloseImageModal}
            item={imageModal.item}
          />
                </div>
      </div>
    </>
  );
};

// 개요 탭 컴포넌트
const OverviewView = ({
  contractDetail,
  onShowContract,
  loadingContractPreview,
  canWithdraw,
  canAbandon,
  onWithdraw,
  onAbandon,
}: {
  contractDetail: any;
  onShowContract: () => void;
  loadingContractPreview: boolean;
  canWithdraw: boolean;
  canAbandon: boolean;
  onWithdraw: () => void;
  onAbandon: () => void;
}) => {
  if (!contractDetail) {
    return <div>계약 정보를 불러오는 중...</div>;
  }

  const basic = contractDetail.contractBasicResponse || {};
  const status = contractDetail.contractStatus;
  const achievementRatio = contractDetail.achievementRatio || "0/0";
  const [current, total] = achievementRatio.split("/").map(Number);
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;
  const deadlineProgress = getUnifiedDeadlineProgress({
    periodPercent: contractDetail.periodPercent,
    startDate: basic.startDate,
    endDate: basic.endDate,
    oneOff: basic.oneOff,
    contractStatus: status,
  });
  const supervisors = (contractDetail.participants || []).filter(
    (p: any) => p.role === "SUPERVISOR"
  );
  const supervisorCount = supervisors.length;
  const isBeforeStart = status === "PENDING";

  return (
    <div className="space-y-4">
      {/* 진행현황 카드 */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Trophy size={24} color={COLORS.blue} />
            <h2 className="font-bold text-lg">진행현황</h2>
          </div>
          <button
            onClick={onShowContract}
            disabled={loadingContractPreview}
            className="text-sm border rounded-xl px-4 py-1.5"
            style={{ 
              borderColor: COLORS.gray, 
              color: COLORS.grayText,
              borderWidth: '1.5px',
              borderRadius: '12px'
            }}
          >
            {loadingContractPreview ? "로딩중..." : "계약서 보기"}
          </button>
        </div>
        <div className="space-y-2" style={{ color: COLORS.grayText }}>
          <div className="flex items-center space-x-2">
            <Calendar size={16} color="#9ca3af" />
            <span>
              {basic.startDate?.slice(0, 10)} ~ {basic.endDate?.slice(0, 10)}
                </span>
              </div>
          <div className="flex items-center space-x-2">
            <Users size={16} color="#9ca3af" />
            <span>감독자 - {supervisorCount}명</span>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-800">달성률</span>
              <span style={{ fontWeight: 600, color: "var(--text-color-strong)" }}>
                {achievementRatio}회 ({progress}%)
                    </span>
                  </div>
                  <div
              className="w-full rounded-full h-2.5"
              style={{ backgroundColor: COLORS.gray }}
                  >
                    <div
                className="h-2.5 rounded-full"
                      style={{
                  width: `${progress}%`,
                        backgroundColor: "#22c55e",
                      }}
              ></div>
                  </div>
                </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-800">계약 기간</span>
              <span style={{ fontWeight: 600, color: "var(--text-color-strong)" }}>
                {deadlineProgress.toFixed(2)}%
                    </span>
                  </div>
                  <div
              className="w-full rounded-full h-2.5"
              style={{ backgroundColor: COLORS.gray }}
                  >
                    <div
                className="h-2.5 rounded-full"
                      style={{
                  width: `${deadlineProgress}%`,
                        backgroundColor: "#3b82f6",
                }}
              ></div>
                  </div>
                </div>
              </div>
      </div>

      {/* 계약 상세 정보 */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-lg mb-4">계약 상세</h3>
        <div className="space-y-3">
          <div>
            <span
              className="text-sm font-medium"
              style={{ color: COLORS.grayText }}
            >
              목표
            </span>
            <p className="text-sm mt-1" style={{ color: "#374151" }}>
              {basic.goal}
            </p>
          </div>
          {basic.reward && (
            <div>
              <span
                className="text-sm font-medium"
                style={{ color: COLORS.grayText }}
              >
                성공 시 보상
              </span>
              <p
                className="text-sm"
                style={{ color: COLORS.blue, marginTop: 4 }}
              >
                {basic.reward}
              </p>
            </div>
          )}
          {basic.penalty && (
            <div>
              <span
                className="text-sm font-medium"
                style={{ color: COLORS.grayText }}
              >
                실패 시 벌칙
              </span>
              <p className="text-sm text-red-700 mt-1">
                {basic.penalty}
              </p>
                </div>
              )}
            </div>
      </div>

      {/* 정보 메시지 */}
      {['COMPLETED', 'FAILED', 'ABANDONED'].includes(status) ? (
        <div className="bg-white rounded-xl p-5 shadow-sm text-center text-gray-500 font-semibold">
          계약이 종료된 상태입니다.
        </div>
      ) : (
        <>
          <div
            className="flex items-start text-sm bg-white p-3 rounded-lg space-x-2 border"
            style={{ borderColor: COLORS.gray }}
          >
            <Info size={16} color="#2563eb" />
            <span className="flex-1" style={{ color: COLORS.grayText }}>
              {isBeforeStart
                ? "계약 시작 전까지 참여를 철회할 수 있습니다."
                : "계약이 진행 중입니다. 중도 포기 시 계약자에게 알림이 갑니다."}
            </span>
          </div>
          {/* 액션 버튼들 */}
          <div className="space-y-3 pb-4">
            {canWithdraw && (
              <button
                onClick={onWithdraw}
                className="w-full bg-white font-bold py-3.5 rounded-lg shadow-sm border flex items-center justify-center space-x-2"
                style={{ borderColor: COLORS.gray, color: COLORS.grayText }}
              >
                <LogOut size={18} />
                <span>참여 철회</span>
              </button>
            )}
            {canAbandon && (
              <button
                onClick={onAbandon}
                className="w-full bg-white font-bold py-3.5 rounded-lg shadow-sm border"
                style={{ borderColor: COLORS.red, color: COLORS.red }}
              >
                중도 포기
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// 인증 기록 탭 컴포넌트
const RecordsView = ({
  contractDetail,
  contractInfo,
  pendingItems,
  monthlyVerifications,
  selectedDate,
  onDateSelect,
  onOpenImageModal,
  onOpenVerificationModal,
}: {
  contractDetail: any;
  contractInfo: ContractInfo;
  pendingItems: VerificationItem[];
  monthlyVerifications: { [date: string]: any[] };
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onOpenImageModal: (item: VerificationItem) => void;
  onOpenVerificationModal: (type: "approve" | "reject", item: VerificationItem) => void;
}) => {
  // 선택된 날짜의 인증 기록 찾기
  const selectedDateString = isoStringToKoreanDateString(
    selectedDate.toISOString()
  );
  const selectedDateVerifications = monthlyVerifications[selectedDateString] || [];

  return (
    <div className="space-y-6">
      {/* 대기중인 인증 */}
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
                onImageClick={onOpenImageModal}
                onOpenVerificationModal={onOpenVerificationModal}
                    />
                  ))
                )}
              </div>
            </section>

      {/* 계약 목표 */}
      <section aria-labelledby="contract-goal-title">
              <div className="bg-white rounded-xl shadow-sm p-4 mb-4 text-center">
                <p
                  className="text-sm font-semibold"
                  style={{ color: COLORS.textGray }}
                >
                  계약 목표
                </p>
                <p className="text-base font-bold text-gray-800 mt-1">
            {contractInfo.goal || "한강 달리기 1시간 아니면 근력운동 30분 하기"}
                </p>
              </div>
      </section>

      {/* 인증 현황 */}
      <section aria-labelledby="verification-status-title">
        <h2
          id="verification-status-title"
          className="text-base font-extrabold mb-3 px-1"
        >
          인증 현황
        </h2>
              <div className="mb-4">
                <ProofCalendar
            verifications={monthlyVerifications}
                  selectedDate={selectedDate}
            onDateSelect={onDateSelect}
                />
              </div>
              <div className="space-y-3">
                {selectedDateVerifications.length > 0 ? (
                  selectedDateVerifications.map((verification, index) => (
                    <ProofVerificationCard
                      key={`${verification.proofId}-${index}`}
                      verification={verification}
                contractId={contractDetail?.contractBasicResponse?.contractId?.toString() || ""}
                      mode="supervisor"
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-4 text-center text-gray-500">
                    해당 날짜의 인증 기록이 없습니다
                  </div>
                )}
              </div>
            </section>
        </div>
  );
};

export default SupervisorContractDetailScreen;
