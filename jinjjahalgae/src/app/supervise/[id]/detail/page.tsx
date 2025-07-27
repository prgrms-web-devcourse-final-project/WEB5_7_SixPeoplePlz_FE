"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Calendar,
  Target,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash,
  UserCheck,
  UserX,
  LogOut,
  Trophy,
  Camera,
  Info,
  Mail,
  AlertCircle,
} from "lucide-react";

// API imports
import {
  getContract,
  getContractTitleInfo,
  withdrawSupervisorBefore,
  withdrawSupervisorDuring,
} from "@/lib/api/contracts";
import { getImageUrl } from "@/lib/env";
import { ContractPreviewResponse } from "../../../../../docs/data-contracts";
import { useAlert } from "@/components/ui";
import { CommonHeader } from "@/components/CommonHeader";

// --- 타입 정의 ---
interface ContractInfo {
  contractId: number;
  title: string;
  goal: string;
  reward?: string;
  penalty?: string;
  status: string;
  startDate: string;
  endDate: string;
  weeklyCount: number;
  totalCount: number;
  currentCount: number;
  failCount: number;
  maxFailCount: number;
  supervisors: SupervisorInfo[];
}

interface SupervisorInfo {
  userId: number;
  userName: string;
  status: "ACTIVE" | "WITHDRAWN" | "ABANDONED";
  signatureKey?: string;
}

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

