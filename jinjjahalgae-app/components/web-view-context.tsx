import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from "../utils/pushNotifications";

// 웹뷰 컨텍스트 타입
interface WebViewContextType {
  // FCM 토큰
  fcmToken: string | null;
  // 웹뷰에 메시지 전송 함수
  sendMessageToWebView: (message: any) => void;
  // 웹뷰에서 받은 메시지 처리 함수
  handleWebViewMessage: (message: any) => void;
  // sendMessageToWebView 함수를 업데이트하는 함수
  setSendMessageFunction: (fn: (message: any) => void) => void;
}

// 웹뷰 컨텍스트 생성
const WebViewContext = createContext<WebViewContextType | undefined>(undefined);

// 웹뷰 컨텍스트 프로바이더 props
interface WebViewProviderProps {
  children: ReactNode;
}

// 웹뷰 컨텍스트 프로바이더
export function WebViewProvider({ children }: WebViewProviderProps) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // FCM 토큰 초기화
  useEffect(() => {
    initializePushNotifications();
  }, []);

  // FCM 토큰이 업데이트되면 웹뷰에 알림
  useEffect(() => {
    if (fcmToken) {
      console.log("FCM token updated in context, notifying WebView:", fcmToken);
      // 토큰이 객체인 경우 문자열만 추출
      let tokenString = fcmToken;
      if (
        typeof fcmToken === "object" &&
        fcmToken !== null &&
        "fcmToken" in fcmToken
      ) {
        tokenString = (fcmToken as any).fcmToken;
      }
      // sendMessageToWebView가 설정된 후에만 호출
      setTimeout(() => {
        sendMessageToWebView({
          type: "FCM_TOKEN_RESPONSE",
          token: tokenString,
        });
      }, 100);
    }
  }, [fcmToken]);

  // 푸시 알림 초기화
  const initializePushNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setFcmToken(token);
        console.log("FCM Token initialized:", token);
      }
    } catch (error) {
      console.error("Failed to initialize push notifications:", error);
    }
  };

  // 알림 리스너 설정
  useEffect(() => {
    const cleanup = setupNotificationListeners(
      // 알림 수신 시 처리
      (notification) => {
        console.log("Notification received:", notification);
        // 웹뷰에 알림 데이터 전송
        sendMessageToWebView({
          type: "NOTIFICATION_RECEIVED",
          data: notification,
        });
      },
      // 알림 탭 시 처리
      (response) => {
        console.log("Notification response:", response);
        // 웹뷰에 알림 탭 데이터 전송
        sendMessageToWebView({
          type: "NOTIFICATION_TAPPED",
          data: response,
        });
      }
    );

    return cleanup;
  }, []);

  // FCM 토큰 업데이트 함수
  const updateFcmToken = async (token: string): Promise<void> => {
    try {
      setFcmToken(token);
      console.log("FCM token updated:", token);
    } catch (error) {
      console.error("Failed to update FCM token:", error);
    }
  };

  // 웹뷰에 메시지 전송 함수 (WebView 컴포넌트에서 오버라이드됨)
  let sendMessageToWebView = (message: any) => {
    console.log("Sending message to WebView:", message);
    // WebView 컴포넌트에서 postMessage를 통해 실제 전송
  };

  // sendMessageToWebView 함수를 업데이트하는 함수
  const setSendMessageFunction = (fn: (message: any) => void) => {
    sendMessageToWebView = fn;
  };

  // 웹뷰에서 받은 메시지 처리
  const handleWebViewMessage = (message: any) => {
    console.log("Received message from WebView:", message);

    switch (message.type) {
      case "GET_FCM_TOKEN":
        // 웹뷰에서 FCM 토큰 요청
        console.log("FCM token requested, current token:", fcmToken);
        // 토큰이 객체인 경우 문자열만 추출
        let tokenString = fcmToken;
        if (
          typeof fcmToken === "object" &&
          fcmToken !== null &&
          "fcmToken" in fcmToken
        ) {
          tokenString = (fcmToken as any).fcmToken;
        }
        sendMessageToWebView({
          type: "FCM_TOKEN_RESPONSE",
          token: tokenString,
        });
        break;

      case "UPDATE_FCM_TOKEN":
        // 웹뷰에서 FCM 토큰 업데이트 요청
        if (message.token) {
          updateFcmToken(message.token);
        }
        break;

      case "DOWNLOAD_FILE":
        // 파일 다운로드 요청: 실제 저장은 WebView 래퍼에서 처리
        // 필요시 상태/콜백 추가 가능
        console.log("DOWNLOAD_FILE 요청 수신 (실제 저장은 WebView에서 처리)");
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  };

  const contextValue: WebViewContextType = {
    fcmToken,
    sendMessageToWebView,
    handleWebViewMessage,
    setSendMessageFunction,
  };

  return (
    <WebViewContext.Provider value={contextValue}>
      {children}
    </WebViewContext.Provider>
  );
}

// 웹뷰 컨텍스트 사용 훅
export function useWebView() {
  const context = useContext(WebViewContext);
  if (context === undefined) {
    throw new Error("useWebView must be used within a WebViewProvider");
  }
  return context;
}
