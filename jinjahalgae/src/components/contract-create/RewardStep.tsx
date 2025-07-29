"use client";

import { Card, Button } from "@/components/ui";
import { Target, AlertTriangle, Plus, Minus, ChevronDown } from "lucide-react";
import type { StepProps } from "@/app/contracts/create/page";
import { useMemo, useState } from "react";
import { useAlert } from "../ui";

export default function RewardStep({
  formData,
  setFormData,
  onNext,
  onPrev,
}: StepProps) {
  const { showAlert, AlertComponent } = useAlert();
  const [timesPerWeek, setTimesPerWeek] = useState(0);

  const durationDays = useMemo(() => {
    if (formData.oneOff) return 1; // 하루 계약은 항상 1일
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days === 0 ? 1 : days + 1;
  }, [formData.oneOff, formData.startDate, formData.endDate]);

  // 주 n회 기준으로 총 횟수 계산 (편의 기능)
  const calculateTotalFromWeekly = (weeklyTimes: number) => {
    if (durationDays === 0) return 1;
    if (weeklyTimes === 0) return 1; // 주-회 선택 시 기본값

    // 기간을 주 단위로 계산 (1~7일=1주, 8~14일=2주, ...)
    const weeks = Math.ceil(durationDays / 7);

    // 주n회 * 주차로 총 횟수 계산
    const calculatedTotal = weeklyTimes * weeks;

    // 계산 결과가 일수를 넘지 않도록 조정
    return Math.min(calculatedTotal, durationDays);
  };

  // 주 n회 선택 시 총 횟수 자동 업데이트
  const handleWeeklyChange = (weekly: number) => {
    setTimesPerWeek(weekly);
    const calculatedTotal = calculateTotalFromWeekly(weekly);
    setFormData((prev) => ({
      ...prev,
      totalProof: Math.min(calculatedTotal, durationDays), // 기간을 넘지 않도록
    }));
  };

  const handleDecrement = () => {
    setFormData((prev) => ({
      ...prev,
      totalProof: Math.max(1, prev.totalProof - 1),
    }));
  };

  const handleIncrement = () => {
    setFormData((prev) => ({
      ...prev,
      totalProof: Math.min(prev.totalProof + 1, durationDays), // 기간을 넘지 않도록
    }));
  };

  // 달성 퍼센트 계산
  const achievementPercentage = useMemo(() => {
    if (durationDays === 0) return 0;
    return Math.round((formData.totalProof / durationDays) * 100);
  }, [formData.totalProof, durationDays]);

  const isNextButtonDisabled = useMemo(() => {
    return formData.reward.trim() === "" && formData.penalty.trim() === "";
  }, [formData.reward, formData.penalty]);

  const handleNext = () => {
    if (!formData.reward && !formData.penalty) {
      showAlert({
        message: "성공 보상 또는 실패 벌칙 중 하나는 반드시 입력해주세요.",
        type: "warning",
      });
      return;
    }
    onNext();
  };

  return (
    <>
      <AlertComponent />
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
        {/* 수행 횟수 섹션 - 장기 계약에만 표시 */}
        {!formData.oneOff && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className="text-[var(--warning-color)]"
                  size={20}
                />
                <h2 className="text-lg font-bold text-gray-800">수행 횟수</h2>
              </div>
              <div className="relative">
                <select
                  value={timesPerWeek}
                  onChange={(e) => handleWeeklyChange(Number(e.target.value))}
                  className="appearance-none bg-gray-100 border-2 border-transparent text-gray-800 font-bold py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--primary-color)] focus:bg-white transition-all"
                  disabled={formData.oneOff}
                >
                  <option value={0}>주-회</option>
                  {[...Array(7).keys()].map((i) => (
                    <option key={i + 1} value={i + 1}>
                      주 {i + 1}회
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
            <p className="text-sm text-[var(--text-color-light)] mb-5">
              몇 번 수행해야 성공인지 설정해주세요
            </p>

            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2">
              <button
                onClick={handleDecrement}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-gray-500 rounded-full hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formData.oneOff}
              >
                <Minus size={20} />
              </button>
              <span className="text-4xl font-extrabold text-[var(--primary-color)]">
                {formData.totalProof}
              </span>
              <button
                onClick={handleIncrement}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-gray-500 rounded-full hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formData.oneOff}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        )}

        {/* 정보 박스 */}
        <div className="text-center bg-[var(--success-bg)] text-[var(--success-color)] text-sm font-semibold p-4 rounded-xl mb-8 border border-green-200">
          총 <span className="font-bold">{durationDays}일</span> 동안{" "}
          <span className="font-bold">{formData.totalProof}회</span> 수행 필요
          <br />
          최소 {achievementPercentage}% 달성해야 합니다.
        </div>

        {/* 보상 및 벌칙 */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="reward"
              className="block text-base font-bold text-gray-800 mb-2"
            >
              성공 시 보상
            </label>
            <div className="relative">
              <textarea
                id="reward"
                value={formData.reward}
                onChange={(e) =>
                  setFormData({ ...formData, reward: e.target.value })
                }
                maxLength={50}
                rows={3}
                placeholder="예시) OOO이 ㅁㅁㅁ에게 기프티콘을 사준다"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-offset-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] focus:bg-white resize-none transition-all"
              />
              <span className="absolute right-4 bottom-3 text-sm text-gray-400">
                {formData.reward.length}/50
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="penalty"
              className="block text-base font-bold text-gray-800 mb-2"
            >
              실패 시 벌칙
            </label>
            <div className="relative">
              <textarea
                id="penalty"
                value={formData.penalty}
                onChange={(e) =>
                  setFormData({ ...formData, penalty: e.target.value })
                }
                maxLength={50}
                rows={3}
                placeholder="예시) 피시방 한달 금지"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-offset-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] focus:bg-white resize-none transition-all"
              />
              <span className="absolute right-4 bottom-3 text-sm text-gray-400">
                {formData.penalty.length}/50
              </span>
            </div>
          </div>
        </div>

        {/* 경고 메시지 */}
        {isNextButtonDisabled && (
          <div className="flex items-center text-[var(--notice-color)] bg-[var(--notice-bg)] text-sm font-semibold mt-6 p-3 rounded-lg border border-red-200">
            <AlertTriangle size={20} className="mr-2.5 flex-shrink-0" />
            <span>
              성공 시 보상 또는 실패 시 벌칙 중 하나는 꼭 입력해야 해요!
            </span>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            size="md"
            onClick={onPrev}
            className="flex-1"
          >
            이전
          </Button>
          <Button
            disabled={isNextButtonDisabled}
            className="w-full bg-[var(--primary-color)] font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1"
            onClick={handleNext}
          >
            계약서 미리보기
          </Button>
        </div>
      </div>
    </>
  );
}
