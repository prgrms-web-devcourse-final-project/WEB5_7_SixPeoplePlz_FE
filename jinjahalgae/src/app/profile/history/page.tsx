/**
 * 끝난 계약 히스토리 페이지
 * - 완료된 계약과 실패한 계약 목록 표시
 * - 검색 및 필터링 기능
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getContractHistory } from "@/lib/api/contracts";
import { ArrowLeft, AlertTriangle, Search } from "lucide-react";
import { ContractListResponse } from "../../../../docs/data-contracts";
import { CommonHeader } from "@/components/CommonHeader";
import { useRetryableApiCall } from "@/lib/utils/retry";

export default function ContractHistoryPage() {
  const router = useRouter();
  const [allContracts, setAllContracts] = useState<ContractListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "success" | "failure" | "abandoned"
  >("all");
  const [activeTab, setActiveTab] = useState<"my" | "supervised">("my");

  const { executeWithRetry: fetchContractHistoryWithRetry } = useRetryableApiCall(
    (role: "CONTRACTOR" | "SUPERVISOR") => getContractHistory(role),
    {
      maxRetries: 3,
      retryDelay: 100
    }
  );

  const fetchContractHistory = async (role: "CONTRACTOR" | "SUPERVISOR") => {
    try {
      setLoading(true);
      // 계약 히스토리는 이미 완료된 계약들만 조회하므로 status 파라미터 없이 호출
      const response = await fetchContractHistoryWithRetry(role);
      setAllContracts(response.result?.content || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "계약 히스토리 조회에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 초기 로딩 시 "내 계약" 탭의 데이터를 가져옵니다
    fetchContractHistory("CONTRACTOR");
  }, []);

  // 탭 변경 시 해당하는 데이터를 가져옵니다
  useEffect(() => {
    const role = activeTab === "my" ? "CONTRACTOR" : "SUPERVISOR";
    fetchContractHistory(role);
    // 탭 변경 시 검색어와 필터를 초기화합니다
    setSearchTerm("");
    setStatusFilter("all");
  }, [activeTab]);

  const filteredHistory = allContracts.filter((contract) => {
    const matchesSearch = (contract.title || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "success" && contract.contractStatus === "COMPLETED") ||
      (statusFilter === "failure" && contract.contractStatus === "FAILED") ||
      (statusFilter === "abandoned" && contract.contractStatus === "ABANDONED");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
      <div className="container-mobile">
        {/* Header */}
        <CommonHeader
          title="히스토리"
          tabs={[
            {
              id: "my",
              label: "내 계약",
              active: activeTab === "my",
              onClick: () => setActiveTab("my"),
            },
            {
              id: "supervised",
              label: "감독한 계약",
              active: activeTab === "supervised",
              onClick: () => setActiveTab("supervised"),
            },
          ]}
        />

        {/* Main Content */}
        <main className="flex flex-col flex-grow overflow-hidden bg-[#f0f5ff]">
          {/* Search and Filter */}
          <div className="flex gap-4 p-6 bg-white border-b border-[#e5e7eb]">
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="운동하기"
                className="w-full pl-11 pr-4 py-3 text-sm border border-[#e5e7eb] rounded-xl bg-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "success" | "failure" | "abandoned"
                )
              }
              className="py-3 px-4 text-sm border border-[#e5e7eb] rounded-xl bg-[#f3f4f6] text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              <option value="all">전체</option>
              <option value="success">이행 성공</option>
              <option value="failure">이행 실패</option>
              <option value="abandoned">중도 포기</option>
            </select>
          </div>

          {/* Contract List */}
          <div className="flex-grow overflow-y-auto p-6 bg-[#f0f5ff]">
            {filteredHistory.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <p className="text-[#6b7280] text-sm">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredHistory.map((contract) => (
                  <div
                    key={contract.contractId}
                    className="bg-white rounded-2xl p-8 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      activeTab === "my"
                        ? router.push(`/contracts/${contract.contractId}`)
                        : router.push(`/supervise/${contract.contractId}`)
                    }
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-semibold text-[#1f2937] mr-4">
                        {contract.title}
                      </h2>
                      <span
                        className={`px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          contract.contractStatus === "COMPLETED"
                            ? "bg-[#dcfce7] text-[#15803d]"
                            : contract.contractStatus === "ABANDONED"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {contract.contractStatus === "COMPLETED"
                          ? "이행성공"
                          : contract.contractStatus === "ABANDONED"
                          ? "중도포기"
                          : "이행실패"}
                      </span>
                    </div>

                    <p className="text-sm text-[#6b7280] mb-6">
                      {new Date(contract.startDate || "")
                        .toLocaleDateString()
                        .replace(/\./g, ".")}{" "}
                      ~{" "}
                      {new Date(contract.endDate || "")
                        .toLocaleDateString()
                        .replace(/\./g, ".")}
                    </p>

                    {/* Progress Items */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-[#6b7280]">진행률</span>
                        <span className="text-[#1f2937] font-semibold">
                          {contract.achievementPercent || 0}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2563eb] rounded-full"
                          style={{
                            width: `${contract.achievementPercent || 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-[#6b7280]">계약 기간</span>
                        <span className="text-[#1f2937] font-semibold">
                          {contract.startDate && contract.endDate
                            ? `${Math.ceil(
                                (new Date(contract.endDate).getTime() -
                                  new Date(contract.startDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}일`
                            : "기간 정보 없음"}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2563eb] rounded-full"
                          style={{
                            width: `${
                              contract.contractStatus === "COMPLETED" ? 100 : 77
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-sm leading-relaxed pt-6 border-t border-[#e5e7eb]">
                      <p className="mb-1">
                        <span className="text-[#6b7280] font-semibold">
                          보상:
                        </span>{" "}
                        <strong className="text-[#2563eb]">
                          {contract.reward || "보상 정보 없음"}
                        </strong>
                      </p>
                      <p>
                        <span className="text-[#6b7280] font-semibold">
                          벌칙:
                        </span>{" "}
                        <strong className="text-[#ef4444]">
                          {contract.penalty || "벌칙 정보 없음"}
                        </strong>
                      </p>
                    </div>

                    <button
                      className="w-full py-4 text-base font-semibold text-white bg-[#1f2937] rounded-xl mt-8 hover:bg-gray-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/supervise/${contract.contractId}`);
                      }}
                    >
                      인증 확인하러 가기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
