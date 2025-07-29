/**
 * 계약 상세 페이지 - 예시 코드 스타일 적용
 * 한국식 깔끔한 디자인으로 업데이트
 */

"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Users,
  Camera,
  Info,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  XCircle,
  Bell,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// --- 아이콘 컴포넌트들 (lucide-react) ---
const ArrowLeftIcon = () => <ArrowLeft size={24} />;
const TrophyIcon = () => <Trophy size={24} />;
const CalendarIcon = ({ className }: { className?: string }) => (
  <Calendar size={16} className={className} />
);
const UsersIcon = ({ className }: { className?: string }) => (
  <Users size={16} className={className} />
);
const CameraIcon = () => <Camera size={24} />;
const InfoIcon = () => <Info size={16} color="#2563eb" />;
const MailIcon = () => <Mail size={24} />;
const CheckCircleIcon = ({ color }: { color?: string }) => (
  <CheckCircle size={16} color={color} />
);
const ClockIcon = ({ color }: { color?: string }) => (
  <Clock size={16} color={color} />
);
const AlertCircleIcon = ({ color }: { color?: string }) => (
  <AlertCircle size={16} color={color} />
);
const EyeIcon = () => <Eye size={16} />;
const EditIcon = () => <Edit size={16} />;
const TrashIcon = () => <Trash2 size={16} />;
const PlusIcon = () => <Plus size={16} />;
const XCircleIcon = () => <XCircle size={16} />;
const BellIcon = () => <Bell size={20} />;
const AlertTriangleIcon = () => <AlertTriangle size={20} />;

// --- 색상 팔레트 ---
const COLORS = {
  blue: "#2563eb",
  lightBlue: "#93c5fd",
  bgLightBlue: "#f0f5ff",
  gray: "#e5e7eb",
  red: "#ef4444",
  lightRed: "#fee2e2",
  grayText: "#6b7280",
  green: "#16a34a",
  lightGreen: "#eafdf0",
  yellow: "#facc15",
  darkYellow: "#b45309",
  lightYellow: "#fef3c7",
};

// --- 컴포넌트들 ---
import {
  getContract,
  getContractPreview,
  deleteContract,
  withdrawContract,
} from "@/lib/api/contracts";
import {
  getRecentProofs,
  getContractorProofsByMonth,
  getProof,
  createReProof,
} from "@/lib/api/proofs";
import { getProofListWithCreatedAtMap } from "@/lib/utils/verification";
import { getUnifiedDeadlineProgress } from "@/lib/utils/contract";
import ProofCalendar from "@/components/proof/ProofCalendar";
import ProofVerificationCard from "@/components/proof/ProofVerificationCard";
type Contract = any;
import { Button, Card, ProgressBar } from "@/components/ui";

import { ContractModal } from "@/components/ContractModal";
import { InviteModal } from "@/components/InviteModal";
import { AbandonContractModal } from "@/components/AbandonContractModal";
import { VerificationBottomSheet } from "@/components/VerificationBottomSheet";
import { getImageUrl } from "@/lib/env";
import { isoStringToKoreanDateString } from "@/lib/utils/date";
import { useAlert } from "@/components/ui";
import { CommonHeader } from "@/components/CommonHeader";
import { useRetryableApiCall } from "@/lib/utils/retry";

// --- 달력 컴포넌트는 ProofCalendar로 대체됨 ---

