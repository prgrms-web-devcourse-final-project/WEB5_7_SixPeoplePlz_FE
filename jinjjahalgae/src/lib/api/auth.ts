/**
 * 인증 관련 API 함수들
 * - 소셜 로그인 (카카오, 네이버)
 * - 토큰 리프레시
 * - 로그아웃
 */

import { apiRequest } from "../api";
import {
  RefreshRequest,
  RefreshResponse,
  SocialLoginRequest,
  SocialLoginResponse,
} from "../../../docs/data-contracts";

// FCM 토큰을 가져오는 함수 (웹뷰에서 네이티브 앱으로 요청)
const getFcmTokenFromNative = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    // 네이티브 앱에서 FCM 토큰 요청
    if (window.NativeAppInterface) {
      // FCM 토큰 응답을 처리하는 콜백 설정
      window.handleFcmTokenResponse = (token: string | null) => {
        resolve(token);
      };
      
      // 네이티브 앱에 FCM 토큰 요청
      window.NativeAppInterface.requestFcmToken();
      
      // 3초 후 타임아웃
      setTimeout(() => {
        resolve(null);
      }, 3000);
    } else {
      resolve(null);
    }
  });
};

// 소셜 로그인 요청 데이터 준비 (FCM 토큰 포함)
const prepareSocialLoginData = async (
  provider: string,
  accessToken: string
): Promise<SocialLoginRequest> => {
  const baseData: SocialLoginRequest = {
    provider,
    accessToken,
  };

  // 웹뷰 환경에서 FCM 토큰이 있는지 확인
  if (window.NativeAppInterface) {
    try {
      const fcmToken = await getFcmTokenFromNative();
      if (fcmToken) {
        baseData.fcmToken = fcmToken;
        console.log('FCM token included in login request:', fcmToken);
      } else {
        console.log('No FCM token available');
      }
    } catch (error) {
      console.warn('Failed to get FCM token:', error);
    }
  }

  return baseData;
};

// 소셜 로그인/회원가입 (Body 방식)
export const socialLoginBody = async (
  provider: string,
  accessToken: string
): Promise<SocialLoginResponse> => {
  const data = await prepareSocialLoginData(provider, accessToken);
  
  const response = await apiRequest<{
    success: boolean;
    result?: SocialLoginResponse;
  }>("/auth/login/social/body", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (response.success && response.result) {
    return response.result;
  }

  throw new Error("소셜 로그인에 실패했습니다.");
};

// 토큰 리프레시
export const refreshToken = async (
  data: RefreshRequest
): Promise<RefreshResponse> => {
  return apiRequest<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// 로그아웃
export const signOut = async (): Promise<void> => {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
  });
};

// 테스트 유저 JWT 발급 (프론트 개발용)
export const testLogin = async (): Promise<SocialLoginResponse> => {
  const response = await apiRequest<{
    success: boolean;
    result?: SocialLoginResponse;
  }>("/auth/test-login", {
    method: "POST",
  });

  if (response.success && response.result) {
    return response.result;
  }

  throw new Error("테스트 로그인에 실패했습니다.");
};

// 소셜 로그인/회원가입 (Cookie 방식)
export const socialLoginCookie = async (
  provider: string,
  accessToken: string
): Promise<{ success: boolean; result: string }> => {
  const data = await prepareSocialLoginData(provider, accessToken);
  
  const response = await apiRequest<{
    success: boolean;
    result?: string;
  }>("/auth/login/social/cookie", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (response.success) {
    return response as { success: boolean; result: string };
  }

  throw new Error("소셜 로그인에 실패했습니다.");
};
