import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { registerForPushNotificationsAsync, setupNotificationListeners } from '../utils/pushNotifications';
import * as Notifications from 'expo-notifications';

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

  // 푸시 알림 초기화
  const initializePushNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setFcmToken(token);
        console.log('FCM Token initialized:', token);
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  };

  // 알림 리스너 설정
  useEffect(() => {
    const cleanup = setupNotificationListeners(
      // 알림 수신 시 처리
      (notification) => {
        console.log('Notification received:', notification);
        // 웹뷰에 알림 데이터 전송
        sendMessageToWebView({
          type: 'NOTIFICATION_RECEIVED',
          data: notification
        });
      },
      // 알림 탭 시 처리
      (response) => {
        console.log('Notification response:', response);
        // 웹뷰에 알림 탭 데이터 전송
        sendMessageToWebView({
          type: 'NOTIFICATION_TAPPED',
          data: response
        });
      }
    );

    return cleanup;
  }, []);

  // FCM 토큰 업데이트 함수
  const updateFcmToken = async (token: string): Promise<void> => {
    try {
      setFcmToken(token);
      console.log('FCM token updated:', token);
    } catch (error) {
      console.error('Failed to update FCM token:', error);
    }
  };

  // 웹뷰에 메시지 전송 함수 (WebView 컴포넌트에서 오버라이드됨)
  let sendMessageToWebView = (message: any) => {
    console.log('Sending message to WebView:', message);
    // WebView 컴포넌트에서 postMessage를 통해 실제 전송
  };

  // sendMessageToWebView 함수를 업데이트하는 함수
  const setSendMessageFunction = (fn: (message: any) => void) => {
    sendMessageToWebView = fn;
  };

  // 웹뷰에서 받은 메시지 처리
  const handleWebViewMessage = (message: any) => {
    console.log('Received message from WebView:', message);
    
    switch (message.type) {
      case 'GET_FCM_TOKEN':
        // 웹뷰에서 FCM 토큰 요청
        sendMessageToWebView({
          type: 'FCM_TOKEN_RESPONSE',
          token: fcmToken
        });
        break;
      
      case 'UPDATE_FCM_TOKEN':
        // 웹뷰에서 FCM 토큰 업데이트 요청
        if (message.token) {
          updateFcmToken(message.token);
        }
        break;
      
      default:
        console.log('Unknown message type:', message.type);
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
    throw new Error('useWebView must be used within a WebViewProvider');
  }
  return context;
} 