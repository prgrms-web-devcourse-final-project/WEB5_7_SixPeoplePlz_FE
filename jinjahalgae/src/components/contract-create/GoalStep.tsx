"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Info } from "lucide-react";
import type { StepProps } from "@/app/contracts/create/page";
import { useAlert } from "../ui";

export default function GoalStep({ formData, setFormData, onNext }: StepProps) {
  const { showAlert, AlertComponent } = useAlert();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectionStep, setSelectionStep] = useState<"start" | "end">("start");

  // Calendar constants
  const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

  // Date helper functions
  const formatDateToString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isSameDay = (a: Date | null, b: Date | null) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const isBefore = (a: Date | null, b: Date | null) => {
    if (!a || !b) return false;
    const dateA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const dateB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return dateA < dateB;
  };

  useEffect(() => {
    if (formData.oneOff) {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setTime(today.getTime() + 24 * 60 * 60 * 1000); // 정확히 24시간 후

      setFormData((prev) => ({
        ...prev,
        startDate: formatDateToString(today),
        endDate: formatDateToString(endDate), // 단발성 계약은 시작일 + 24시간
        totalProof: 1,
      }));
    }
  }, [formData.oneOff, setFormData]);

  const startDate = formData.startDate ? new Date(formData.startDate) : null;
  const endDate = formData.endDate ? new Date(formData.endDate) : null;

  // Calendar generation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const days = Array(firstDayOfMonth).fill(null);
    for (let i = 1; i <= lastDateOfMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate]);

  // Day className logic
  const getDayClassName = (day: number | null) => {
    if (!day) return "bg-transparent";

    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const today = new Date();
    let classes =
      "w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors duration-200";

    if (isBefore(date, today) || isSameDay(date, today)) {
      return classes + " text-gray-300 cursor-not-allowed bg-gray-50";
    }

    const isSelectedStart = isSameDay(date, startDate);
    const isSelectedEnd = isSameDay(date, endDate);
    const isInRange = (() => {
      if (!startDate) return false;
      if (endDate) return date >= startDate && date <= endDate;
      if (selectionStep === "end") return date >= startDate;
      return false;
    })();

    if (isSelectedStart || isSelectedEnd) {
      classes += " bg-[var(--primary-color)] text-white font-bold";
    } else if (isInRange) {
      classes +=
        " bg-[var(--primary-bg-color)] text-[var(--primary-color)] font-medium border border-[var(--primary-color)]";
    } else {
      classes +=
        " hover:bg-[var(--primary-bg-color)] text-[var(--text-color-strong)] font-medium hover:text-[var(--primary-color)] hover:border hover:border-[var(--primary-light-color)]";
    }

    return classes;
  };

  const changeMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const today = new Date();

    if (isBefore(clickedDate, today) || isSameDay(clickedDate, today)) {
      return;
    }

    if (selectionStep === "start" || (startDate && endDate)) {
      setFormData({
        ...formData,
        startDate: formatDateToString(clickedDate),
        endDate: "",
      });
      setSelectionStep("end");
    } else {
      if (startDate && !isBefore(clickedDate, startDate)) {
        setFormData({
          ...formData,
          endDate: formatDateToString(clickedDate),
        });
        setSelectionStep("start");
      } else if (startDate && isBefore(clickedDate, startDate)) {
        setFormData({
          ...formData,
          startDate: formatDateToString(clickedDate),
          endDate: "",
        });
        setSelectionStep("end");
      }
    }
  };

  const handleNext = () => {
    if (!formData.title || !formData.goal) {
      showAlert({
        message: "목표 제목과 설명을 입력해주세요.",
        type: "warning",
      });
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      showAlert({
        message: "계약 기간을 설정해주세요.",
        type: "warning",
      });
      return;
    }
    onNext();
  };

  return (
    <>
      <AlertComponent />
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <CalendarDays className="text-[var(--primary-color)]" size={28} />
          <div>
            <h2 className="text-xl font-bold text-[var(--text-color-strong)]">
              계약서 설정
            </h2>
            <p className="text-sm text-[var(--text-color-light)]">
              계약서를 구체적으로 설정해주세요
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="contract-title"
            className="block text-base font-bold text-gray-800 mb-2"
          >
            계약서 제목
          </label>
          <div className="relative">
            <input
              type="text"
              id="contract-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              maxLength={15}
              placeholder="예: 매일 운동하기"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              {formData.title.length}/15
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="contract-goal"
            className="block text-base font-bold text-gray-800 mb-2"
          >
            상세 목표
          </label>
          <div className="relative">
            <textarea
              id="contract-goal"
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value })
              }
              maxLength={50}
              rows={3}
              placeholder="예: 한강 달리기 1시간 아니면 근력운동 30분 하기"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] resize-none transition"
            />
            <span className="absolute right-4 bottom-3 text-sm text-gray-400">
              {formData.goal.length}/50
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-x-6 mb-4">
          <label className="flex items-center gap-x-2 cursor-pointer">
            <input
              type="radio"
              name="contractType"
              value="long-term"
              checked={!formData.oneOff}
              onChange={() => setFormData({ ...formData, oneOff: false })}
              className="w-5 h-5 custom-radio appearance-none border-2 border-gray-300 rounded-full transition"
            />
            <span className="text-base font-medium text-gray-700">
              장기 계약
            </span>
          </label>
          <label className="flex items-center gap-x-2 cursor-pointer">
            <input
              type="radio"
              name="contractType"
              value="daily"
              checked={formData.oneOff}
              onChange={() => setFormData({ ...formData, oneOff: true })}
              className="w-5 h-5 custom-radio appearance-none border-2 border-gray-300 rounded-full transition"
            />
            <span className="text-base font-medium text-gray-700">
              하루 계약
            </span>
          </label>
        </div>

        {formData.oneOff && (
          <div className="flex items-center justify-center bg-[var(--notice-bg)] text-[var(--notice-color)] text-sm font-bold p-2.5 rounded-lg mb-6">
            <Info size={16} className="mr-1.5 flex-shrink-0" />
            <span>1명의 감독자가 서명을 하면 계약이 바로 시작됩니다!</span>
          </div>
        )}

        {!formData.oneOff && (
          <div>
            <h3 className="text-base font-bold text-[var(--text-color-strong)]">
              계약 기간 설정
            </h3>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 rounded-full hover:bg-gray-100 text-[var(--text-color-normal)]"
                >
                  <ChevronLeft size={24} />
                </button>
                <h3 className="text-lg font-bold text-[var(--text-color-strong)]">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h3>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 rounded-full hover:bg-gray-100 text-[var(--text-color-normal)]"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-y-2 text-center text-sm text-[var(--text-color-light)] mb-2">
                {WEEK_DAYS.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {calendarDays.map((day, index) => (
                  <div key={index} className="flex justify-center items-center">
                    {day ? (
                      <button
                        onClick={() => handleDayClick(day)}
                        className={getDayClassName(day)}
                      >
                        {day}
                      </button>
                    ) : (
                      <div className="w-10 h-10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 text-center text-[var(--text-color-normal)] font-medium">
              기간: {startDate ? startDate.toLocaleDateString() : ""} ~{" "}
              {endDate ? endDate.toLocaleDateString() : ""}
            </div>
            <div className="flex items-center justify-center bg-[var(--notice-bg)] text-[var(--notice-color)] text-sm font-bold p-2.5 rounded-lg my-6">
              <Info size={16} className="mr-1.5 flex-shrink-0" />
              <span>계약은 시작일 0시에 자동으로 시작됩니다!</span>
            </div>
          </div>
        )}

        <div className="bg-[var(--primary-bg-color)] text-center p-4 rounded-xl">
          <p className="text-base font-bold text-[var(--text-color-primary)] mb-1">
            계약 수행 기간
          </p>
          <p className="text-4xl font-extrabold text-[var(--primary-color)]">
            {formData.oneOff
              ? 1
              : endDate && startDate
              ? Math.ceil(
                  (endDate.getTime() - startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1
              : 0}
            <span className="text-2xl font-bold ml-1">일</span>
          </p>
        </div>

        <div className="mt-6">
          <button
            className="w-full bg-[var(--primary-color)] text-white font-bold py-3.5 px-4 rounded-xl hover:opacity-90 transition-opacity"
            onClick={handleNext}
          >
            다음으로
          </button>
        </div>
      </div>
    </>
  );
}
