/**
 * 날짜 유틸리티 함수 테스트
 * 한국 시간대 변환이 올바르게 작동하는지 확인
 */

import {
  dateStringToKoreanTimeISO,
  isoStringToKoreanDateString,
  toKoreanTimeISO,
  nowInKoreanTimeISO,
} from "../lib/utils/date";

// 테스트 함수들
function testKoreanTimeConversion() {
  // 1. 현재 시간 테스트
  const now = new Date();
  const koreanNow = toKoreanTimeISO(now);

  // 2. 특정 날짜 문자열 테스트
  const testDate = "2024-01-01";
  const koreanISO = dateStringToKoreanTimeISO(testDate);

  // 3. ISO 문자열을 다시 날짜 문자열로 변환 테스트
  const backToDateString = isoStringToKoreanDateString(koreanISO);

  // 4. 현재 한국 시간 ISO
  const nowKorean = nowInKoreanTimeISO();
}

// 브라우저 환경에서만 실행
if (typeof window !== "undefined") {
  testKoreanTimeConversion();
}

export { testKoreanTimeConversion };
