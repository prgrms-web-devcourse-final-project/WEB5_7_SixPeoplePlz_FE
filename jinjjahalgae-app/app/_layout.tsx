import { WebViewProvider } from "@/components/web-view-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import { registerForPushNotificationsAsync } from "@/utils/pushNotifications";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { ToastProvider } from "expo-toast";
import { useCallback, useEffect, useRef, useState } from "react";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options for splash screen
SplashScreen.setOptions({
  duration: 1500,
  fade: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const [appIsReady, setAppIsReady] = useState(false);
  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // 푸시 알림 등록
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);
          console.log("Push token obtained:", token);
        }

        // 앱이 포그라운드에 있을 때 알림을 받는 리스너
        notificationListener.current =
          Notifications.addNotificationReceivedListener((notification) => {
            console.log("Notification received:", notification);
            setNotification(notification);
          });

        // 사용자가 알림을 탭했을 때의 리스너
        responseListener.current =
          Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("Notification response:", response);
            const data = response.notification.request.content.data;

            // 알림 데이터에 따른 분기 처리
            if (data?.screen) {
              // 특정 화면으로 네비게이션하는 로직
              console.log("Navigate to screen:", data.screen);
            }
          });

        // 폰트가 로드될 때까지 기다림
        if (loaded) {
          // 모든 리소스가 준비되면 앱 준비 완료
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn("App preparation error:", e);
      }
    }

    prepare();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [loaded]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // 부드러운 전환을 위해 약간의 지연 후 스플래시 스크린 숨김
      await new Promise((resolve) => setTimeout(resolve, 500));
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!loaded || !appIsReady) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ToastProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <WebViewProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen
                name="login/oauth2/code/kakao"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="login/oauth2/code/naver"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="contracts/create"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="contracts/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="contracts/[id]/preview"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="contracts/[id]/proofs/[proofId]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="contracts/[id]/created"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="contracts/[id]/edit"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen
                name="profile/history"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="profile/info"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="supervise/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="supervise/[id]/detail"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="supervise/[id]/detail/[proofId]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="notifications"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="invite/[code]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="webview-test"
                options={{ headerShown: false }}
              />
            </Stack>
            <StatusBar style="auto" />
          </WebViewProvider>
        </ThemeProvider>
      </ToastProvider>
    </SafeAreaView>
  );
}
