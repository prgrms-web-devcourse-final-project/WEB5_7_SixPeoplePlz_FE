import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isoStringToKoreanDateString } from "@/lib/utils/date";

interface ProofCalendarProps {
  verifications: { [date: string]: any[] } | any[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const COLORS = {
  green: "#16a34a",
  red: "#ef4444",
  yellow: "#facc15",
  grayText: "#6b7280",
};

const ProofCalendar: React.FC<ProofCalendarProps> = ({
  verifications,
  selectedDate,
  onDateSelect,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  useEffect(() => {
    setCurrentMonthDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
  }, [selectedDate]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // verifications가 배열이면 날짜별로 map으로 변환
  const verificationsMap: { [date: string]: any[] } = Array.isArray(
    verifications
  )
    ? verifications.reduce((acc, v) => {
        if (v.date) {
          if (!acc[v.date]) acc[v.date] = [];
          acc[v.date].push(v);
        }
        return acc;
      }, {} as { [date: string]: any[] })
    : verifications;

  const isSameDay = (d1: Date, d2: Date) =>
    d1 &&
    d2 &&
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getStatusForDate = (date: Date) => {
    const dateString = isoStringToKoreanDateString(date.toISOString());
    const dayVerifications = verificationsMap[dateString] || [];
    // 상태 우선순위: 재인증 승인 > 승인 > 거절 > 대기
    const hasApprovedReProof = dayVerifications.some(
      (v) => v.isReProof && v.status === "APPROVED"
    );
    const hasAnyApproved = dayVerifications.some(
      (v) => v.status === "APPROVED"
    );
    const hasAnyRejected = dayVerifications.some(
      (v) => v.status === "REJECTED"
    );
    const hasAnyPending = dayVerifications.some(
      (v) => v.status === "APPROVE_PENDING"
    );
    let status: string | null = null;
    if (hasApprovedReProof) status = "APPROVED";
    else if (hasAnyApproved) status = "APPROVED";
    else if (hasAnyRejected) status = "REJECTED";
    else if (hasAnyPending) status = "APPROVE_PENDING";
    return status;
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 h-14"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(year, month, day);
      const status = getStatusForDate(fullDate);
      const isSelected = isSameDay(fullDate, selectedDate);
      days.push(
        <div
          key={day}
          className="py-1 flex flex-col items-center justify-start cursor-pointer h-14"
          onClick={() => onDateSelect(fullDate)}
        >
          <span
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
              isSelected
                ? "bg-blue-600 text-white font-bold"
                : "hover:bg-gray-100"
            }`}
          >
            {day}
          </span>
          <div className="mt-1 w-1.5 h-1.5">
            {status === "APPROVED" ? (
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: COLORS.green }}
              ></div>
            ) : status === "REJECTED" ? (
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: COLORS.red }}
              ></div>
            ) : status === "APPROVE_PENDING" ? (
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: COLORS.yellow }}
              ></div>
            ) : null}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
          className="p-2"
          aria-label="이전 달"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-base font-bold">{`${year}년 ${month + 1}월`}</h3>
        <button
          onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
          className="p-2"
          aria-label="다음 달"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div
        className="grid grid-cols-7 text-center text-sm"
        style={{ color: COLORS.grayText }}
      >
        {daysOfWeek.map((day) => (
          <div key={day} className="font-semibold mb-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-sm">{renderDays()}</div>
    </div>
  );
};

export default ProofCalendar;
