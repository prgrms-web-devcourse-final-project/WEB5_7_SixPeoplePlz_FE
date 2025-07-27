// 웹뷰에서 네이티브 앱과 소통하기 위한 TypeScript 인터페이스

// Window 인터페이스 확장
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    handleNativeLoginSuccess?: (data: any) => void;
    handleNativeLoginFailed?: (error: any) => void;
    handleNativeLogoutSuccess?: () => void;
    handleFcmTokenResponse?: (token: string | null) => void;
    handleNotificationReceived?: (data: any) => void;
    handleNotificationTapped?: (data: any) => void;
  }
}

// 메시지 타입 정의
interface NativeMessage {
  type: string;
  [key: string]: any;
}

// 네이티브 앱으로 메시지 전송
function sendToNative(message: NativeMessage): void {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    console.warn('ReactNativeWebView is not available');
  }
}

// 네이티브 앱에서 받은 메시지 처리
function handleNativeMessage(message: NativeMessage): void {
  console.log('Received message from native app:', message);
  
  switch (message.type) {
    case 'FCM_TOKEN_RESPONSE':
      // FCM 토큰 응답 처리
      console.log('FCM token received:', message.token);
      if (window.handleFcmTokenResponse) {
        window.handleFcmTokenResponse(message.token);
      }
      break;
      
    case 'NOTIFICATION_RECEIVED':
      // 알림 수신 처리
      console.log('Notification received:', message.data);
      if (window.handleNotificationReceived) {
        window.handleNotificationReceived(message.data);
      }
      break;
      
    case 'NOTIFICATION_TAPPED':
      // 알림 탭 처리
      console.log('Notification tapped:', message.data);
      if (window.handleNotificationTapped) {
        window.handleNotificationTapped(message.data);
      }
      break;
      
    default:
      console.log('Unknown message type:', message.type);
  }
}

// 네이티브 앱에 FCM 토큰 요청
function requestFcmToken(): void {
  sendToNative({
    type: 'GET_FCM_TOKEN'
  });
}

// 네이티브 앱에 FCM 토큰 업데이트 요청
function updateFcmToken(token: string): void {
  sendToNative({
    type: 'UPDATE_FCM_TOKEN',
    token
  });
}

// 네이티브 앱에서 받은 메시지를 처리하는 이벤트 리스너
document.addEventListener('message', function(event: any) {
  try {
    const message: NativeMessage = JSON.parse(event.data);
    handleNativeMessage(message);
  } catch (error) {
    console.error('Failed to parse native message:', error);
  }
});

// 전역 객체에 함수들 노출
(window as any).NativeAppInterface = {
  requestFcmToken,
  updateFcmToken,
  sendToNative
};

// 콜백 함수들을 위한 전역 핸들러들
window.handleFcmTokenResponse = undefined;
window.handleNotificationReceived = undefined;
window.handleNotificationTapped = undefined;

console.log('Native app interface loaded');

export default `
// 네이티브 앱 인터페이스 코드가 여기에 주입됩니다
${sendToNative.toString()}
${handleNativeMessage.toString()}
${requestFcmToken.toString()}
${updateFcmToken.toString()}

// 이벤트 리스너 설정
document.addEventListener('message', function(event) {
  try {
    const message = JSON.parse(event.data);
    handleNativeMessage(message);
  } catch (error) {
    console.error('Failed to parse native message:', error);
  }
});

// 전역 객체에 함수들 노출
window.NativeAppInterface = {
  requestFcmToken,
  updateFcmToken,
  sendToNative
};

// 콜백 함수들을 위한 전역 핸들러들
window.handleFcmTokenResponse = undefined;
window.handleNotificationReceived = undefined;
window.handleNotificationTapped = undefined;

console.log('Native app interface loaded');
`; 