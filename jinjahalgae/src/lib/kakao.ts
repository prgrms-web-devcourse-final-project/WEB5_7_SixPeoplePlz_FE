/**
 * 카카오 OAuth 관련 설정 및 유틸리티
 */

// 카카오 OAuth 인증 URL 생성 (기본)
export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}&redirect_uri=${process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI}&scope=profile_nickname,account_email`;

// 리다이렉트 경로가 있는 경우 카카오 OAuth URL 생성
export const createKakaoAuthUrl = (redirectPath?: string) => {
  const baseUrl = KAKAO_AUTH_URL;
  if (redirectPath) {
    // state 파라미터에 리다이렉트 경로 포함
    return `${baseUrl}&state=${encodeURIComponent(redirectPath)}`;
  }
  return baseUrl;
};
