"use client";

import Script from "next/script";

export default function KakaoScript() {
  return (
    <Script
      src="https://developers.kakao.com/sdk/js/kakao.js"
      strategy="beforeInteractive"
      onLoad={() => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
        }
      }}
    />
  );
}
