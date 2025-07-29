import { useNavigationState } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import { useToast } from "expo-toast";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
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
  const [refreshing, setRefreshing] = useState(false);
  const [refresherEnabled, setEnableRefresher] = useState(true);

  const triggerRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleScroll = (event: any) => {
    const yOffset = Number(event.nativeEvent.contentOffset.y);
    if (yOffset === 0) {
      setEnableRefresher(true);
    } else {
      setEnableRefresher(false);
    }
  };

  const onMessage = async (event: any) => {
    const { data } = event.nativeEvent;

    try {
      const parsedData = JSON.parse(data) as WebViewEvent;
      // 다운로드 파일 처리
      if (parsedData.type === "DOWNLOAD_FILE") {
        const { data: dataUrl, fileName } = parsedData.payload || {};

        // 파일 저장 및 공유 로직을 별도 함수로 분리
        async function saveAndShareFile() {
          if (typeof dataUrl === "string" && typeof fileName === "string") {
            try {
              // react-native-blob-util을 사용하여 파일 저장
              const base64 = dataUrl.split(",")[1];
              const mimeType = dataUrl.split(";")[0].split(":")[1];

              let filePath: string;
              let finalFileName = fileName;

              if (Platform.OS === "android") {
                // Android의 경우 앱별 저장소에 먼저 저장
                const androidPath = ReactNativeBlobUtil.fs.dirs.DocumentDir;
                filePath = `${androidPath}/${finalFileName}`;

                // 파일이 이미 존재하는 경우 파일명에 타임스탬프 추가
                const exists = await ReactNativeBlobUtil.fs.exists(filePath);
                if (exists) {
                  const timestamp = new Date().getTime();
                  const nameWithoutExt = finalFileName.substring(
                    0,
                    finalFileName.lastIndexOf(".")
                  );
                  const ext = finalFileName.substring(
                    finalFileName.lastIndexOf(".")
                  );
                  finalFileName = `${nameWithoutExt}_${timestamp}${ext}`;
                  filePath = `${androidPath}/${finalFileName}`;
                }

                // base64 데이터를 파일로 저장
                await ReactNativeBlobUtil.fs.writeFile(
                  filePath,
                  base64,
                  "base64"
                );

                // Android 10+ 에서는 MediaStore API를 사용하여 갤러리에 추가
                try {
                  await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
                    {
                      name: finalFileName,
                      parentFolder: "",
                      mimeType: mimeType || "image/jpeg",
                      path: filePath,
                    },
                    "Image",
                    filePath
                  );
                  console.log("[DOWNLOAD_FILE] MediaStore에 성공적으로 저장됨");
                } catch (mediaError) {
                  console.warn(
                    "[DOWNLOAD_FILE] MediaStore 저장 실패:",
                    mediaError
                  );
                  // MediaStore 실패해도 파일은 저장되었으므로 계속 진행
                }
              } else {
                // iOS의 경우 Documents 디렉토리 사용
                filePath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${finalFileName}`;

                // base64 데이터를 파일로 저장
                await ReactNativeBlobUtil.fs.writeFile(
                  filePath,
                  base64,
                  "base64"
                );
              }

              toast.show(`이미지 저장 완료: ${finalFileName}`);
            } catch (e) {
              console.error("[DOWNLOAD_FILE] 파일 저장 실패:", e);
              toast.show("이미지 저장 실패");
            }
          } else {
            toast.show("잘못된 파일 데이터");
          }
        }

        // 권한 요청 후 저장/공유 실행 (권한이 필요하지 않으므로 바로 실행)
        saveAndShareFile();

        return;
      }
      console.log("Received message from WebView:", parsedData);

      // 웹뷰 컨텍스트로 메시지 전달 (FCM 토큰 요청 등 처리)
      handleWebViewMessage(parsedData);

      // 기존 로직 유지
      switch (parsedData.type) {
        case "subscribe":
          console.log("subscribe");
          // Handle subscribe event here
          break;
        case "ROUTE_CHANGED":
          console.log("Route changed in WebView:", parsedData.payload);
          // 웹뷰 내 라우팅 변경을 감지했지만,
          // 네이티브 스택은 그대로 유지 (웹뷰 내에서 처리)
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
    console.log("Navigation state changed:", navState);
    setCanGoBackInWebview(navState.canGoBack);

    // URL 변경을 감지하여 네이티브 라우터에 알림
    const currentUrl = navState.url;
    if (currentUrl && currentUrl.startsWith(BASE_URL)) {
      const path = currentUrl.replace(BASE_URL, "");
      console.log("WebView navigated to:", path);

      // 네이티브 라우터에 현재 경로 알림 (필요시 사용)
      // router.setParams({ currentPath: path });
    }
  };

  // Add this function for header back button
  const handleHeaderBack = () => {
    console.log(
      "Header back pressed - canGoBackInWebview:",
      canGoBackInWebview,
      "canGoBackNative:",
      canGoBackNative
    );

    if (canGoBackInWebview && webViewRef.current) {
      console.log("Going back in WebView");
      webViewRef.current.goBack();
    } else {
      // Native stack pop
      if (router.canGoBack?.()) {
        console.log("Going back in native stack");
        router.back();
      } else {
        // fallback: exit app or go home
        console.log("No more back navigation available");
        toast.show("더 이상 뒤로 갈 수 없습니다.");
      }
    }
  };

  // Android 하드웨어 뒤로가기 로직
  useFocusEffect(
    useCallback(() => {
      let backPressTimer: number | null = null;
      const onBackPress = () => {
        console.log(
          "Hardware back pressed - canGoBackInWebview:",
          canGoBackInWebview,
          "canGoBackNative:",
          canGoBackNative
        );

        if (canGoBackInWebview && webViewRef.current) {
          console.log("Going back in WebView (hardware back)");
          webViewRef.current.goBack();
          return true;
        } else if (canGoBackNative && router.canGoBack?.()) {
          console.log("Going back in native stack (hardware back)");
          router.back();
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
            console.log("Exiting app (hardware back)");
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

  // FCM 토큰이 변경되면 웹뷰에 다시 주입
  useEffect(() => {
    if (fcmToken && webViewRef.current) {
      // 토큰이 객체인 경우 문자열만 추출
      let tokenString = fcmToken;
      if (
        typeof fcmToken === "object" &&
        fcmToken !== null &&
        "fcmToken" in fcmToken
      ) {
        tokenString = (fcmToken as any).fcmToken;
      }
      console.log("FCM token updated, injecting to WebView:", tokenString);
      const script = `
        window.fcmToken = "${tokenString}";
        console.log('FCM token updated in WebView:', window.fcmToken);
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [fcmToken]);

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
    // FCM 토큰 초기화 (나중에 업데이트됨)
    window.fcmToken = null;
    console.log('WebView loaded, FCM token will be injected when available');

    // 네이티브 앱 인터페이스
    function sendToNative(message) {
      console.log('Sending message to native app:', message);
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
          window.fcmToken = message.token;
          if (window.handleFcmTokenResponse) {
            window.handleFcmTokenResponse(message.token);
          } else {
            console.warn('handleFcmTokenResponse callback not set');
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
      // 이미 토큰이 있으면 바로 반환
      if (window.fcmToken) {
        console.log('FCM token already available:', window.fcmToken);
        if (window.handleFcmTokenResponse) {
          window.handleFcmTokenResponse(window.fcmToken);
        }
        return;
      }
      
      // 토큰이 없으면 네이티브 앱에 요청
      console.log('Requesting FCM token from native app...');
      sendToNative({
        type: 'GET_FCM_TOKEN'
      });
      
      // 토큰이 설정될 때까지 주기적으로 확인 (더 빠른 응답을 위해)
      let checkCount = 0;
      const maxChecks = 40; // 최대 4초 (100ms * 40)
      const checkInterval = setInterval(() => {
        checkCount++;
        if (window.fcmToken) {
          console.log('FCM token received via polling:', window.fcmToken);
          clearInterval(checkInterval);
          if (window.handleFcmTokenResponse) {
            window.handleFcmTokenResponse(window.fcmToken);
          }
        } else if (checkCount >= maxChecks) {
          console.log('FCM token request timeout');
          clearInterval(checkInterval);
          if (window.handleFcmTokenResponse) {
            window.handleFcmTokenResponse(null);
          }
        }
      }, 100);
    }

    function updateFcmToken(token) {
      window.fcmToken = token;
      sendToNative({
        type: 'UPDATE_FCM_TOKEN',
        token
      });
    }

    // 라우팅 변경 감지를 위한 함수
    function notifyRouteChange() {
      const currentUrl = window.location.href;
      const currentPath = window.location.pathname + window.location.search;
      
      sendToNative({
        type: 'ROUTE_CHANGED',
        url: currentUrl,
        path: currentPath
      });
    }

    // React Native WebView 메시지 리스너 설정
    // React Native WebView에서는 postMessage로 보낸 메시지가
    // 네이티브 앱의 onMessage 콜백으로 전달되므로
    // 웹뷰 내에서는 별도의 이벤트 리스너가 필요하지 않음
    // 대신 window.fcmToken을 직접 확인하거나
    // 네이티브 앱에서 주입하는 스크립트를 통해 토큰을 받음

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

    console.log('Native app interface loaded with FCM token:', window.fcmToken);
    
    // 웹뷰 로드 완료 시 네이티브 앱에 알림
    window.addEventListener('load', function() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'WEBVIEW_LOADED',
          url: window.location.href
        }));
      }
    });

    // 라우팅 변경 감지를 위한 이벤트 리스너들
    let currentPath = window.location.pathname;
    
    // popstate 이벤트 (브라우저 뒤로가기/앞으로가기)
    window.addEventListener('popstate', function() {
      notifyRouteChange();
    });

    // pushstate/replacestate 이벤트 감지
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      setTimeout(notifyRouteChange, 100);
    };
    
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      setTimeout(notifyRouteChange, 100);
    };

    // a 태그 클릭 감지
    document.addEventListener('click', function(event) {
      const target = event.target;
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target : target.closest('a');
        const href = link.getAttribute('href');
        
        if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          // 내부 링크인 경우 라우팅 변경 알림
          setTimeout(notifyRouteChange, 100);
        }
      }
    });
    
    true; // 주입 완료 표시
  `;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            enabled={refresherEnabled}
            onRefresh={() => {
              triggerRefresh();
              webViewRef.current?.reload();
            }}
          />
        }
      >
        <WebView
          ref={(ref) => {
            if (ref) {
              webViewRef.current = ref;
            }
          }}
          onScroll={handleScroll}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onMessage={onMessage}
          source={{ uri: `${BASE_URL}${path}` }}
          userAgent="jinjahalgae-webview-agent"
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          pullToRefreshEnabled={true}
          {...props}
        />
      </ScrollView>
    </View>
  );
}