export default function ContractDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"overview" | "records">(
    "overview"
  );
  const [contract, setContract] = useState<Contract | null>(null);
  const [contractPreview, setContractPreview] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);
  const [monthlyVerifications, setMonthlyVerifications] = useState<{
    [date: string]: any[];
  }>({});
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { showAlert, AlertComponent } = useAlert();

  const { executeWithRetry: fetchContractDataWithRetry, loading: contractLoading, error: contractError } = useRetryableApiCall(
    () => getContract(parseInt(params.id)),
    {
      maxRetries: 3,
      retryDelay: 100,
      onMaxRetriesExceeded: () => {
        setContract(null);
      }
    }
  );

  const handleFetchContractData = async () => {
    try {
      const data = await fetchContractDataWithRetry();
      setContract(data.result);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "계약 조회에 실패했습니다."
      );
      setContract(null);
    }
  };

  const fetchRecentVerifications = async () => {
    try {
      const proofs = await getRecentProofs(parseInt(params.id));
      // timezone 처리를 위해 날짜 변환 및 최신순 정렬
      const processedProofs = (proofs || [])
        .map((proof: any) => ({
          ...proof,
          date: proof.createdAt
            ? isoStringToKoreanDateString(proof.createdAt)
            : "",
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ); // 최신순 정렬
      setRecentVerifications(processedProofs);
    } catch (err) {
      console.error("최근 인증 기록 조회 실패:", err);
      setRecentVerifications([]);
    }
  };

  const fetchMonthlyVerifications = async () => {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const proofs = await getContractorProofsByMonth(
        parseInt(params.id),
        year,
        month
      );

      // 공통 유틸 사용: createdAt 기준 날짜 매핑
      const verificationsMap = await getProofListWithCreatedAtMap(
        proofs,
        getProof,
        (proof: any) => {
          const items: any[] = [];
          if (proof.originalProof) {
            items.push({
              proofId: proof.originalProof.proofId,
              status: proof.originalProof.status || "APPROVE_PENDING",
              date: "", // createdAt으로 나중에 세팅
              createdAt: proof.originalProof.createdAt || proof.date,
              comment: "인증 완료",
              imageKey: proof.originalProof.imageKey,
              isReProof: false,
              totalSupervisors: proof.originalProof.totalSupervisors,
              completeSupervisors: proof.originalProof.completeSupervisors,
              rejectedAt: proof.rejectedAt, // 추가: 거절된 시간
              hasReProof: !!proof.reProof, // 추가: 재인증이 존재하는지 여부
            });
          }
          if (proof.reProof) {
            items.push({
              proofId: proof.reProof.proofId,
              status: proof.reProof.status || "APPROVE_PENDING",
              date: "", // createdAt으로 나중에 세팅
              createdAt: proof.reProof.createdAt || proof.date,
              comment: "재인증 완료",
              imageKey: proof.reProof.imageKey,
              isReProof: true,
              totalSupervisors: proof.reProof.totalSupervisors,
              completeSupervisors: proof.reProof.completeSupervisors,
              rejectedAt: proof.reProof.rejectedAt, // 추가: 재인증 거절 시간(있다면)
            });
          }
          return items;
        }
      );
      setMonthlyVerifications(verificationsMap);
    } catch (err) {
      console.error("월별 인증 기록 조회 실패:", err);
      setMonthlyVerifications({}); // 빈 객체로 설정
    }
  };

  const fetchContractPreview = async () => {
    try {
      const response = await getContractPreview(parseInt(params.id));
      setContractPreview(response.result);
    } catch (err) {
      console.error("계약서 미리보기 조회 실패:", err);
      setContractPreview(null);
    }
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "records") {
      setActiveTab("records");
    }
    handleFetchContractData();
    fetchRecentVerifications();
    fetchMonthlyVerifications(); // 월별 인증 기록 데이터 가져오기
    fetchContractPreview();
  }, [params.id, searchParams]);

  // 인증 기록이 로드된 후 자동으로 날짜 설정
  useEffect(() => {
    if (activeTab === "records" && recentVerifications.length > 0) {
      // 가장 최근 인증 기록의 날짜를 선택
      const latestVerification = recentVerifications[0];
      if (latestVerification.date) {
        setSelectedDate(new Date(latestVerification.date));
      }
    }
  }, [activeTab, recentVerifications]);

  useEffect(() => {
    if (searchParams.get("action") === "verify") {
      setShowVerificationModal(true);
      // URL에서 action=verify 쿼리 파라미터를 제거하여, 새로고침 시 모달이 다시 뜨는 것을 방지합니다.
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("action");
      router.replace(`/contracts/${params.id}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    }
    if (searchParams.get("action") === "reproof") {
      setShowVerificationModal(true);
      // (수정) reproof 모달이 열려있는 동안에는 쿼리 파라미터를 유지해야 VerificationBottomSheet가 isReProof, proofId를 올바르게 받음
      // 모달이 닫힐 때(제출/취소)만 쿼리 파라미터를 제거하도록 VerificationBottomSheet의 onClose에서 처리 필요
    }
  }, [searchParams, params.id, router]);

  const handleAbandonContract = async () => {
    try {
      const contractId = parseInt(params.id);
      const contractStatus = contract?.contractStatus;

      // 계약 상태에 따라 적절한 API 호출
      if (contractStatus === "PENDING") {
        // 계약 시작 전: deleteContract API 사용
        await deleteContract(contractId);
      } else if (contractStatus === "IN_PROGRESS") {
        // 계약 진행 중: withdrawContract API 사용
        await withdrawContract(contractId);
      } else {
        throw new Error("포기할 수 없는 계약 상태입니다.");
      }

      // 성공 시 홈으로 이동
      router.push("/");
    } catch (error) {
      console.error("계약 포기 실패:", error);
      showAlert({
        message: "계약 포기에 실패했습니다. 잠시 후 다시 시도해주세요.",
        type: "error",
      });
    }
  };

  const handleVerificationSubmit = async (images: string[], memo: string) => {
    try {
      console.log("인증 제출:", { images, memo });
    } catch (error) {
      console.error("인증 제출 실패:", error);
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    handleFetchContractData();
    fetchRecentVerifications();
    fetchMonthlyVerifications();
    // Switch to records tab to show the new record
    setActiveTab("records");
  };

  const handleReProofRequest = async (proofId: number) => {
    try {
      // 재인증 모달을 열기 위해 URL 파라미터를 설정
      router.push(`/contracts/${params.id}?action=reproof&proofId=${proofId}`, {
        scroll: false,
      });
    } catch (error) {
      console.error("재인증 요청 처리 실패:", error);
      showAlert({
        message: "재인증 요청에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
    }
  };

  const handleShowContract = async () => {
    await fetchContractPreview();
    setShowContractModal(true);
  };

  // 진행률 데이터 계산
  const progressData = (() => {
    if (!contract)
      return {
        completed: 0,
        total: 0,
        percentage: 0,
        daysLeft: 0,
        streak: 0,
        timePercentage: 0,
      };

    const completed = contract.currentProof || 0;
    const total = contract.contractBasicResponse?.totalProof || 0;
    // 달성률: 항상 소수점 둘째자리까지
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    // 날짜 계산 - 시분초 단위까지 정확하게 계산
    const now = new Date();
    const startDate = new Date(contract.contractBasicResponse?.startDate || "");
    const endDate = new Date(contract.contractBasicResponse?.endDate || "");
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    // 통일된 기간 진행률 계산 함수 사용
    const timePercentage = getUnifiedDeadlineProgress({
      periodPercent: contract.periodPercent,
      startDate: contract.contractBasicResponse?.startDate,
      endDate: contract.contractBasicResponse?.endDate,
      oneOff: contract.contractBasicResponse?.oneOff,
      contractStatus: contract.contractStatus,
    });
    // 남은 일수 계산 (기존 로직 유지)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      completed,
      total,
      percentage,
      daysPassed,
      totalDays,
      daysLeft,
      streak: 0, // TODO: API에서 연속 달성 일수 가져오기
      timePercentage,
    };
  })();

  if (contractLoading) {
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
            title={contract?.contractBasicResponse?.title || "계약 상세"}
            rightContent={
              contract?.contractStatus ? (
                <StatusBadge status={contract.contractStatus} />
              ) : null
            }
            tabs={[
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
            ]}
          />

          {!contract ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">계약 정보를 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <main className="px-4 pt-6 pb-4 bg-[#f0f5ff] flex-grow">
              {activeTab === "overview" ? (
                <OverviewView
                  contract={contract}
                  progressData={progressData}
                  onShowContract={handleShowContract}
                  onEditContract={() =>
                    router.push(
                      `/contracts/${contract?.contractBasicResponse?.contractId}/edit`
                    )
                  }
                  onInviteSupervisor={() => setShowInviteModal(true)}
                  onAbandonContract={() => setShowAbandonModal(true)}
                  onOpenVerificationModal={() =>
                    setShowVerificationModal(true)
                  }
                />
              ) : (
                <RecordsView
                  contract={contract}
                  verifications={monthlyVerifications}
                  recentVerifications={recentVerifications}
                  onOpenModal={() => setShowVerificationModal(true)}
                  onRefresh={() => {
                    fetchRecentVerifications();
                    fetchMonthlyVerifications();
                    handleFetchContractData();
                  }}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  contractId={params.id}
                  onReProofRequest={handleReProofRequest}
                />
              )}
            </main>
          )}

          {/* Modals */}
          {showContractModal && contractPreview && (
            <ContractModal
              isOpen={showContractModal}
              onClose={() => setShowContractModal(false)}
              contract={contractPreview}
            />
          )}

          {showInviteModal && contract && (
            <InviteModal
              isOpen={showInviteModal}
              onClose={() => setShowInviteModal(false)}
              contractId={contract?.contractBasicResponse?.contractId!}
              contractTitle={contract?.contractBasicResponse?.title ?? ""}
            />
          )}

          {showAbandonModal && contract && (
            <AbandonContractModal
              isOpen={showAbandonModal}
              onClose={() => setShowAbandonModal(false)}
              onConfirm={handleAbandonContract}
            />
          )}

          {/* Only render VerificationBottomSheet if contract is not null */}
          {showVerificationModal && searchParams.get("action") === "reproof" && !contract ? (
            // contract가 아직 로드되지 않았다면 로딩 스피너 표시 (재인증 모달용)
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">계약 정보를 불러오는 중...</p>
              </div>
            </div>
          ) : null}
          {showVerificationModal && contract ? (
            <VerificationBottomSheet
              isOpen={showVerificationModal}
              onClose={() => setShowVerificationModal(false)}
              contractId={contract.contractBasicResponse?.contractId!}
              contractTitle={contract.contractBasicResponse?.title ?? ""}
              contractGoal={contract.contractBasicResponse?.goal ?? ""}
              onSuccess={handleVerificationSuccess}
              isReProof={searchParams.get("action") === "reproof"}
              proofId={
                searchParams.get("proofId")
                  ? parseInt(searchParams.get("proofId")!)
                  : undefined
              }
            />
          ) : showVerificationModal && !contract ? (
            // contract가 null이지만 모달을 열어야 하는 경우 (일반 인증)
            <VerificationBottomSheet
              isOpen={showVerificationModal}
              onClose={() => setShowVerificationModal(false)}
              contractId={parseInt(params.id)}
              contractTitle=""
              contractGoal=""
              onSuccess={handleVerificationSuccess}
              isReProof={false}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

// 개요 탭 컴포넌트
const OverviewView = ({
  contract,
  progressData,
  onShowContract,
  onEditContract,
  onInviteSupervisor,
  onAbandonContract,
  onOpenVerificationModal,
}: {
  contract: Contract;
  progressData: any;
  onShowContract: () => void;
  onEditContract: () => void;
  onInviteSupervisor: () => void;
  onAbandonContract: () => void;
  onOpenVerificationModal: () => void;
}) => {
  const supervisors =
    contract.participants?.filter(
      (p: any) => p.role === "SUPERVISOR" && p.valid
    ) ?? [];
  const contractStatus = contract.contractStatus;
  const isBeforeStart = contractStatus === "PENDING";
  const hasAnySupervisionSignature = supervisors.length > 0;
  const canEditContract = !hasAnySupervisionSignature;
  const canInviteSupervisor = isBeforeStart;

  return (
    <div className="space-y-4">
      {/* 진행현황 카드 */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <TrophyIcon />
            <h2 className="font-bold text-lg">진행현황</h2>
          </div>
          <button
            onClick={onShowContract}
            className="text-sm border rounded-xl px-4 py-1.5"
            style={{ 
              borderColor: COLORS.gray, 
              color: COLORS.grayText,
              borderWidth: '1.5px',
              borderRadius: '12px'
            }}
          >
            계약서 보기
          </button>
        </div>
        <div className="space-y-2" style={{ color: COLORS.grayText }}>
          <div className="flex items-center space-x-2">
            <Calendar size={16} color="#9ca3af" />
            <span>
              {new Date(
                contract.contractBasicResponse?.startDate ?? ""
              ).toLocaleDateString()}{" "}
              ~{" "}
              {new Date(
                contract.contractBasicResponse?.endDate ?? ""
              ).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users size={16} color="#9ca3af" />
            <span>
              감독자 - {supervisors.length}명{" "}
              {supervisors.length > 0 &&
                `(${supervisors[0].userName} 외 ${supervisors.length - 1}명)`}
            </span>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-800">달성률</span>
              <span style={{ fontWeight: 600, color: "var(--text-color-strong)" }}>
                {progressData.completed}/{progressData.total}회 ({progressData.percentage.toFixed(2)}%)
              </span>
            </div>
            <div
              className="w-full rounded-full h-2.5"
              style={{ backgroundColor: COLORS.gray }}
            >
              <div
                className="h-2.5 rounded-full"
                style={{
                  width: `${progressData.percentage.toFixed(2)}%`,
                  backgroundColor: "#22c55e",
                }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-800">계약 기간</span>
              <span style={{ fontWeight: 600, color: "var(--text-color-strong)" }}>
                {progressData.daysPassed}/{progressData.totalDays}일 ({getUnifiedDeadlineProgress({
                  periodPercent: contract.periodPercent,
                  startDate: contract.contractBasicResponse?.startDate,
                  endDate: contract.contractBasicResponse?.endDate,
                  oneOff: contract.contractBasicResponse?.oneOff,
                  contractStatus: contract.contractStatus,
                }).toFixed(2)}%)
              </span>
            </div>
            <div
              className="w-full rounded-full h-2.5"
              style={{ backgroundColor: COLORS.gray }}
            >
              <div
                className="h-2.5 rounded-full"
                style={{
                  width: `${getUnifiedDeadlineProgress({
                    periodPercent: contract.periodPercent,
                    startDate: contract.contractBasicResponse?.startDate,
                    endDate: contract.contractBasicResponse?.endDate,
                    oneOff: contract.contractBasicResponse?.oneOff,
                    contractStatus: contract.contractStatus,
                  }).toFixed(2)}%`,
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
              {contract.contractBasicResponse?.goal}
            </p>
          </div>
          {contract.contractBasicResponse?.reward && (
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
                {contract.contractBasicResponse.reward}
              </p>
            </div>
          )}
          {contract.contractBasicResponse?.penalty && (
            <div>
              <span
                className="text-sm font-medium"
                style={{ color: COLORS.grayText }}
              >
                실패 시 벌칙
              </span>
              <p className="text-sm text-red-700 mt-1">
                {contract.contractBasicResponse.penalty}
              </p>
            </div>
          )}
        </div>
      </div>
      {/* 종료된 계약 처리 */}
      {['COMPLETED', 'FAILED', 'ABANDONED'].includes(contract.contractStatus) ? (
        <div className="bg-white rounded-xl p-5 shadow-sm text-center text-gray-500 font-semibold">
          계약이 종료된 상태입니다.
        </div>
      ) : (
        <>
          {/* 1. 오늘의 인증 카드 조건부 렌더링 및 버튼 상태 변경 */}
          {contract.contractStatus === "IN_PROGRESS" && (
            <div
              className="bg-white text-center rounded-xl p-6 border"
              style={{ borderColor: COLORS.gray }}
            >
              <div className="flex justify-center items-center space-x-2">
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: COLORS.blue }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <h2 className="font-bold text-lg">오늘의 인증</h2>
              </div>
              <p className="mt-2 mb-4" style={{ color: COLORS.grayText }}>
                오늘 목표를 달성했다면 인증해주세요!
              </p>
              <button
                onClick={() => onOpenVerificationModal()}
                className={`w-full font-bold py-3.5 rounded-lg flex items-center justify-center space-x-2 ${
                  contract.todayProofExist
                    ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                    : "text-white"
                } `}
                style={{
                  backgroundColor: contract.todayProofExist
                    ? COLORS.gray
                    : COLORS.blue,
                }}
                disabled={contract.todayProofExist}
              >
                <CameraIcon />
                <span>
                  {contract.todayProofExist
                    ? "오늘 인증 완료"
                    : "사진으로 인증하기"}
                </span>
              </button>
            </div>
          )}
          {/* 정보 메시지 */}
          <div
            className="flex items-start text-sm bg-white p-3 rounded-lg space-x-2 border"
            style={{ borderColor: COLORS.gray }}
          >
            <InfoIcon />
            <span className="flex-1" style={{ color: COLORS.grayText }}>
              {/* oneOff 계약이고 PENDING 상태일 때 특별 주의사항 표시 */}
              {(contract as any)?.contractBasicResponse?.oneOff &&
              contract.contractStatus === "PENDING"
                ? "⚠️ 24시간 내로 감독자가 1명 참여하면 즉시 시작됩니다"
                : canEditContract
                ? "감독자 서명이 없을 때만 수정이 가능합니다"
                : "감독자가 서명한 후에는 계약을 수정할 수 없습니다"}
            </span>
          </div>
          {/* 액션 버튼들 */}
          <div className="space-y-3 pb-4">
            {canEditContract && (
              <button
                onClick={onEditContract}
                className="w-full bg-white font-bold py-3.5 rounded-lg shadow-sm border"
                style={{ borderColor: COLORS.gray, color: COLORS.blue }}
              >
                계약 수정하기
              </button>
            )}
            {canInviteSupervisor && (
              <button
                onClick={onInviteSupervisor}
                className="w-full bg-white font-bold py-3.5 rounded-lg shadow-sm border flex items-center justify-center space-x-2"
                style={{ borderColor: COLORS.gray, color: COLORS.grayText }}
              >
                <MailIcon />
                <span>감독 초대하기</span>
              </button>
            )}
            {/* 2. 계약 포기 버튼 조건부 렌더링 및 모달 처리 */}
            {["PENDING", "IN_PROGRESS"].includes(contract.contractStatus) && (
              <button
                onClick={onAbandonContract}
                className="w-full bg-white font-bold py-3.5 rounded-lg shadow-sm border"
                style={{ borderColor: COLORS.red, color: COLORS.red }}
              >
                계약 포기하기
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// 인증기록 탭 컴포넌트
const RecordsView = ({
  contract,
  verifications,
  recentVerifications,
  onOpenModal,
  onRefresh,
  selectedDate,
  onDateSelect,
  contractId,
  onReProofRequest,
}: {
  contract: Contract;
  verifications: { [date: string]: any[] };
  recentVerifications: any[];
  onOpenModal: () => void;
  onRefresh?: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  contractId: string;
  onReProofRequest?: (proofId: number) => void;
}) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          text: "승인",
          color: COLORS.green,
          icon: <CheckCircleIcon color={COLORS.green} />,
        };
      case "APPROVE_PENDING":
        return {
          text: "대기중",
          color: COLORS.yellow,
          icon: <ClockIcon color={COLORS.yellow} />,
        };
      case "REJECTED":
        return {
          text: "거절됨",
          color: COLORS.red,
          icon: <AlertCircleIcon color={COLORS.red} />,
        };
      default:
        return {
          text: "알수없음",
          color: COLORS.grayText,
          icon: <AlertCircleIcon color={COLORS.grayText} />,
        };
    }
  };

  const router = useRouter();

  // 선택된 날짜의 인증 기록 찾기
  const selectedDateString = isoStringToKoreanDateString(
    selectedDate.toISOString()
  );
  const selectedDateVerifications = verifications[selectedDateString] || [];

  return (
    <div className="space-y-6">
      {/* 최근 인증 */}
      <section aria-labelledby="recent-verification-title">
        <h2
          id="recent-verification-title"
          className="text-base font-extrabold mb-2 px-1"
        >
          최근 인증 ({recentVerifications.slice(0, 3).length})
        </h2>
        <p className="text-xs mb-3 px-1" style={{ color: COLORS.grayText }}>
          최근 3개의 인증내역을 확인하세요
        </p>
        <div className="space-y-3">
          {recentVerifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-4 text-center text-gray-500">
              아직 인증 기록이 없습니다
            </div>
          ) : (
            recentVerifications.slice(0, 3).map((verification, index) => {
              const statusInfo = getStatusInfo(verification.status);
              return (
                <div
                  key={verification.proofId || index}
                  className="bg-white rounded-xl shadow-sm p-4 cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/contracts/${contractId}/proofs/${verification.proofId}`
                    )
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      {verification.imageKey ? (
                        <img
                          src={getImageUrl(verification.imageKey)}
                          alt="인증 이미지"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: COLORS.gray }}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {verification.createdAt
                          ? new Date(verification.createdAt)
                              .toLocaleDateString("ko-KR")
                              .replace(/\. /g, ".")
                          : "날짜 없음"}
                      </p>
                      <p className="text-sm" style={{ color: COLORS.grayText }}>
                        {verification.comment || "인증 완료"}
                      </p>
                    </div>
                    <div
                      className="flex items-center space-x-1 text-xs"
                      style={{ color: statusInfo.color }}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.text}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 text-center">
          <p
            className="text-sm font-semibold"
            style={{ color: COLORS.grayText }}
          >
            계약 목표
          </p>
          <p className="text-base font-bold text-gray-800 mt-1">
            {contract.contractBasicResponse?.goal ||
              "한강 달리기 1시간 아니면 근력운동 30분 하기"}
          </p>
        </div>
        <div className="mb-4">
          <ProofCalendar
            verifications={verifications}
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
                contractId={contractId}
                mode="contractor"
                onReProofRequest={onReProofRequest}
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
