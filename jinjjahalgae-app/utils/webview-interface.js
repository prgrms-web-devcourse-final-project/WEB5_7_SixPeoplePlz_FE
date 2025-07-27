// 웹뷰에서 네이티브 앱과 소통하기 위한 JavaScript 인터페이스

// 네이티브 앱으로 메시지 전송
function sendToNative(message) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    console.warn("ReactNativeWebView is not available");
  }
}

// 네이티브 앱에서 받은 메시지 처리
function handleNativeMessage(message) {
  console.log("Received message from native app:", message);

  switch (message.type) {
    case "LOGIN_SUCCESS":
      // 로그인 성공 처리
      console.log("Login successful:", message.data);
      // 웹앱의 로그인 상태 업데이트
      if (window.handleNativeLoginSuccess) {
        window.handleNativeLoginSuccess(message.data);
      }
      break;

    case "LOGIN_FAILED":
      // 로그인 실패 처리
      console.log("Login failed:", message.error);
      if (window.handleNativeLoginFailed) {
        window.handleNativeLoginFailed(message.error);
      }
      break;

    case "LOGOUT_SUCCESS":
      // 로그아웃 성공 처리
      console.log("Logout successful");
      if (window.handleNativeLogoutSuccess) {
        window.handleNativeLogoutSuccess();
      }
      break;

    case "FCM_TOKEN_RESPONSE":
      // FCM 토큰 응답 처리
      console.log("FCM token received:", message.token);
      if (window.handleFcmTokenResponse) {
        window.handleFcmTokenResponse(message.token);
      }
      break;

    case "NOTIFICATION_RECEIVED":
      // 알림 수신 처리
      console.log("Notification received:", message.data);
      if (window.handleNotificationReceived) {
        window.handleNotificationReceived(message.data);
      }
      break;

    case "NOTIFICATION_TAPPED":
      // 알림 탭 처리
      console.log("Notification tapped:", message.data);
      if (window.handleNotificationTapped) {
        window.handleNotificationTapped(message.data);
      }
      break;

    default:
      console.log("Unknown message type:", message.type);
  }
}

// 네이티브 앱에 로그인 요청
function requestLogin(provider, accessToken) {
  sendToNative({
    type: "LOGIN_REQUEST",
    provider,
    accessToken,
  });
}

// 네이티브 앱에 로그아웃 요청
function requestLogout() {
  sendToNative({
    type: "LOGOUT_REQUEST",
  });
}

// 네이티브 앱에 FCM 토큰 요청
function requestFcmToken() {
  sendToNative({
    type: "GET_FCM_TOKEN",
  });
}

// 네이티브 앱에 FCM 토큰 업데이트 요청
function updateFcmToken(token) {
  sendToNative({
    type: "UPDATE_FCM_TOKEN",
    token,
  });
}

// 네이티브 앱에서 받은 메시지를 처리하는 이벤트 리스너
document.addEventListener("message", function (event) {
  try {
    const message = JSON.parse(event.data);
    handleNativeMessage(message);
  } catch (error) {
    console.error("Failed to parse native message:", error);
  }
});

// 전역 객체에 함수들 노출
window.NativeAppInterface = {
  requestLogin,
  requestLogout,
  requestFcmToken,
  updateFcmToken,
  sendToNative,
};

// 콜백 함수들을 위한 전역 핸들러들
window.handleNativeLoginSuccess = null;
window.handleNativeLoginFailed = null;
window.handleNativeLogoutSuccess = null;
window.handleFcmTokenResponse = null;
window.handleNotificationReceived = null;
window.handleNotificationTapped = null;

console.log("Native app interface loaded");
