/**
 * 루트 레이아웃
 * - 전역 스타일 적용
 * - 메타데이터 설정
 * - 폰트 설정
 * - 테마 프로바이더
 * - 하단 네비게이션 추가
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/calendar.css";
import AuthWrapper from "@/components/AuthWrapper";
import { ThemeProvider } from "@/styles/ThemeProvider";
import Script from "next/script";
import KakaoScript from "@/components/KakaoScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "진짜할게 - 계약 기반 목표 달성 앱",
  description:
    "지인들의 감시와 패널티로 목표를 확실히 달성하는 계약 기반 목표 달성 서비스",
  keywords: ["목표달성", "계약", "감독", "인증", "동기부여"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 모바일에서 확대/축소 방지
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1d4ed8" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="preload"
          href="https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-02@1.0/Shilla_CultureB-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fastly.jsdelivr.net/gh/projectnoonnu/2408@1.0/YoonChildfundkoreaManSeh.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2202@1.0/SangSangYoungestDaughter.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <KakaoScript />
        <ThemeProvider defaultTheme="light">
          <AuthWrapper>
            <div className="min-h-full bg-white">{children}</div>
          </AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
