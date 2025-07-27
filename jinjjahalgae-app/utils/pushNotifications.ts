import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 알림 핸들러 설정 (앱이 포그라운드에 있을 때 알림 처리)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 에러 처리 함수
function handleRegistrationError(errorMessage: string) {
  console.error('Push notification registration error:', errorMessage);
  // throw new Error(errorMessage); // Remove this line to prevent app crash
}

// 푸시 알림 권한 요청 및 토큰 받기
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // 안드로이드 채널 설정
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    // 현재 권한 상태 확인
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 권한이 부여되지 않았다면 요청
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // 최종적으로 권한이 거부되었다면 함수 종료
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return null;
    }

    // 프로젝트 ID 추출
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
      return null;
    }

    console.log('projectId', projectId);

    // Expo 푸시 토큰 받기
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log('Push token received:', pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
      return null;
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
    return null;
  }
}

// 알림 수신 리스너 설정
export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
) {
  const notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);
  const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

// 로컬 알림 보내기 (테스트용)
export async function sendLocalNotification(title: string, body: string, data?: any) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // 즉시 발송
  });
}

// 뱃지 카운트 관리
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// 모든 알림 제거
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}