// --- 헬퍼 함수들 ---
const getStatusText = (status: string) => {
  switch (status) {
    case "PENDING":
      return "시작 대기중";
    case "IN_PROGRESS":
      return "진행중";
    case "COMPLETED":
      return "완료";
    case "FAILED":
      return "실패";
    case "ABANDONED":
      return "중도 포기";
    default:
      return "알 수 없음";
  }
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

// --- 아이콘 컴포넌트들 (lucide-react) ---
const ArrowLeftIcon = () => <ArrowLeft size={24} />;
const TrophyIcon = () => <Trophy size={16} />;
const CalendarIcon = ({ className }: { className?: string }) => (
  <Calendar size={16} className={className} />
);
const UsersIcon = ({ className }: { className?: string }) => (
  <Users size={16} className={className} />
);
const InfoIcon = () => <Info size={16} color="#2563eb" />;

const CheckCircleIcon = ({ color }: { color?: string }) => (
  <CheckCircle size={16} color={color} />
);
const ClockIcon = ({ color }: { color?: string }) => (
  <Clock size={16} color={color} />
);
const AlertCircleIcon = ({ color }: { color?: string }) => (
  <AlertCircle size={16} color={color} />
);

// --- 컴포넌트들 ---

const StatusBadge = ({ status }: { status: string }) => (
  <div
    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
    style={{
      backgroundColor: `${getStatusColor(status)}20`,
      color: getStatusColor(status),
    }}
  >
    {getStatusText(status)}
  </div>
);

const ProgressBar = ({
  current,
  total,
  color = COLORS.blue,
}: {
  current: number;
  total: number;
  color?: string;
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="h-2.5 rounded-full transition-all duration-300"
        style={{
          width: `${Math.min(percentage, 100)}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
};

const SupervisorCard = ({ supervisor }: { supervisor: SupervisorInfo }) => (
  <div className="bg-white rounded-lg p-4 border border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Users size={20} style={{ color: COLORS.grayText }} />
        </div>
        <div>
          <p className="font-medium text-gray-800">{supervisor.userName}</p>
          <div
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1"
            style={{
              backgroundColor: `${getSupervisorStatusColor(
                supervisor.status
              )}20`,
              color: getSupervisorStatusColor(supervisor.status),
            }}
          >
            {getSupervisorStatusText(supervisor.status)}
          </div>
        </div>
      </div>
      {supervisor.signatureKey && (
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img
            src={getImageUrl(supervisor.signatureKey)}
            alt="서명"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  </div>
);

// --- 메인 컴포넌트 ---
const SupervisorContractDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const contractId = parseInt(params.id as string);

  // 상태 관리
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);

  const { showAlert, AlertComponent } = useAlert();

  // 데이터 로딩
  useEffect(() => {
    const loadContractData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 계약 상세 정보 조회
        const contractResponse = await getContract(contractId);
        if (contractResponse.success && contractResponse.result) {
          const contract = contractResponse.result;

          // API 응답을 ContractInfo 형태로 변환
          const contractInfo: ContractInfo = {
            contractId: contract.contractBasicResponse?.contractId || 0,
            title: contract.contractBasicResponse?.title || "",
            goal: contract.contractBasicResponse?.goal || "",
            reward: contract.contractBasicResponse?.reward,
            penalty: contract.contractBasicResponse?.penalty,
            status: (contract as any).contractStatus || "PENDING",
            startDate: contract.contractBasicResponse?.startDate || "",
            endDate: contract.contractBasicResponse?.endDate || "",
            weeklyCount:
              (contract.contractBasicResponse as any)?.weeklyCount || 0,
            totalCount:
              (contract.contractBasicResponse as any)?.totalCount || 0,
            currentCount: (contract as any).currentCount || 0,
            failCount: (contract as any).failCount || 0,
            maxFailCount:
              (contract.contractBasicResponse as any)?.maxFailCount || 0,
            supervisors:
              contract.participants
                ?.filter((p: any) => p.role === "SUPERVISOR")
                .map((p: any) => ({
                  userId: p.userId || 0,
                  userName: p.basicInfo?.userName || "",
                  status: p.status || "ACTIVE",
                  signatureKey: p.signatureKey,
                })) || [],
          };

          setContractInfo(contractInfo);
        } else {
          setError("계약 정보를 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error("Error loading contract data:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      loadContractData();
    }
  }, [contractId]);

  // 감독자 참여 철회 (계약 시작 전)
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

  // 감독자 중도 포기 (계약 진행 중)
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

  const isBeforeStart = contractInfo?.status === "PENDING";
  const canWithdraw = isBeforeStart;
  const canAbandon = !isBeforeStart && contractInfo?.status === "IN_PROGRESS";

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

  if (error || !contractInfo) {
    return (
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="container-mobile">
          <div className="flex items-center justify-center min-h-screen px-6">
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                <AlertTriangle size={24} style={{ color: COLORS.red }} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                오류 발생
              </h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                {error || "계약을 찾을 수 없습니다."}
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                홈으로 가기
              </button>
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
          {/* Header */}
          <CommonHeader title="감독 인증 내역" />

          <main className="px-4 pb-4">
            <div className="space-y-4">
              {/* 진행현황 카드 */}
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <TrophyIcon />
                    <h2 className="font-bold text-lg">진행현황</h2>
                  </div>
                </div>
                <div className="space-y-2" style={{ color: COLORS.grayText }}>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon />
                    <span>
                      {new Date(contractInfo.startDate).toLocaleDateString()} ~{" "}
                      {new Date(contractInfo.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UsersIcon />
                    <span>
                      감독자 -{" "}
                      {
                        contractInfo.supervisors.filter(
                          (s) => s.status === "ACTIVE"
                        ).length
                      }
                      명
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-800">
                        인증 진행률
                      </span>
                      <span style={{ color: COLORS.grayText }}>
                        {contractInfo.currentCount}/{contractInfo.totalCount}회
                        (
                        {contractInfo.totalCount > 0
                          ? Math.round(
                              (contractInfo.currentCount /
                                contractInfo.totalCount) *
                                100
                            )
                          : 0}
                        %)
                      </span>
                    </div>
                    <ProgressBar
                      current={contractInfo.currentCount}
                      total={contractInfo.totalCount}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-800">
                        실패 횟수
                      </span>
                      <span style={{ color: COLORS.grayText }}>
                        {contractInfo.failCount}/{contractInfo.maxFailCount}회
                      </span>
                    </div>
                    <ProgressBar
                      current={contractInfo.failCount}
                      total={contractInfo.maxFailCount}
                      color={COLORS.red}
                    />
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
                      {contractInfo.goal}
                    </p>
                  </div>
                  {contractInfo.reward && (
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
                        {contractInfo.reward}
                      </p>
                    </div>
                  )}
                  {contractInfo.penalty && (
                    <div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: COLORS.grayText }}
                      >
                        실패 시 벌칙
                      </span>
                      <p className="text-sm text-red-700 mt-1">
                        {contractInfo.penalty}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 감독자 목록 */}
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <UsersIcon />
                  <h3 className="font-bold text-lg">감독자 목록</h3>
                </div>

                <div className="space-y-3">
                  {contractInfo.supervisors.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      감독자가 없습니다.
                    </p>
                  ) : (
                    contractInfo.supervisors.map((supervisor) => (
                      <SupervisorCard
                        key={supervisor.userId}
                        supervisor={supervisor}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* 정보 메시지 */}
              <div
                className="flex items-start text-sm bg-white p-3 rounded-lg space-x-2 border"
                style={{ borderColor: COLORS.gray }}
              >
                <InfoIcon />
                <span className="flex-1" style={{ color: COLORS.grayText }}>
                  {isBeforeStart
                    ? "계약 시작 전까지 참여를 철회할 수 있습니다."
                    : "계약이 진행 중입니다. 중도 포기 시 계약자에게 알림이 갑니다."}
                </span>
              </div>

              {/* 액션 버튼들 */}
              <div className="space-y-3 pb-4">
                <Link href={`/supervise/${contractId}`}>
                  <button
                    className="w-full bg-white font-bold py-3.5 rounded-lg shadow-sm border flex items-center justify-center space-x-2"
                    style={{ borderColor: COLORS.gray, color: COLORS.blue }}
                  >
                    <Eye size={18} />
                    <span>인증 확인하기</span>
                  </button>
                </Link>

                {canWithdraw && (
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="w-full bg-white font-bold py-3.5 rounded-lg shadow-sm border flex items-center justify-center space-x-2"
                    style={{ borderColor: COLORS.gray, color: COLORS.grayText }}
                  >
                    <LogOut size={18} />
                    <span>참여 철회</span>
                  </button>
                )}

                {canAbandon && (
                  <button
                    onClick={() => setShowAbandonModal(true)}
                    className="w-full bg-white font-bold py-3.5 rounded-lg shadow-sm border"
                    style={{ borderColor: COLORS.red, color: COLORS.red }}
                  >
                    중도 포기
                  </button>
                )}
              </div>
            </div>
          </main>

          {/* 참여 철회 확인 모달 */}
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

          {/* 중도 포기 확인 모달 */}
          {showAbandonModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-auto p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  중도 포기
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  정말로 이 계약의 감독을 중도 포기하시겠습니까?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAbandonModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      handleAbandon();
                      setShowAbandonModal(false);
                    }}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    포기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SupervisorContractDetailPage;
