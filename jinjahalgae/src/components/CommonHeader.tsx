"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface CommonHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
  tabs?: Tab[];
  onBack?: () => void; // 커스텀 뒤로가기 핸들러 추가
}

export const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  rightContent,
  tabs,
  onBack,
}) => {
  const router = useRouter();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };
  
  return (
    <header className="sticky top-0 bg-white z-10 border-b border-[#e5e7eb] sm:rounded-t-xl">
      {/* Top section with title and navigation */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={handleBack}
            aria-label="뒤로가기"
          >
            <ArrowLeft size={24} />
          </button>
          <Link href="/">
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="홈으로"
            >
              <Home size={24} />
            </button>
          </Link>
        </div>
        <h1 className="text-lg font-bold text-center flex-1 truncate">{title}</h1>
        <div className="flex items-center min-w-[40px] justify-end">
          {rightContent}
        </div>
      </div>
      
      {/* Tabs section */}
      {tabs && tabs.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex bg-white p-1 rounded-lg border border-[#e5e7eb]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={tab.onClick}
                className={`flex-1 py-2.5 font-bold rounded-md transition-all duration-300 ${
                  tab.active ? "shadow" : ""
                }`}
                style={{
                  color: tab.active ? "white" : "#2563eb",
                  backgroundColor: tab.active ? "#2563eb" : "white",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
