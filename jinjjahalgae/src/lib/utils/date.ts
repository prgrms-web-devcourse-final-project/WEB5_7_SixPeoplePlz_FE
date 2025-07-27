/**
 * 날짜 관련 유틸리티 함수들
 * 한국 시간대(Asia/Seoul, UTC+9)로 날짜를 변환하여 서버로 전송
 */

/**
 * 날짜를 한국 시간대(UTC+9)의 ISO 문자열로 변환
 * @param date - 변환할 Date 객체
 * @returns 한국 시간대 오프셋이 적용된 ISO 문자열 (예: "2024-01-01T09:00:00+09:00")
 */
export function toKoreanTimeISO(date: Date): string {
  // 한국 시간대 오프셋 (UTC+9)
  const KOREA_OFFSET_MINUTES = 9 * 60;

  // 현재 시간대 오프셋 계산
  const currentOffsetMinutes = date.getTimezoneOffset();

  // 한국 시간으로 조정
  const koreanTime = new Date(
    date.getTime() + (KOREA_OFFSET_MINUTES + currentOffsetMinutes) * 60 * 1000
  );

  // ISO 문자열 생성하고 Z를 +09:00으로 교체
  const isoString = koreanTime.toISOString();
  return isoString.replace("Z", "+09:00");
}

/**
 * 날짜 문자열을 한국 시간대의 ISO 문자열로 변환
 * @param dateString - 변환할 날짜 문자열 (예: "2024-01-01")
 * @returns 한국 시간대 오프셋이 적용된 ISO 문자열
 */
export function dateStringToKoreanTimeISO(dateString: string): string {
  const date = new Date(dateString);
  return toKoreanTimeISO(date);
}

/**
 * 현재 시간을 한국 시간대의 ISO 문자열로 반환
 * @returns 한국 시간대 오프셋이 적용된 현재 시간의 ISO 문자열
 */
export function nowInKoreanTimeISO(): string {
  return toKoreanTimeISO(new Date());
}

/**
 * ISO 문자열 날짜를 한국 시간대 기준 YYYY-MM-DD 형식으로 변환
 * 폼 입력 필드에 표시할 때 사용
 * @param isoString - ISO 형식의 날짜 문자열
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export function isoStringToKoreanDateString(isoString: string): string {
  const date = new Date(isoString);
  // 9시간 더하지 않고, 현지 시간 기준으로 날짜 추출
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
