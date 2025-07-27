/**
 * 카카오 OAuth 서버 액션
 * CORS 문제를 피하기 위해 서버에서 카카오 API 호출
 */
//

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
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
 * 카카오 인가 코드로 액세스 토큰을 받아오는 서버 액션
 */
export async function exchangeKakaoCodeForToken(
  code: string
): Promise<SocialLoginResult> {
  try {
    // 환경 변수 확인
    const kakaoRestApiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    const kakaoRedirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

    if (!kakaoRestApiKey || !kakaoRedirectUri) {
      return {
        success: false,
        error: "카카오 OAuth 설정이 올바르지 않습니다.",
      };
    }

    // 1. 카카오 API에서 액세스 토큰 획득
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: kakaoRestApiKey,
        redirect_uri: kakaoRedirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("카카오 토큰 요청 실패:", errorText);
      return {
        success: false,
        error: "카카오 토큰 요청에 실패했습니다.",
      };
    }

    const tokenData: KakaoTokenResponse = await tokenResponse.json();
    const kakaoAccessToken = tokenData.access_token;

    if (!kakaoAccessToken) {
      return {
        success: false,
        error: "카카오 액세스 토큰을 받지 못했습니다.",
      };
    }

    console.log("카카오 액세스 토큰:", kakaoAccessToken);

    // 2. 백엔드에 카카오 accessToken으로 소셜 로그인 요청
    // FCM 토큰은 클라이언트에서 처리하므로 여기서는 기본 요청만
    const loginResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/social/body`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "KAKAO",
          accessToken: kakaoAccessToken,
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
    console.error("카카오 로그인 서버 액션 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}
