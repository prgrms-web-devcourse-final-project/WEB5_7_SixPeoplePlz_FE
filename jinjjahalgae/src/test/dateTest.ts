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
  console.log("=== 한국 시간대 변환 테스트 ===");

  // 1. 현재 시간 테스트
  const now = new Date();
  const koreanNow = toKoreanTimeISO(now);
  console.log("현재 시간 (로컬):", now.toISOString());
  console.log("현재 시간 (한국 시간대):", koreanNow);

  // 2. 특정 날짜 문자열 테스트
  const testDate = "2024-01-01";
  const koreanISO = dateStringToKoreanTimeISO(testDate);
  console.log(`날짜 문자열 "${testDate}" -> 한국 시간대:`, koreanISO);

  // 3. ISO 문자열을 다시 날짜 문자열로 변환 테스트
  const backToDateString = isoStringToKoreanDateString(koreanISO);
  console.log(
    `한국 시간대 ISO "${koreanISO}" -> 날짜 문자열:`,
    backToDateString
  );

  // 4. 현재 한국 시간 ISO
  const nowKorean = nowInKoreanTimeISO();
  console.log("현재 한국 시간 ISO:", nowKorean);

  console.log("=== 테스트 완료 ===");
}

// 브라우저 환경에서만 실행
if (typeof window !== "undefined") {
  testKoreanTimeConversion();
}

export { testKoreanTimeConversion };
