/**
 * 내 정보 페이지
 * - 사용자 정보 표시 및 수정
 * - 계약 요약
 * - 회원탈퇴
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { getMyInfo, updateMyInfo, deleteAccount } from "@/lib/api/users";
import { getMyContracts, getContractHistory } from "@/lib/api/contracts";
import { authService } from "@/lib/auth";
import {
  MyInfoResponse,
  ContractListResponse,
} from "../../../../docs/data-contracts";
import { useAlert } from "@/components/ui";
import { CommonHeader } from "@/components/CommonHeader";

export default function MyInfoPage() {
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [user, setUser] = useState<MyInfoResponse | null>(null);
  const [allContracts, setAllContracts] = useState<ContractListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getMyInfo();
        if (response.success && response.result) {
          setUser(response.result);
          setNickname(response.result.nickname || "");

          // 모든 계약 상태의 계약을 가져옵니다.
          const [myContracts, completedContracts, failedContracts] =
            await Promise.all([
              getMyContracts("SUPERVISOR"),
              getContractHistory(
                "SUPERVISOR",
                undefined,
                undefined,
                "COMPLETED"
              ),
              getContractHistory("SUPERVISOR", undefined, undefined, "FAILED"),
            ]);

          const combinedContracts = [
            ...(myContracts.result?.content || []),
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

  const handleNicknameEdit = () => {
    setTempNickname(nickname);
    setIsEditingNickname(true);
  };

  const handleNicknameSave = async () => {
    if (tempNickname.trim()) {
      try {
        const response = await updateMyInfo({
          nickname: tempNickname.trim(),
        });
        if (response.success && response.result) {
          setUser(response.result);
          setNickname(response.result.nickname || "");
          setIsEditingNickname(false);
          showAlert({
            message: "닉네임이 변경되었습니다.",
            type: "success",
          });
        } else {
          throw new Error("닉네임 변경에 실패했습니다.");
        }
      } catch (error) {
        showAlert({
          message: "닉네임 변경에 실패했습니다.",
          type: "error",
        });
        console.error(error);
      }
    }
  };

  const handleNicknameCancel = () => {
    setTempNickname("");
    setIsEditingNickname(false);
  };

  const handleWithdraw = async () => {
    try {
      await deleteAccount();
      await authService.logout();
      showAlert({
        message: "회원탈퇴가 완료되었습니다.",
        type: "success",
      });
      router.push("/auth");
    } catch (error) {
      showAlert({
        message: "회원탈퇴 처리 중 오류가 발생했습니다.",
        type: "error",
      });
      console.error(error);
    }
    setShowWithdrawModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="container-mobile">
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
        <div className="container-mobile">
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
          <CommonHeader title="내 정보" />

          {/* Main Content */}
          <main className="flex-1 px-6 py-9">
            {/* 닉네임 카드 */}
            <div className="bg-white px-6 py-5 rounded-2xl shadow-sm mb-6">
              <p className="text-sm text-[#6b7280] mb-3">닉네임</p>
              <div className="flex items-center justify-between">
                {isEditingNickname ? (
                  <div className="flex items-center space-x-3 w-full">
                    <input
                      type="text"
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                      className="flex-1 border border-[#e5e7eb] rounded-lg px-3 py-2 text-lg font-semibold text-[#1f2937] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                      placeholder="닉네임 입력"
                    />
                    <button
                      onClick={handleNicknameSave}
                      className="text-[#2563eb] text-sm font-semibold hover:text-blue-700 px-2 py-1"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleNicknameCancel}
                      className="text-[#6b7280] text-sm font-semibold hover:text-gray-700 px-2 py-1"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <p className="text-lg font-semibold text-[#1f2937]">
                      {nickname}
                    </p>
                    <button
                      onClick={handleNicknameEdit}
                      className="text-[#2563eb] text-sm font-semibold hover:text-blue-700 px-3 py-1 border border-[#2563eb] rounded-lg"
                    >
                      수정
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 연결된 계정 카드 */}
            <div className="bg-white px-6 py-5 rounded-2xl shadow-sm mb-6">
              <p className="text-sm text-[#6b7280] mb-3">연결된 계정</p>
              <div className="flex items-center">
                <div className="w-11 h-11 mr-5 rounded-full bg-[#FFDE00] flex items-center justify-center">
                  <span className="text-[#3C1E1E] font-bold text-sm">K</span>
                </div>
                <span className="text-lg font-semibold text-[#1f2937]">
                  카카오
                </span>
              </div>
            </div>
          </main>

          {/* Footer - 회원 탈퇴 */}
          <footer className="px-6 pb-12 text-center mt-auto">
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="text-[#6b7280] text-sm underline hover:text-[#ef4444] p-2"
            >
              회원 탈퇴
            </button>
          </footer>
        </div>

        {/* 회원 탈퇴 확인 모달 */}
        {showWithdrawModal && (
          <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowWithdrawModal(false);
              }
            }}
          >
            <div className="bg-white p-9 rounded-2xl w-[90%] max-w-[320px] text-center shadow-lg">
              <h2 className="text-base font-semibold text-[#ef4444] mb-5">
                주의
              </h2>
              <p className="text-sm text-[#1f2937] leading-relaxed mb-9">
                정말로 탈퇴하시겠습니까?
                <br />
                진행중인 모든 계약이 중도포기됩니다
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleWithdraw}
                  className="flex-1 py-6 text-base font-semibold rounded-2xl border-none cursor-pointer bg-white text-[#1f2937] border border-[#e5e7eb]"
                >
                  포기할래요...
                </button>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-6 text-base font-semibold rounded-2xl border-none cursor-pointer bg-[#2563eb] text-white"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
