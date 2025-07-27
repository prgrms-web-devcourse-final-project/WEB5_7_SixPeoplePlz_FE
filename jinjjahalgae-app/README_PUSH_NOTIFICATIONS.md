# Expo 푸시 알림 설정 및 웹뷰 소통 가이드

## 개요

이 프로젝트는 Expo를 사용한 React Native 앱에서 푸시 알림을 설정하고, 웹뷰와 네이티브 앱 간의 소통을 구현한 예시입니다.

## 주요 기능

### 1. 푸시 알림 설정 (앱 역할)
- Expo Notifications를 사용한 푸시 알림 권한 요청
- FCM 토큰 발급 및 관리
- 포그라운드/백그라운드 알림 처리
- 알림 탭 시 특정 화면으로 이동

### 2. 웹뷰와 네이티브 앱 소통 (앱 역할)
- 웹뷰에서 FCM 토큰 요청 시 토큰 제공
- 네이티브 앱에서 웹뷰로 알림 이벤트 전송
- 단순한 wrapper 역할로 웹의 인증 로직에 개입하지 않음

### 3. 웹에서의 확장성 있는 설계
- FCM 토큰이 있을 때만 로그인 요청에 포함
- 웹뷰 환경이 아닐 때는 토큰 없이 로그인 진행
- 모든 인증 로직은 웹에서 처리

## 설치된 패키지

```bash
npx expo install expo-notifications expo-device expo-constants
```

## 파일 구조

```
jinjahalgae-app/
├── utils/
│   ├── pushNotifications.ts    # 푸시 알림 유틸리티
│   ├── api.ts                 # API 클라이언트
│   └── webview-interface.ts   # 웹뷰 인터페이스
├── components/
│   ├── web-view-context.tsx   # 웹뷰 컨텍스트
│   └── jinjahalgae-web-view.tsx # 웹뷰 컴포넌트
├── types/
│   └── api.ts                 # API 타입 정의
└── app/
    └── _layout.tsx            # 앱 레이아웃 (컨텍스트 프로바이더 포함)
```

## 사용 방법

### 1. 앱에서 푸시 알림 초기화

앱이 시작될 때 자동으로 푸시 알림 권한을 요청하고 FCM 토큰을 발급받습니다.

```typescript
import { registerForPushNotificationsAsync } from '@/utils/pushNotifications';

// FCM 토큰 발급
const token = await registerForPushNotificationsAsync();
if (token) {
  console.log('FCM Token:', token);
}
```

### 2. 웹뷰에서 FCM 토큰 요청

웹뷰에서는 `window.NativeAppInterface`를 통해 FCM 토큰을 요청할 수 있습니다.

```javascript
// FCM 토큰 요청
window.NativeAppInterface.requestFcmToken();

// FCM 토큰 업데이트
window.NativeAppInterface.updateFcmToken('new_token_here');
```

### 3. 웹에서 확장성 있는 로그인 처리

웹에서는 FCM 토큰이 있을 때만 로그인 요청에 포함하도록 설계되어 있습니다.

```typescript
// 웹에서 자동으로 FCM 토큰을 포함한 로그인 처리
await authService.socialLogin('KAKAO', 'access_token');

// 웹뷰 환경이 아닐 때는 토큰 없이 로그인 진행
// 웹뷰 환경일 때는 자동으로 FCM 토큰을 포함
```

### 4. 알림 처리

알림이 수신되거나 사용자가 알림을 탭했을 때의 처리:

```typescript
import { setupNotificationListeners } from '@/utils/pushNotifications';

// 알림 리스너 설정
const cleanup = setupNotificationListeners(
  // 알림 수신 시
  (notification) => {
    console.log('Notification received:', notification);
    // 웹뷰에 알림 데이터 전송
    sendMessageToWebView({
      type: 'NOTIFICATION_RECEIVED',
      data: notification
    });
  },
  // 알림 탭 시
  (response) => {
    console.log('Notification tapped:', response);
    // 웹뷰에 알림 탭 데이터 전송
    sendMessageToWebView({
      type: 'NOTIFICATION_TAPPED',
      data: response
    });
  }
);
```

## 웹에서의 동작 방식

### 소셜 로그인 시 FCM 토큰 처리
웹에서는 로그인 시 자동으로 FCM 토큰을 확인하고 포함합니다:

1. **웹뷰 환경에서**: `window.NativeAppInterface`가 존재하는지 확인
2. **토큰 요청**: 네이티브 앱에 FCM 토큰 요청
3. **토큰 포함**: 토큰이 있으면 로그인 요청에 포함, 없으면 토큰 없이 진행
4. **확장성**: 웹뷰가 아닌 환경에서는 토큰 없이 로그인 진행

### API 요청 예시
```typescript
// 웹뷰 환경에서 FCM 토큰이 있을 때
{
  "provider": "KAKAO",
  "accessToken": "kakao_access_token",
  "fcmToken": "expo_push_token"
}

// 웹뷰 환경이 아니거나 토큰이 없을 때
{
  "provider": "KAKAO", 
  "accessToken": "kakao_access_token"
}
```

## 메시지 타입

### 웹뷰 → 네이티브 앱
- `GET_FCM_TOKEN`: FCM 토큰 요청
- `UPDATE_FCM_TOKEN`: FCM 토큰 업데이트

### 네이티브 앱 → 웹뷰
- `FCM_TOKEN_RESPONSE`: FCM 토큰 응답
- `NOTIFICATION_RECEIVED`: 알림 수신
- `NOTIFICATION_TAPPED`: 알림 탭

## 설정 파일

### app.json
푸시 알림 플러그인 설정이 포함되어 있습니다:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ]
  }
}
```

## 테스트

### 1. 푸시 알림 테스트
Expo 푸시 알림 도구를 사용하여 테스트할 수 있습니다:
https://expo.dev/notifications

### 2. 웹뷰 소통 테스트
웹뷰에서 다음 코드를 실행하여 네이티브 앱과의 소통을 테스트할 수 있습니다:

```javascript
// FCM 토큰 요청
window.NativeAppInterface.requestFcmToken();

// 로그인 요청 (테스트용)
window.NativeAppInterface.requestLogin('TEST', 'test_token');
```

## 주의사항

1. **실제 기기 필요**: 푸시 알림은 시뮬레이터에서 작동하지 않습니다. 실제 기기에서 테스트해야 합니다.

2. **네이티브 설정**: 앱 스토어 배포를 위해서는 FCM/APNs 설정이 필요합니다.

3. **API URL**: 실제 서버 URL로 변경해야 합니다.

4. **보안**: FCM 토큰과 같은 민감한 정보는 안전하게 관리해야 합니다.

## 문제 해결

### 푸시 알림이 작동하지 않는 경우
1. 실제 기기에서 테스트하고 있는지 확인
2. 앱 권한이 허용되었는지 확인
3. FCM 토큰이 정상적으로 발급되었는지 확인

### 웹뷰 소통이 작동하지 않는 경우
1. 웹뷰에 JavaScript 인터페이스가 주입되었는지 확인
2. 메시지 형식이 올바른지 확인
3. 콘솔 로그를 확인하여 오류 메시지 확인 