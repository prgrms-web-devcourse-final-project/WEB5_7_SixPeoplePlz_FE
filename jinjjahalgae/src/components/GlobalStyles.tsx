"use client";

import { useEffect } from "react";

// 전역 스타일 및 폰트 적용 컴포넌트
export const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css');
      
      :root {
        --primary-color: #2563eb;
        --primary-light-color: #93c5fd;
        --primary-bg-color: #dbeafe;
        --text-color-strong: #1f2937;
        --text-color-normal: #4b5563;
        --text-color-light: #6b7280;
        --text-color-primary: #2563eb;
        --surface-color: #ffffff;
        --border-color: #e5e7eb;
        --status-waiting-bg: #f1f3f5;
        --status-waiting-text: #868e96;
        --button-dark-bg: #343a40;
        --notice-color: #ef4444;
        --notice-bg: #fee2e2;
        --success-color: #16a34a;
        --success-bg: #eafdf0;
        --warning-color: #facc15;
        --warning-bg: #fef3c7;
      }
      
      body {
        background-color: #f0f5ff;
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
        margin: 0;
        padding: 0;
      }

 
      /* Custom radio button styles */
      .custom-radio {
        flex-shrink: 0;
      }
      
      .custom-radio:checked {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
        position: relative;
      }
      
      .custom-radio:checked::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 4px;
        height: 4px;
        background-color: white;
        border-radius: 50%;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return null;
};
