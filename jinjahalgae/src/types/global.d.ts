// 전역 타입 정의
declare global {
  interface Window {
    NativeAppInterface?: {
      requestFcmToken: () => void;
      updateFcmToken: (token: string) => void;
      sendToNative: (message: any) => void;
    };
    handleFcmTokenResponse?: (token: string | null) => void;
    handleNotificationReceived?: (data: any) => void;
    handleNotificationTapped?: (data: any) => void;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export {}; 