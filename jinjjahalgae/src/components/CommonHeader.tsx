"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

interface CommonHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
}

export const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  rightContent,
}) => {
  const router = useRouter();
  return (
    <header className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-[#e5e7eb] sm:rounded-t-xl">
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => router.back()}
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
    </header>
  );
};
