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
import {
  useAlert,
  Modal,
  Button,
  ModalActions,
  ModalSection,
} from "@/components/ui";
import { CommonHeader } from "@/components/CommonHeader";
import { useRetryableApiCall } from "@/lib/utils/retry";

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

  const { executeWithRetry: fetchUserDataWithRetry } = useRetryableApiCall(
    async () => {
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
    },
    {
      maxRetries: 3,
      retryDelay: 100
    }
  );

  const handleFetchUserData = async () => {
    try {
      setLoading(true);
      await fetchUserDataWithRetry();
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

  useEffect(() => {
    handleFetchUserData();
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

  return (
    <>
      <AlertComponent />
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="container-mobile">
          {/* Header */}
          <CommonHeader title="내 정보" />

          {/* Main Content */}
                      <main className="flex-grow px-6 py-9 bg-[#f0f5ff]">
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
          <Modal
            isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
            title="주의"
            headerIcon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            footer={
              <ModalActions>
                <Button variant="outline" fullWidth onClick={handleWithdraw}>
                  포기할래요...
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setShowWithdrawModal(false)}
                >
                  취소
                </Button>
              </ModalActions>
            }
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                정말로 탈퇴하시겠습니까?
                <br />
                진행중인 모든 계약이 중도포기됩니다
              </p>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}
