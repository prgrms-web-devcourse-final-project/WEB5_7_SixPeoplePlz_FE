/**
 * 통합 인증 서비스
 * - 소셜 로그인 (카카오, 네이버)
 * - 로그아웃
 * - 토큰 리프레시
 * - 사용자 정보 조회
 */

import { getApiClient, resetApiClient } from "./auth-client";
import { tokenManager } from "./token-manager";
import {
  SocialLoginRequest,
  SocialLoginResponse,
  GetMyInfoData,
} from "../../../docs/data-contracts";

export class AuthService {
  private static instance: AuthService | null = null;

  // 싱글톤 패턴
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * 소셜 로그인 처리
   */
  async socialLogin(provider: string, accessToken: string): Promise<SocialLoginResponse> {
    // FCM 토큰을 포함한 로그인 데이터 준비
    const { socialLoginBody } = await import("../api/auth");
    const response = await socialLoginBody(provider, accessToken);

    // 토큰 저장
    if (response.accessToken && response.refreshToken) {
      tokenManager.setAccessToken(response.accessToken);
      tokenManager.setRefreshToken(response.refreshToken);

      // API 클라이언트 재생성으로 새 토큰 적용
      resetApiClient();
    }

    return response;
  }

  /**
   * 테스트 로그인 (개발용)
   */
  async testLogin(): Promise<SocialLoginResponse> {
    console.log("🚀 테스트 로그인 시작");
    const apiClient = getApiClient();
    const response = await apiClient.testLogin();

    console.log("📡 API 응답:", response);
    console.log("📦 응답 데이터:", response.data);

    // MSW 환경에서는 result 객체 안에 토큰이 있을 수 있음
    const responseData = (response.data as any).result || response.data;

    console.log("🔑 처리된 토큰 데이터:", responseData);

    // 토큰 저장
    if (responseData.accessToken && responseData.refreshToken) {
      console.log("💾 토큰 저장 중...");
      tokenManager.setAccessToken(responseData.accessToken);
      tokenManager.setRefreshToken(responseData.refreshToken);

      // API 클라이언트 재생성으로 새 토큰 적용
      resetApiClient();
      console.log("✅ 테스트 로그인 완료");
    } else {
      console.error("❌ 토큰이 응답에 없습니다:", responseData);
    }

    return responseData;
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      // 서버에 로그아웃 요청
      const apiClient = getApiClient();
      await apiClient.logout();
    } catch (error) {
      console.error("서버 로그아웃 실패:", error);
      // 서버 요청 실패해도 로컬 토큰은 삭제
    } finally {
      // 로컬 토큰 정리
      tokenManager.clearAllTokens();
      resetApiClient();
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<GetMyInfoData> {
    const apiClient = getApiClient();
    const response = await apiClient.getMyInfo();
    return response.data;
  }

  /**
   * 로그인 상태 확인
   */
  isAuthenticated(): boolean {
    return tokenManager.hasTokens();
  }

  /**
   * 토큰 수동 리프레시
   */
  async refreshTokens(): Promise<boolean> {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      return false;
    }

    try {
      const apiClient = getApiClient();
      const response = await apiClient.refresh({ refreshToken });

      // 새 토큰 저장
      if (response.data.result?.accessToken) {
        tokenManager.setAccessToken(response.data.result.accessToken);
        if (response.data.result.refreshToken) {
          tokenManager.setRefreshToken(response.data.result.refreshToken);
        }

        // API 클라이언트 재생성
        resetApiClient();
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // 리프레시 실패 시 모든 토큰 정리
      tokenManager.clearAllTokens();
      resetApiClient();
    }

    return false;
  }

  /**
   * FCM 토큰 업데이트
   */
  async updateFcmToken(fcmToken: string): Promise<void> {
    try {
      // 직접 API 호출로 FCM 토큰 업데이트
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/fcm-token`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenManager.getAccessToken()}`,
          },
          body: JSON.stringify({ fcmToken }),
        }
      );

      if (!response.ok) {
        throw new Error("FCM 토큰 업데이트에 실패했습니다.");
      }

      console.log("FCM 토큰 업데이트 완료:", fcmToken);
    } catch (error) {
      console.error("FCM 토큰 업데이트 실패:", error);
      throw error;
    }
  }
}

// 편의를 위한 기본 export
export const authService = AuthService.getInstance();
