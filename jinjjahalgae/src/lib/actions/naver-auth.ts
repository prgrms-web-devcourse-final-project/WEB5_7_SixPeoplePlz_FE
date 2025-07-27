/**
 * 네이버 OAuth 서버 액션
 * CORS 문제를 피하기 위해 서버에서 네이버 API 호출
 */

"use server";

interface NaverTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface SocialLoginResult {
  success: boolean;
  result?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

/**
 * 네이버 인가 코드로 액세스 토큰을 받아오는 서버 액션
 */
export async function exchangeNaverCodeForToken(
  code: string,
  state: string
): Promise<SocialLoginResult> {
  try {
    // 환경 변수 확인
    const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const naverClientSecret = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET;

    if (!naverClientId || !naverClientSecret) {
      return {
        success: false,
        error: "네이버 OAuth 설정이 올바르지 않습니다.",
      };
    }

    // 1. 네이버 API에서 액세스 토큰 획득
    const tokenResponse = await fetch("https://nid.naver.com/oauth2.0/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: naverClientId,
        client_secret: naverClientSecret,
        code: code,
        state: state,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("네이버 토큰 요청 실패:", errorText);
      return {
        success: false,
        error: "네이버 토큰 요청에 실패했습니다.",
      };
    }

    const tokenData: NaverTokenResponse = await tokenResponse.json();
    const naverAccessToken = tokenData.access_token;

    if (!naverAccessToken) {
      return {
        success: false,
        error: "네이버 액세스 토큰을 받지 못했습니다.",
      };
    }

    // 2. 백엔드에 네이버 accessToken으로 소셜 로그인 요청
    // FCM 토큰은 클라이언트에서 처리하므로 여기서는 기본 요청만
    const loginResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/social/body`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "NAVER",
          accessToken: naverAccessToken,
          // FCM 토큰은 클라이언트에서 추가 처리
        }),
      }
    );

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error("백엔드 소셜 로그인 요청 실패:", errorText);
      return {
        success: false,
        error: "백엔드 소셜 로그인에 실패했습니다.",
      };
    }

    const loginData = await loginResponse.json();

    if (
      loginData.success &&
      loginData.result?.accessToken &&
      loginData.result?.refreshToken
    ) {
      return {
        success: true,
        result: {
          accessToken: loginData.result.accessToken,
          refreshToken: loginData.result.refreshToken,
        },
      };
    } else {
      return {
        success: false,
        error: "백엔드 소셜 로그인에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("네이버 로그인 서버 액션 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}
