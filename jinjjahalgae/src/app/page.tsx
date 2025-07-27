/**
 * 메인 페이지 - 내 계약 목록 및 감독중 계약 목록
 * - 내 계약 탭: 계약자로 참여중인 계약 목록
 * - 감독중 탭: 감독자로 참여중인 계약 목록
 * - 계약 생성 FAB 버튼
 * - 알림 버튼
 * - 각 계약 카드에 인증하기/인증 확인하기 버튼
 * - 예시 코드 스타일 적용
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getMyContracts, getContractPreview } from "@/lib/api/contracts";
import { getMyInfo } from "@/lib/api/users";
import { getUnreadNotificationCount } from "@/lib/api/notifications";
import {
  ContractListResponse,
  MyInfoResponse,
  ContractPreviewResponse,
} from "@/../docs/data-contracts";
import { Card, Button, ProgressBar, LoadingSpinner } from "@/components/ui";
import { InviteCodeModal } from "@/components/InviteCodeModal";
import { ContractModal } from "@/components/ContractModal";
import { GlobalStyles } from "@/components/GlobalStyles";
import {
  StatusBadge,
  getStatusStyle,
  getStatusText,
} from "@/components/StatusBadge";
import {
  getProgressPercentage,
  getDeadlineProgress,
  getContractStatus,
  getWeeklyFrequency,
  formatDate,
} from "@/lib/utils/contract";
import { Bell, User, FileText, Users, Plus, Info } from "lucide-react";
// import { CommonHeader } from "@/components/CommonHeader";

type ContractItem = ContractListResponse;

export default function MainPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // URL query에서 탭을 읽어오거나 기본값 사용
  const [activeTab, setActiveTab] = useState<"my-contracts" | "supervising">(
    (tabParam === "supervising" ? "supervising" : "my-contracts") as
      | "my-contracts"
      | "supervising"
  );

  const [showFabOptions, setShowFabOptions] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<ContractPreviewResponse | null>(null);
  const [contractDetailsCache, setContractDetailsCache] = useState<
    Map<number, ContractPreviewResponse>
  >(new Map());
  const [myContracts, setMyContracts] = useState<ContractItem[]>([]);
  const [supervisionContracts, setSupervisionContracts] = useState<
    ContractItem[]
  >([]);
  const [loadingMyContracts, setLoadingMyContracts] = useState(true);
  const [loadingSupervision, setLoadingSupervision] = useState(false);
  const [loadingContractPreview, setLoadingContractPreview] = useState(false);
  const [userInfo, setUserInfo] = useState<MyInfoResponse | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // URL query가 변경될 때 activeTab 업데이트
  useEffect(() => {
    const newTab = tabParam === "supervising" ? "supervising" : "my-contracts";
    setActiveTab(newTab);
  }, [tabParam]);

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (tab: "my-contracts" | "supervising") => {
    setActiveTab(tab);
    const newUrl = tab === "supervising" ? "/?tab=supervising" : "/";
    router.push(newUrl);
  };

  useEffect(() => {
    const fetchContracts = async () => {
      setLoadingMyContracts(true);
      setLoadingSupervision(true);
      try {
        // 세 API를 동시에 호출합니다.
        const [myContractsData, supervisionContractsData, userInfoData] =
          await Promise.all([
            getMyContracts("CONTRACTOR"),
            getMyContracts("SUPERVISOR"), // 감독 계약 목록
            getMyInfo(), // 사용자 정보
          ]);

        if (myContractsData.success) {
          setMyContracts(myContractsData.result?.content || []);
        } else {
          setMyContracts([]);
        }

        if (supervisionContractsData.success) {
          const supervisionContracts =
            supervisionContractsData.result?.content || [];
          setSupervisionContracts(supervisionContracts);

          // 감독중인 계약들의 상세 정보를 미리 가져오기
          if (supervisionContracts.length > 0) {
            const contractDetailsPromises = supervisionContracts
              .filter((contract) => contract.contractId)
              .map((contract) => getContractPreview(contract.contractId!));

            try {
              const contractDetailsResults = await Promise.all(
                contractDetailsPromises
              );
              const newCache = new Map<number, ContractPreviewResponse>();

              contractDetailsResults.forEach((result, index) => {
                if (
                  result.success &&
                  result.result &&
                  supervisionContracts[index].contractId
                ) {
                  newCache.set(
                    supervisionContracts[index].contractId!,
                    result.result
                  );
                }
              });

              setContractDetailsCache(newCache);
            } catch (error) {
              console.error("Error fetching contract details:", error);
            }
          }
        } else {
          setSupervisionContracts([]);
        }

        if (userInfoData.success) {
          setUserInfo(userInfoData.result || null);
        }
      } catch (error) {
        console.error("Error fetching contracts:", error);
        setMyContracts([]);
        setSupervisionContracts([]);
      } finally {
        setLoadingMyContracts(false);
        setLoadingSupervision(false);
      }
    };

    fetchContracts();
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count ?? 0);
      } catch (e) {
        setUnreadCount(0);
      }
    };
    fetchUnreadCount();
    // Listen for page visibility changes to refresh unread count
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchUnreadCount();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // 계약서 미리보기 모달 열기
  const handleOpenContractPreview = async (contractId: number) => {
    setLoadingContractPreview(true);
    try {
      // 캐시에서 먼저 확인
      const cachedContract = contractDetailsCache.get(contractId);
      if (cachedContract) {
        setSelectedContract(cachedContract);
        setShowContractModal(true);
        setLoadingContractPreview(false);
        return;
      }

      const response = await getContractPreview(contractId);
      if (response.success && response.result) {
        setSelectedContract(response.result);
        setShowContractModal(true);
        // 캐시에 저장
        setContractDetailsCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(contractId, response.result);
          return newCache;
        });
      } else {
        console.error("Failed to fetch contract preview");
        // TODO: 에러 메시지 표시
      }
    } catch (error) {
      console.error("Error fetching contract preview:", error);
      // TODO: 에러 메시지 표시
    } finally {
      setLoadingContractPreview(false);
    }
  };

  const handleCloseContractModal = () => {
    setShowContractModal(false);
    setSelectedContract(null);
  };

  const isLoading =
    (activeTab === "my-contracts" && loadingMyContracts) ||
    (activeTab === "supervising" && loadingSupervision);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // FAB 관련 요소가 아닌 곳을 클릭했을 때 옵션 닫기
      const target = event.target as Element;
      if (!target.closest("[data-fab-related]")) {
        setShowFabOptions(false);
      }
    };

    if (showFabOptions) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showFabOptions]);

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        {/* 최대 너비 제한 컨테이너 - 중앙정렬 */}
        <div className="container-mobile">
          {/* Header - 예시 코드 스타일 */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.5rem",
              backgroundColor: "var(--surface-color)",
              position: "sticky",
              top: 0,
              zIndex: 10,
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-800">
                {userInfo?.nickname || "프로실천러"}님,
              </span>
              <span className="text-lg text-gray-600">
                오늘도 약속을 지켜보세요!
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <Link
                href="/notifications"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-color-strong)",
                  padding: 0,
                  position: "relative",
                }}
              >
                <Bell size={24} />
                {/* 알림 뱃지 */}
                {unreadCount > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      minWidth: "18px",
                      height: "18px",
                      backgroundColor: "#ef4444",
                      borderRadius: "50%",
                      border: "2px solid var(--surface-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                      zIndex: 1,
                      padding: "0 4px",
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </Link>
              <Link
                href="/profile"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-color-strong)",
                  padding: 0,
                }}
              >
                <User size={24} />
              </Link>
            </div>
          </header>

          {/* Tab Navigation - 예시 코드 스타일 */}
          <nav
            style={{
              display: "flex",
              backgroundColor: "var(--border-color)",
              borderRadius: "0.75rem",
              padding: "0.25rem",
              margin: "1.5rem 1.5rem",
            }}
          >
            <button
              onClick={() => handleTabChange("my-contracts")}
              style={{
                flex: 1,
                padding: "0.625rem",
                fontSize: "0.9375rem",
                fontWeight: 600,
                borderRadius: "0.625rem",
                transition:
                  "background-color 0.3s, color 0.3s, box-shadow 0.3s",
                cursor: "pointer",
                border: "none",
                fontFamily: "inherit",
                backgroundColor:
                  activeTab === "my-contracts"
                    ? "var(--surface-color)"
                    : "transparent",
                color:
                  activeTab === "my-contracts"
                    ? "var(--text-color-primary)"
                    : "var(--text-color-light)",
                boxShadow:
                  activeTab === "my-contracts"
                    ? "0 2px 4px rgba(0, 0, 0, 0.07)"
                    : "none",
              }}
            >
              내 계약
            </button>
            <button
              onClick={() => handleTabChange("supervising")}
              style={{
                flex: 1,
                padding: "0.625rem",
                fontSize: "0.9375rem",
                fontWeight: 600,
                borderRadius: "0.625rem",
                transition:
                  "background-color 0.3s, color 0.3s, box-shadow 0.3s",
                cursor: "pointer",
                border: "none",
                fontFamily: "inherit",
                backgroundColor:
                  activeTab === "supervising"
                    ? "var(--surface-color)"
                    : "transparent",
                color:
                  activeTab === "supervising"
                    ? "var(--text-color-primary)"
                    : "var(--text-color-light)",
                boxShadow:
                  activeTab === "supervising"
                    ? "0 2px 4px rgba(0, 0, 0, 0.07)"
                    : "none",
              }}
            >
              감독중
            </button>
          </nav>

          {/* Content */}
          <main
            style={{
              padding: "0 1.5rem 6rem",
              minHeight: "calc(100vh - 200px)",
            }}
          >
            {/* MSW 테스트 컴포넌트 */}
            <div style={{ marginBottom: "1.5rem" }}></div>

            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "4rem 0",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <LoadingSpinner size="lg" />
                  <p
                    style={{
                      marginTop: "1rem",
                      fontSize: "0.875rem",
                      color: "var(--text-color-light)",
                    }}
                  >
                    계약 목록을 불러오는 중...
                  </p>
                </div>
              </div>
            ) : activeTab === "my-contracts" ? (
              <MyContractsTab contracts={myContracts} router={router} />
            ) : (
              <SupervisingTab
                contracts={supervisionContracts}
                onOpenContractPreview={handleOpenContractPreview}
                loadingContractPreview={loadingContractPreview}
                contractDetailsCache={contractDetailsCache}
                router={router}
              />
            )}
          </main>

          {/* FAB - floating 옵션이 있는 버튼 */}
          {showFabOptions && (
            <div
              style={{
                position: "fixed",
                bottom: "8rem",
                right: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                zIndex: 40,
              }}
              data-fab-related
            >
              <Link
                href="/contracts/create"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "var(--surface-color)",
                  color: "var(--text-color-strong)",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  boxShadow:
                    "0 20px 40px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
                  textDecoration: "none",
                  minWidth: "10rem",
                  border: "2px solid #e7f5ff",
                  transition: "all 0.2s",
                }}
                onClick={() => setShowFabOptions(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e7f5ff";
                  e.currentTarget.style.color = "var(--text-color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--surface-color)";
                  e.currentTarget.style.color = "var(--text-color-strong)";
                }}
              >
                <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  계약서 생성
                </span>
                <FileText size={16} color="var(--primary-color)" />
              </Link>
              <div
                onClick={() => {
                  setShowInviteCodeModal(true);
                  setShowFabOptions(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "var(--surface-color)",
                  color: "var(--text-color-strong)",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  boxShadow:
                    "0 20px 40px rgba(34, 197, 94, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                  minWidth: "10rem",
                  border: "2px solid #dcfce7",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dcfce7";
                  e.currentTarget.style.color = "#22c55e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--surface-color)";
                  e.currentTarget.style.color = "var(--text-color-strong)";
                }}
              >
                <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  초대 받기
                </span>
                <Users size={16} color="#22c55e" />
              </div>
            </div>
          )}

          <button
            onClick={() => setShowFabOptions(!showFabOptions)}
            data-fab-related
            style={{
              position: "fixed",
              bottom: "5rem",
              right: "1.5rem",
              width: "3.5rem",
              height: "3.5rem",
              backgroundColor: showFabOptions
                ? "#ef4444"
                : "var(--primary-color)",
              color: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: showFabOptions
                ? "0 20px 40px rgba(239, 68, 68, 0.4), 0 8px 25px rgba(0, 0, 0, 0.2)"
                : "0 20px 40px rgba(59, 130, 246, 0.4), 0 8px 25px rgba(0, 0, 0, 0.2)",
              border: "2px solid var(--surface-color)",
              transition: "all 0.2s",
              cursor: "pointer",
              zIndex: 50,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Plus
              size={28}
              color="black"
              style={{
                transform: showFabOptions ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
            />
          </button>

          {/* 초대 코드 입력 모달 */}
          <InviteCodeModal
            isOpen={showInviteCodeModal}
            onClose={() => setShowInviteCodeModal(false)}
          />

          {/* 계약서 미리보기 모달 */}
          {selectedContract && (
            <ContractModal
              isOpen={showContractModal}
              onClose={handleCloseContractModal}
              contract={selectedContract}
              showSignature={false}
            />
          )}
        </div>
      </div>
    </>
  );
}

function MyContractsTab({
  contracts,
  router,
}: {
  contracts: ContractItem[] | undefined;
  router: any;
}) {
  // 메인 페이지에서 표시할 계약만 필터링 (COMPLETED, FAILED 제외)
  const filteredContracts = contracts?.filter(
    (contract) =>
      !["COMPLETED", "FAILED"].includes(contract.contractStatus || "")
  );
  const getStatusBadgeStyle = (status: string | undefined) => {
    const statusStyle = getStatusStyle(status || "");
    return {
      backgroundColor: statusStyle.backgroundColor,
      color: statusStyle.color,
    };
  };

  const getStatusBadgeText = (
    status: string | undefined,
    contract: ContractItem
  ) => {
    const now = new Date();
    const startDate = new Date(contract.startDate!);

    // 날짜 기반으로 시작 전 상태 확인
    if ((status === "PENDING" || !status) && now < startDate) {
      return "시작 전";
    }

    return getStatusText(status || "");
  };

  // 필터링된 계약이 없거나 빈 배열인 경우 처리
  if (!filteredContracts || filteredContracts.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem 1rem",
        }}
      >
        <div
          style={{
            width: "4rem",
            height: "4rem",
            margin: "0 auto 1.5rem",
            borderRadius: "1rem",
            background: "linear-gradient(135deg, #e7f5ff 0%, #74c0fc 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FileText size={32} color="var(--primary-color)" strokeWidth={1.5} />
        </div>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "var(--text-color-strong)",
            marginBottom: "0.75rem",
          }}
        >
          진행중인 계약이 없습니다
        </h3>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-color-light)",
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}
        >
          첫 번째 계약을 만들어서
          <br />
          목표 달성 여정을 시작해보세요!
        </p>
        <Link href="/contracts/create">
          <Button variant="dark" size="md">
            첫 계약 만들기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {filteredContracts.map((contract, index) => {
        const progress = getProgressPercentage(contract);
        const status = getContractStatus(contract);
        
        // 단발성 계약의 경우 status에 따라 진행률 계산
        let deadlineProgress = getDeadlineProgress(contract);
        if (contract.oneOff) {
          if (contract.contractStatus === "PENDING") {
            deadlineProgress = 0;
          } else if (contract.contractStatus === "IN_PROGRESS") {
            // IN_PROGRESS 상태에서는 시분초 단위로 정확한 진행률 계산
            const now = new Date();
            const startDate = new Date(contract.startDate!);
            const endDate = new Date(contract.endDate!);
            
            const totalDuration = endDate.getTime() - startDate.getTime();
            const elapsed = now.getTime() - startDate.getTime();
            
            if (totalDuration > 0) {
              deadlineProgress = Math.min(100, Math.round((elapsed / totalDuration) * 100 * 100) / 100);
            }
          }
        }
        
        const [current, total] = contract.achievementRatio
          ?.split("/")
          .map(Number) || [0, 0];

        return (
          <div
            key={contract.contractId}
            onClick={() => router.push(`/contracts/${contract.contractId}`)}
            style={{ cursor: "pointer" }}
          >
            <Card hover padding="lg">
              {/* 계약 정보 헤더 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.5rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--text-color-strong)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {contract.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-color-light)",
                    }}
                  >
                    {formatDate(contract.startDate!)} -{" "}
                    {formatDate(contract.endDate!)}
                  </p>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.375rem 0.75rem",
                    borderRadius: "999px",
                    backgroundColor: getStatusBadgeStyle(
                      contract.contractStatus
                    ).backgroundColor,
                    color: getStatusBadgeStyle(contract.contractStatus).color,
                  }}
                >
                  {getStatusBadgeText(contract.contractStatus, contract)}
                </span>
              </div>

              {/* 단발성 계약 노티스 박스 */}
              {contract.oneOff && contract.contractStatus === "PENDING" && (
                <div
                  style={{
                    backgroundColor: "var(--notice-bg)",
                    color: "var(--notice-color)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "1rem",
                      height: "1rem",
                      borderRadius: "50%",
                      backgroundColor: "var(--notice-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "white" }}>
                      !
                    </span>
                  </div>
                  <span>24시간 내로 감독자가 1명 참여하면 시작됩니다</span>
                </div>
              )}

              {/* 진행률 섹션 */}
              <div style={{ marginTop: "1.5rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ color: "var(--text-color-normal)" }}>
                      달성률
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--text-color-strong)",
                      }}
                    >
                      {current}/{total}회 ({progress}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: "0.5rem",
                      backgroundColor: "var(--border-color)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        backgroundColor: "var(--primary-color)",
                        borderRadius: "999px",
                        width: `${progress}%`,
                        transition: "width 0.5s ease-in-out",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ color: "var(--text-color-normal)" }}>
                      계약 기간
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--text-color-strong)",
                      }}
                    >
                      {deadlineProgress}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "0.5rem",
                      backgroundColor: "var(--border-color)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        backgroundColor: "var(--primary-light-color)",
                        borderRadius: "999px",
                        width: `${deadlineProgress}%`,
                        transition: "width 0.5s ease-in-out",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 보상/벌칙 정보 */}
              {(contract.reward || contract.penalty) && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                  }}
                >
                  {contract.reward && (
                    <p
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#3b82f6" }}>
                        보상:
                      </span>{" "}
                      {contract.reward}
                    </p>
                  )}
                  {contract.penalty && (
                    <p
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#ef4444" }}>
                        벌칙:
                      </span>{" "}
                      {contract.penalty}
                    </p>
                  )}
                </div>
              )}

              {/* 액션 버튼 */}
              <div
                style={{ marginTop: "1.5rem" }}
                onClick={(e) => e.stopPropagation()}
              >
                {contract.contractStatus === "PENDING" ||
                new Date() < new Date(contract.startDate!) ? (
                  // PENDING 상태이거나 시작 전 상태일 때 주의사항과 상세보기 버튼 표시
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.875rem",
                        backgroundColor: "var(--notice-bg)",
                        borderRadius: "0.5rem",
                        color: "var(--notice-color)",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                      }}
                    >
                      <Info size={16} style={{ flexShrink: 0 }} />
                      <span>
                        시작일까지 참여한 감독자가 0명이면 계약이 삭제됩니다.
                      </span>
                    </div>
                    <Link
                      href={`/contracts/${contract.contractId}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button variant="outline" fullWidth size="md">
                        상세보기
                      </Button>
                    </Link>
                  </div>
                ) : contract.todayProofExist ? (
                  // 오늘 인증을 이미 한 경우
                  <Link
                    href={`/contracts/${contract.contractId}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="outline" fullWidth size="md">
                      오늘 인증을 하셨습니다
                    </Button>
                  </Link>
                ) : status.canVerify ? (
                  // 인증 가능한 경우
                  <Link
                    href={`/contracts/${contract.contractId}?action=verify`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant={status.buttonVariant} fullWidth size="md">
                      {status.buttonText}
                    </Button>
                  </Link>
                ) : (
                  // 기본 상세보기
                  <Link
                    href={`/contracts/${contract.contractId}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="outline" fullWidth size="md">
                      상세보기
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

function SupervisingTab({
  contracts,
  onOpenContractPreview,
  loadingContractPreview,
  contractDetailsCache,
  router,
}: {
  contracts: ContractItem[] | undefined;
  onOpenContractPreview: (contractId: number) => Promise<void>;
  loadingContractPreview: boolean;
  contractDetailsCache: Map<number, ContractPreviewResponse>;
  router: any;
}) {
  // 메인 페이지에서 표시할 계약만 필터링 (COMPLETED, FAILED 제외)
  const filteredContracts = contracts?.filter(
    (contract) =>
      !["COMPLETED", "FAILED"].includes(contract.contractStatus || "")
  );

  const getStatusBadgeStyle = (status: string | undefined) => {
    const statusStyle = getStatusStyle(status || "");
    return {
      backgroundColor: statusStyle.backgroundColor,
      color: statusStyle.color,
    };
  };

  const getStatusBadgeText = (
    status: string | undefined,
    contract: ContractItem
  ) => {
    const now = new Date();
    const startDate = new Date(contract.startDate!);

    // 날짜 기반으로 시작 전 상태 확인
    if ((status === "PENDING" || !status) && now < startDate) {
      return "시작 전";
    }

    return getStatusText(status || "");
  };

  if (!filteredContracts || filteredContracts.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem 1rem",
        }}
      >
        <div
          style={{
            width: "4rem",
            height: "4rem",
            margin: "0 auto 1.5rem",
            borderRadius: "1rem",
            background: "linear-gradient(135deg, #dcfce7 0%, #86efac 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Users size={32} color="#22c55e" strokeWidth={1.5} />
        </div>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "var(--text-color-strong)",
            marginBottom: "0.75rem",
          }}
        >
          감독중인 계약이 없습니다
        </h3>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-color-light)",
            lineHeight: 1.6,
          }}
        >
          지인의 초대를 기다려보세요!
          <br />곧 누군가의 목표 달성을 도울 수 있을 거예요.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {filteredContracts.map((contract, index) => {
        const progress = getProgressPercentage(contract);
        
        // 단발성 계약의 경우 status에 따라 진행률 계산
        let deadlineProgress = getDeadlineProgress(contract);
        if (contract.oneOff) {
          if (contract.contractStatus === "PENDING") {
            deadlineProgress = 0;
          } else if (contract.contractStatus === "IN_PROGRESS") {
            // IN_PROGRESS 상태에서는 시분초 단위로 정확한 진행률 계산
            const now = new Date();
            const startDate = new Date(contract.startDate!);
            const endDate = new Date(contract.endDate!);
            
            const totalDuration = endDate.getTime() - startDate.getTime();
            const elapsed = now.getTime() - startDate.getTime();
            
            if (totalDuration > 0) {
              deadlineProgress = Math.min(100, Math.round((elapsed / totalDuration) * 100 * 100) / 100);
            }
          }
        }
        
        const [current, total] = contract.achievementRatio
          ?.split("/")
          .map(Number) || [0, 0];

        return (
          <div
            key={contract.contractId}
            onClick={() => router.push(`/supervise/${contract.contractId}`)}
            style={{ cursor: "pointer" }}
          >
            <Card hover padding="lg">
              {/* 계약 정보 헤더 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.5rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--text-color-strong)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {contract.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-color-light)",
                    }}
                  >
                    {formatDate(contract.startDate!)} -{" "}
                    {formatDate(contract.endDate!)}
                  </p>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.375rem 0.75rem",
                    borderRadius: "999px",
                    backgroundColor: getStatusBadgeStyle(
                      contract.contractStatus
                    ).backgroundColor,
                    color: getStatusBadgeStyle(contract.contractStatus).color,
                  }}
                >
                  {getStatusBadgeText(contract.contractStatus, contract)}
                </span>
              </div>

              {/* 진행률 섹션 */}
              <div style={{ marginTop: "1.5rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ color: "var(--text-color-normal)" }}>
                      달성률
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--text-color-strong)",
                      }}
                    >
                      {current}/{total}회 ({progress}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: "0.5rem",
                      backgroundColor: "var(--border-color)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        backgroundColor: "#22c55e",
                        borderRadius: "999px",
                        width: `${progress}%`,
                        transition: "width 0.5s ease-in-out",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ color: "var(--text-color-normal)" }}>
                      계약 기간
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--text-color-strong)",
                      }}
                    >
                      {deadlineProgress}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "0.5rem",
                      backgroundColor: "var(--border-color)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        backgroundColor: "var(--primary-light-color)",
                        borderRadius: "999px",
                        width: `${deadlineProgress}%`,
                        transition: "width 0.5s ease-in-out",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 보상/벌칙 정보 */}
              {(contract.reward || contract.penalty) && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                  }}
                >
                  {contract.reward && (
                    <p
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#3b82f6" }}>
                        보상:
                      </span>{" "}
                      {contract.reward}
                    </p>
                  )}
                  {contract.penalty && (
                    <p
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#ef4444" }}>
                        벌칙:
                      </span>{" "}
                      {contract.penalty}
                    </p>
                  )}
                </div>
              )}

              {/* 감독자 정보 */}
              {(() => {
                const contractDetail = contractDetailsCache.get(
                  contract.contractId!
                );
                const participants = contractDetail?.participants || [];
                const supervisors = participants.filter(
                  (p) => p.basicInfo?.role === "SUPERVISOR"
                );
                const totalSupervisors = supervisors.length;

                if (totalSupervisors === 0) {
                  return (
                    <div
                      style={{
                        marginTop: "1.5rem",
                        padding: "0.875rem",
                        backgroundColor: "#f0fdf4",
                        borderRadius: "0.5rem",
                        color: "#166534",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Users size={16} />
                      <span>감독자 - 0명</span>
                    </div>
                  );
                }

                // 감독자 이름들을 가져와서 표시
                const supervisorNames = supervisors
                  .map((s) => s.basicInfo?.userName)
                  .filter((name) => name)
                  .slice(0, 2); // 최대 2명까지만 표시

                const otherCount = Math.max(
                  0,
                  totalSupervisors - supervisorNames.length
                );
                const displayText =
                  supervisorNames.length > 0
                    ? `${supervisorNames.join(", ")}${
                        otherCount > 0 ? ` 외 ${otherCount}명` : ""
                      }`
                    : `${totalSupervisors}명`;

                return (
                  <div
                    style={{
                      marginTop: "1.5rem",
                      padding: "0.875rem",
                      backgroundColor: "#f0fdf4",
                      borderRadius: "0.5rem",
                      color: "#166534",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Users size={16} />
                    <span>
                      감독자 - {totalSupervisors}명 ({displayText})
                    </span>
                  </div>
                );
              })()}

              {/* 액션 버튼 */}
              <div
                style={{ marginTop: "1.5rem" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                  }}
                >
                  <div style={{ minWidth: "100px" }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        onOpenContractPreview(contract.contractId!)
                      }
                      disabled={loadingContractPreview}
                    >
                      {loadingContractPreview ? "로딩중..." : "계약서 보기"}
                    </Button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      flex: 1,
                    }}
                  >
                    <Link
                      href={`/supervise/${contract.contractId}/detail`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button variant="outline" fullWidth size="sm">
                        계약 상세
                      </Button>
                    </Link>
                    <Link
                      href={`/supervise/${contract.contractId}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button variant="outline" fullWidth size="sm">
                        인증 확인
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
