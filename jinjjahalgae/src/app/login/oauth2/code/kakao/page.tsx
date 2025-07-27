/**
 * 카카오 OAuth 콜백 페이지
 * 카카오 로그인 인가 코드를 받아 처리합니다.
 */

import Auth2Redirect from "@/components/Auth2Redirect";
import { CommonHeader } from "@/components/CommonHeader";
import React from "react";

const Page = async () => {
  return (
    <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
      <div className="container-mobile">
        <CommonHeader title="카카오 로그인" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로그인 처리 중...</p>
          </div>
          <Auth2Redirect />
        </div>
      </div>
    </div>
  );
};

export default Page;
