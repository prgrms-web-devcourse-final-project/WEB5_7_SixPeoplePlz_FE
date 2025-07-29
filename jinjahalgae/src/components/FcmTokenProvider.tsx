"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface FcmTokenContextType {
  fcmToken: string | null;
  isLoading: boolean;
}

const FcmTokenContext = createContext<FcmTokenContextType | undefined>(undefined);

export const FcmTokenProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 네이티브 메시지 핸들러 추가
    const handleNativeMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "FCM_TOKEN_RESPONSE") {
          // window.fcmToken에 저장
          (window as any).fcmToken = message.token;

          // setFcmToken 함수 호출
          if ((window as any).setFcmToken) {
            (window as any).setFcmToken(message.token);
          }
        }
      } catch (error) {
        console.error("Error parsing native message:", error);
      }
    };

    // React Native WebView 메시지 핸들러 추가
    const handleReactNativeMessage = (event: any) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "FCM_TOKEN_RESPONSE") {
          // window.fcmToken에 저장
          (window as any).fcmToken = message.token;

          // setFcmToken 함수 호출
          if ((window as any).setFcmToken) {
            (window as any).setFcmToken(message.token);
          }
        }
      } catch (error) {
        console.error("Error parsing ReactNativeWebView message:", error);
      }
    };

    // 전역 메시지 핸들러 등록 (네이티브 앱의 injectedJavaScript에서 호출됨)
    (window as any).handleNativeMessage = (message: any) => {
      if (message.type === "FCM_TOKEN_RESPONSE") {
        // window.fcmToken에 저장
        (window as any).fcmToken = message.token;

        // setFcmToken 함수 호출
        if ((window as any).setFcmToken) {
          (window as any).setFcmToken(message.token);
        }
      }
    };

    // 메시지 리스너 등록
    window.addEventListener("message", handleNativeMessage);

    async function initializeFcmToken() {
      // 웹뷰 환경인지 확인
      const isWebView =
        typeof window !== "undefined" &&
        ((window as any).ReactNativeWebView ||
          (window as any).NativeAppInterface ||
          window.navigator.userAgent.includes("WebView") ||
          window.navigator.userAgent.includes("wv"));

      if (isWebView) {
        try {
          // 웹뷰에서 FCM 토큰을 받는 함수를 window에 등록
          (window as any).setFcmToken = (token: string | null) => {
            if (isMounted) {
              setFcmToken(token);
              setIsLoading(false);
            }
          };

          // React Native WebView 메시지 리스너 등록
          if ((window as any).ReactNativeWebView) {
            document.addEventListener("message", handleReactNativeMessage);
          }

          // window.fcmToken을 주기적으로 확인하는 함수
          const checkFcmToken = () => {
            const token = (window as any).fcmToken;
            if (token && token !== fcmToken) {
              if (isMounted) {
                setFcmToken(token);
                setIsLoading(false);
              }
            }
          };

          // 초기 확인
          checkFcmToken();

          // 주기적으로 확인 (1초마다, 최대 10초)
          let checkCount = 0;
          const checkInterval = setInterval(() => {
            checkCount++;
            checkFcmToken();

            if (checkCount >= 10 || fcmToken) {
              clearInterval(checkInterval);
              if (isMounted && !fcmToken) {
                setIsLoading(false);
              }
            }
          }, 1000);

          // 웹뷰에 FCM 토큰 요청 (기존 방식 유지)
          if ((window as any).ReactNativeWebView) {
            // React Native WebView
            (window as any).ReactNativeWebView.postMessage(
              JSON.stringify({
                type: "GET_FCM_TOKEN",
              })
            );
          } else if ((window as any).NativeAppInterface) {
            // 기존 네이티브 인터페이스 (fallback)
            (window as any).handleFcmTokenResponse = (token: string | null) => {
              if (isMounted) {
                setFcmToken(token);
                setIsLoading(false);
              }
            };
            (window as any).NativeAppInterface.requestFcmToken();
          } else {
            // 웹뷰 브릿지를 통한 통신 시도
            window.postMessage(
              JSON.stringify({
                type: "GET_FCM_TOKEN",
              }),
              "*"
            );
          }

          return () => {
            clearInterval(checkInterval);
          };
        } catch (e) {
          console.error("Error fetching FCM token:", e);
          if (isMounted) {
            setFcmToken(null);
            setIsLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeFcmToken().then((cleanup) => {
      return () => {
        isMounted = false;
        if (cleanup) cleanup();
      };
    });

    return () => {
      isMounted = false;
      window.removeEventListener("message", handleNativeMessage);
      document.removeEventListener("message", handleReactNativeMessage);
    };
  }, [fcmToken]);

  return (
    <FcmTokenContext.Provider value={{ fcmToken, isLoading }}>
      {children}
    </FcmTokenContext.Provider>
  );
};

export function useFcmToken() {
  const context = useContext(FcmTokenContext);
  if (context === undefined) {
    throw new Error("useFcmToken must be used within a FcmTokenProvider");
  }
  return context;
}
