/**
 * 테마 관련 유틸리티 함수들
 */

import { colors, components } from "./theme";

/**
 * 클래스명을 조합하는 유틸리티 함수
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * 버튼 클래스 생성 함수
 */
export function buttonClasses(
  variant: keyof typeof components.button.variants = "primary",
  size: keyof typeof components.button.sizes = "md",
  fullWidth = false,
  disabled = false
): string {
  return cn(
    components.button.base,
    components.button.sizes[size],
    components.button.variants[variant],
    fullWidth && "w-full",
    disabled && "opacity-50 cursor-not-allowed"
  );
}

/**
 * 카드 클래스 생성 함수
 */
export function cardClasses(
  padding: keyof typeof components.card.padding = "md",
  shadow = true,
  hover = false
): string {
  return cn(
    components.card.base,
    components.card.padding[padding],
    shadow && "shadow-sm",
    hover && "hover:shadow-md transition-shadow duration-200"
  );
}

/**
 * 입력 필드 클래스 생성 함수
 */
export function inputClasses(
  size: keyof typeof components.input.sizes = "md",
  error = false,
  disabled = false
): string {
  return cn(
    components.input.base,
    components.input.sizes[size],
    error && components.input.states.error,
    disabled && components.input.states.disabled
  );
}

/**
 * 배지 클래스 생성 함수
 */
export function badgeClasses(
  variant: keyof typeof components.badge.variants = "gray",
  size: keyof typeof components.badge.sizes = "sm"
): string {
  return cn(
    components.badge.base,
    components.badge.sizes[size],
    components.badge.variants[variant]
  );
}

/**
 * 반응형 텍스트 크기 클래스
 */
export const responsiveText = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-sm sm:text-base",
  lg: "text-base sm:text-lg",
  xl: "text-lg sm:text-xl",
  "2xl": "text-xl sm:text-2xl",
  "3xl": "text-2xl sm:text-3xl",
};

/**
 * 모바일 우선 스페이싱 유틸리티
 */
export const mobileSpacing = {
  container: "px-4 sm:px-6 lg:px-8",
  section: "py-8 sm:py-12 lg:py-16",
  card: "p-4 sm:p-6",
  button: "px-4 py-2 sm:px-6 sm:py-3",
};

/**
 * 안전 영역 클래스
 */
export const safeArea = {
  top: "pt-safe-top",
  bottom: "pb-safe-bottom",
  left: "pl-safe-left",
  right: "pr-safe-right",
  all: "p-safe",
};

/**
 * 색상 값 가져오기 (CSS 변수명 반환)
 */
export function getColor(colorName: string, shade?: string | number): string {
  if (shade) {
    return `var(--color-${colorName}-${shade})`;
  }
  return `var(--color-${colorName})`;
}

/**
 * 터치 친화적인 최소 크기 클래스
 */
export const touchTarget = "min-h-[44px] min-w-[44px]";

/**
 * 포커스 스타일
 */
export const focusRing =
  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";

/**
 * 스크린 크기별 숨김/표시 유틸리티
 */
export const responsive = {
  hideOnMobile: "hidden sm:block",
  hideOnDesktop: "sm:hidden",
  showOnMobile: "block sm:hidden",
  showOnDesktop: "hidden sm:block",
};

/**
 * 애니메이션 유틸리티
 */
export const animations = {
  fadeIn: "animate-fade-in",
  slideUp: "animate-slide-up",
  slideDown: "animate-slide-down",
  bounce: "hover:scale-105 active:scale-95 transition-transform duration-200",
  pulse: "animate-pulse",
  spin: "animate-spin",
};

/**
 * 그라데이션 배경
 */
export const gradients = {
  primary: "bg-gradient-to-r from-primary-500 to-primary-600",
  success: "bg-gradient-to-r from-success-500 to-success-600",
  danger: "bg-gradient-to-r from-danger-500 to-danger-600",
  warning: "bg-gradient-to-r from-warning-500 to-warning-600",
  gray: "bg-gradient-to-r from-gray-500 to-gray-600",
};

/**
 * 그림자 유틸리티
 */
export const shadows = {
  soft: "shadow-sm",
  medium: "shadow-md",
  large: "shadow-lg",
  floating: "shadow-xl",
  inner: "shadow-inner",
};

/**
 * 모바일 네비게이션 높이 계산
 */
export const mobileNavHeight = "64px"; // 하단 네비게이션 높이
export const mobileHeaderHeight = "56px"; // 상단 헤더 높이

/**
 * 컨테이너 최대 너비
 */
export const containerSizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full",
};

/**
 * 모바일 최적화된 스택 레이아웃
 */
export const stackLayout = {
  vertical: "flex flex-col space-y-4",
  horizontal: "flex flex-row space-x-4",
  responsive: "flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4",
};
