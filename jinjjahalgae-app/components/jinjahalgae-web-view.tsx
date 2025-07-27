import { useNavigationState } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import { useToast } from "expo-toast";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, Linking } from "react-native";
import { WebView, WebViewNavigation, WebViewProps } from "react-native-webview";
import { useWebView } from "./web-view-context";

const BASE_URL = "https://jinjjahalgae.vercel.app";

interface Props extends WebViewProps {
  path?: string;
}

type WebViewEvent = {
  type: string;
  payload: any;
};

export default function JinjahalgaeWebView({ path = "/", ...props }: Props) {
  const {
    handleWebViewMessage,
    sendMessageToWebView,
    setSendMessageFunction,
    fcmToken,
  } = useWebView();

  const webViewRef = React.useRef<WebView | null>(null);
  const router = useRouter();
  const toast = useToast();
  const [backPressCount, setBackPressCount] = useState(0);

  const onMessage = (event: any) => {
    const { data } = event.nativeEvent;

    try {
      const parsedData = JSON.parse(data) as WebViewEvent;
      console.log("Received message from WebView:", parsedData);

      // 웹뷰 컨텍스트로 메시지 전달
      handleWebViewMessage(parsedData);

      // 기존 로직 유지
      switch (parsedData.type) {
        case "subscribe":
          console.log("subscribe");
          // Handle subscribe event here
          break;
      }
    } catch (error) {
      console.error("Failed to parse WebView message:", error);
    }
  };

  const [canGoBackInWebview, setCanGoBackInWebview] = useState(false);
  const canGoBackNative = useNavigationState(
    (state) => state.routes.length > 1
  );

  // 웹뷰가 로드될 때마다 '뒤로갈 수 있는지' 상태 추적
  const handleNavigationStateChange = (navState: any) => {
    setCanGoBackInWebview(navState.canGoBack);
  };

  // Android 하드웨어 뒤로가기 로직
  useFocusEffect(
    useCallback(() => {
      let backPressTimer: number | null = null;
      const onBackPress = () => {
        if (canGoBackInWebview && canGoBackNative && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        } else {
          if (backPressCount === 0) {
            setBackPressCount(1);
            toast.show("한 번 더 뒤로가기를 누르면 앱이 종료됩니다.");
            backPressTimer = setTimeout(() => {
              setBackPressCount(0);
            }, 2000);
            return true;
          } else {
            BackHandler.exitApp();
            return true;
          }
        }
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => {
        subscription.remove();
        if (backPressTimer) clearTimeout(backPressTimer);
      };
    }, [canGoBackInWebview, canGoBackNative, router, backPressCount, toast])
  );

  // 웹뷰에 메시지 전송 함수
  const sendMessageToWebViewLocal = (message: any) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  // 웹뷰 컨텍스트의 sendMessageToWebView를 실제 구현으로 연결
  useEffect(() => {
    setSendMessageFunction(sendMessageToWebViewLocal);
  }, [setSendMessageFunction]);

  const onShouldStartLoadWithRequest = (request: WebViewNavigation) => {
    const url = request.url || "";

    // Handle localhost URLs by replacing with the emulator-accessible address
    if (url.startsWith("http://localhost:3000")) {
      const newUrl = url.replace("http://localhost:3000", BASE_URL);
      if (webViewRef.current) {
        // Use setTimeout to avoid interrupting the current load cycle
        setTimeout(() => {
          webViewRef.current?.injectJavaScript(
            `window.location.href = "${newUrl}";`
          );
        }, 100);
      }
      return false;
    }

    // ✅ 카카오/네이버 OAuth 인증 URL은 WebView에서 열기
    if (url.includes("kauth.kakao.com") || url.includes("nid.naver.com")) {
      return true;
    }

    // Handle other external URLs by opening in external browser
    if (url.startsWith("http") && !url.startsWith(BASE_URL)) {
      console.log("Opening external URL in browser:", url);
      Linking.openURL(url);
      return false;
    }

    // Allow all other URLs to load in WebView
    return true;
  };

  // 웹뷰에 주입할 JavaScript 코드
  const injectedJavaScript = `
    // 네이티브 앱 인터페이스
    function sendToNative(message) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      } else {
        console.warn('ReactNativeWebView is not available');
      }
    }

    function handleNativeMessage(message) {
      console.log('Received message from native app:', message);
      
      switch (message.type) {

          
        case 'FCM_TOKEN_RESPONSE':
          console.log('FCM token received:', message.token);
          if (window.handleFcmTokenResponse) {
            window.handleFcmTokenResponse(message.token);
          }
          break;
          
        case 'NOTIFICATION_RECEIVED':
          console.log('Notification received:', message.data);
          if (window.handleNotificationReceived) {
            window.handleNotificationReceived(message.data);
          }
          break;
          
        case 'NOTIFICATION_TAPPED':
          console.log('Notification tapped:', message.data);
          if (window.handleNotificationTapped) {
            window.handleNotificationTapped(message.data);
          }
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    }

    function requestFcmToken() {
      sendToNative({
        type: 'GET_FCM_TOKEN'
      });
    }

    function updateFcmToken(token) {
      sendToNative({
        type: 'UPDATE_FCM_TOKEN',
        token
      });
    }

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
    window.handleFcmTokenResponse = null;
    window.handleNotificationReceived = null;
    window.handleNotificationTapped = null;

    console.log('Native app interface loaded');
    
    // 웹뷰 로드 완료 시 네이티브 앱에 알림
    window.addEventListener('load', function() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'WEBVIEW_LOADED',
          url: window.location.href
        }));
      }
    });
    
    true; // 주입 완료 표시
  `;

  return (
    <WebView
      ref={(ref) => {
        if (ref) {
          webViewRef.current = ref;
        }
      }}
      onNavigationStateChange={handleNavigationStateChange}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      onMessage={onMessage}
      source={{ uri: `${BASE_URL}${path}` }}
      userAgent="jinjahalgae-webview-agent"
      injectedJavaScript={injectedJavaScript}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      {...props}
    />
  );
}
