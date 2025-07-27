/**
 * 마이페이지
 * - 사용자 정보 표시
 * - 계약 히스토리
 * - 서비스 이용약관
 * - 개인정보처리방침
 * - 로그아웃
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyInfo, updateMyInfo, deleteAccount } from "@/lib/api/users";
import { getMyContracts, getContractHistory } from "@/lib/api/contracts";
import { authService } from "@/lib/auth";
import { Button } from "@/components/ui";
import { ArrowLeft, AlertTriangle, User, FileText, LogOut } from "lucide-react";
import {
  MyInfoResponse,
  ContractListResponse,
} from "../../../docs/data-contracts";
import { useAlert } from "@/components/ui";
import { CommonHeader } from "@/components/CommonHeader";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<MyInfoResponse | null>(null);
  const [allContracts, setAllContracts] = useState<ContractListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { showAlert, AlertComponent } = useAlert();
  const [pendingLogout, setPendingLogout] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getMyInfo();
        if (response.success && response.result) {
          setUser(response.result);

          // 완료된 계약 히스토리만 가져옵니다.
          const [completedContracts, failedContracts] = await Promise.all([
            getContractHistory("SUPERVISOR", undefined, undefined, "COMPLETED"),
            getContractHistory("SUPERVISOR", undefined, undefined, "FAILED"),
          ]);

          const combinedContracts = [
            ...(completedContracts.result?.content || []),
            ...(failedContracts.result?.content || []),
          ];
          setAllContracts(combinedContracts);
        } else {
          throw new Error("사용자 정보를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "사용자 정보 조회에 실패했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    setPendingLogout(true);
    showAlert({
      message: "로그아웃 하시겠습니까?",
      showCancel: true,
      confirmText: "로그아웃",
      cancelText: "취소",
      type: "warning",
      onConfirm: async () => {
        try {
          await authService.logout();
          router.push("/auth");
        } catch (error) {
          console.error("로그아웃 실패:", error);
          await authService.logout();
          router.push("/auth");
        } finally {
          setPendingLogout(false);
        }
      },
      onCancel: () => setPendingLogout(false),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="w-full max-w-[480px] bg-white min-h-screen shadow-lg">
          <div className="py-16 text-center px-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb] mx-auto mb-4"></div>
            <div className="text-[#6b7280] font-medium">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="w-full max-w-[480px] bg-white min-h-screen shadow-lg">
          <div className="py-16 px-6 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-[#1f2937] mb-3">오류 발생</h3>
            <p className="text-sm text-red-600">
              {error || "사용자 정보를 불러올 수 없습니다."}
            </p>
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
          <CommonHeader title="내 프로필" />

          {/* Main Content */}
          <main className="flex-1 px-6 py-6 bg-[#f0f5ff] overflow-y-auto min-h-0">
            <ul className="flex flex-col gap-4">
              {/* 내 정보 */}
              <li className="bg-white rounded-xl shadow-sm transition-transform active:scale-[0.98]">
                <Link
                  href="/profile/info"
                  className="flex items-center gap-3 p-5 text-black font-medium"
                >
                  <span className="w-6 h-6 text-[#6b7280] flex-shrink-0">
                    <User className="w-6 h-6" strokeWidth={1.5} />
                  </span>
                  내 정보
                </Link>
              </li>

              {/* 끝난 계약 히스토리 */}
              <li className="bg-white rounded-xl shadow-sm transition-transform active:scale-[0.98]">
                <Link
                  href="/profile/history"
                  className="flex items-center gap-3 p-5 text-black font-medium"
                >
                  <span className="w-6 h-6 text-[#6b7280] flex-shrink-0">
                    <FileText className="w-6 h-6" strokeWidth={1.5} />
                  </span>
                  끝난 계약 히스토리
                </Link>
              </li>

              {/* 서비스 이용약관 */}
              <li className="bg-white rounded-xl shadow-sm transition-transform active:scale-[0.98]">
                <a
                  href="https://exclusive-pixie-b95.notion.site/23227ad829d080ed9d8ffdd4c2208aae?source=copy_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-5 text-black font-medium"
                >
                  <span className="w-6 h-6 text-[#6b7280] flex-shrink-0">
                    <FileText className="w-6 h-6" strokeWidth={1.5} />
                  </span>
                  서비스 이용약관
                </a>
              </li>

              {/* 개인정보처리방침 */}
              <li className="bg-white rounded-xl shadow-sm transition-transform active:scale-[0.98]">
                <a
                  href="https://exclusive-pixie-b95.notion.site/23227ad829d080bca3c7e90e98e37a0f?source=copy_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-5 text-black font-medium"
                >
                  <span className="w-6 h-6 text-[#6b7280] flex-shrink-0">
                    <FileText className="w-6 h-6" strokeWidth={1.5} />
                  </span>
                  개인정보처리방침
                </a>
              </li>

              {/* 로그아웃 */}
              <li className="bg-white rounded-xl shadow-sm transition-transform active:scale-[0.98]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-5 text-[#ef4444] font-medium"
                >
                  <span className="w-6 h-6 text-[#ef4444] flex-shrink-0">
                    <LogOut className="w-6 h-6" strokeWidth={1.5} />
                  </span>
                  로그아웃
                </button>
              </li>
            </ul>
          </main>
        </div>
      </div>
    </>
  );
}
