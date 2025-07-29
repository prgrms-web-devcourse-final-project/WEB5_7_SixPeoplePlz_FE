/**
 * 앱 전체 테마 시스템
 * - 컬러 팔레트
 * - 타이포그래피
 * - 스페이싱
 * - 그림자
 * - 모바일 우선 디자인 값들
 */

export const colors = {
  // Primary - Blue
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },

  // Success - Green
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },

  // Danger - Red
  danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
    950: "#450a0a",
  },

  // Warning - Yellow/Orange
  warning: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
    950: "#431407",
  },

  // Gray - 더 강한 대비를 위해 조정
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },

  // Special colors
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
};

export const typography = {
  fontFamily: {
    sans: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Apple SD Gothic Neo",
      "Pretendard Variable",
      "Pretendard",
      "Roboto",
      "Noto Sans KR",
      "Segoe UI",
      "Malgun Gothic",
      "sans-serif",
    ],
    mono: [
      "SFMono-Regular",
      "Menlo",
      "Monaco",
      "Consolas",
      "Liberation Mono",
      "Courier New",
      "monospace",
    ],
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
    xl: ["1.25rem", { lineHeight: "1.75rem" }],
    "2xl": ["1.5rem", { lineHeight: "2rem" }],
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
    "5xl": ["3rem", { lineHeight: "1" }],
    "6xl": ["3.75rem", { lineHeight: "1" }],
  },
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
};

export const spacing = {
  0: "0px",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
  40: "10rem",
  48: "12rem",
  56: "14rem",
  64: "16rem",
};

export const borderRadius = {
  none: "0px",
  sm: "0.125rem",
  DEFAULT: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
};

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "0 0 #0000",
};

// 모바일 우선 브레이크포인트
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// 컴포넌트별 기본 스타일
export const components = {
  button: {
    base: "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    sizes: {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-6 py-3 text-lg",
    },
    variants: {
      primary:
        "bg-primary-600 text-black hover:bg-primary-700 focus:ring-primary-500",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
      success:
        "bg-success-600 text-black hover:bg-success-700 focus:ring-success-500",
      danger:
        "bg-danger-600 text-black hover:bg-danger-700 focus:ring-danger-500",
      warning:
        "bg-warning-600 text-black hover:bg-warning-700 focus:ring-warning-500",
      outline:
        "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    },
  },
  card: {
    base: "bg-white rounded-lg shadow-sm border border-gray-200",
    padding: {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  input: {
    base: "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
    sizes: {
      sm: "px-3 py-2 text-sm",
      md: "px-3 py-2.5 text-base",
      lg: "px-4 py-3 text-lg",
    },
    states: {
      error: "border-danger-300 focus:ring-danger-500",
      success: "border-success-300 focus:ring-success-500",
      disabled: "bg-gray-100 cursor-not-allowed",
    },
  },
  badge: {
    base: "inline-flex items-center font-medium rounded-full",
    sizes: {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1 text-base",
    },
    variants: {
      primary: "bg-primary-100 text-primary-800",
      success: "bg-success-100 text-success-800",
      danger: "bg-danger-100 text-danger-800",
      warning: "bg-warning-100 text-warning-800",
      gray: "bg-gray-100 text-gray-800",
    },
  },
};

// 다크모드 색상 (향후 확장용)
export const darkColors = {
  primary: colors.primary,
  success: colors.success,
  danger: colors.danger,
  warning: colors.warning,
  gray: {
    50: "#18181b",
    100: "#27272a",
    200: "#3f3f46",
    300: "#52525b",
    400: "#71717a",
    500: "#a1a1aa",
    600: "#d4d4d8",
    700: "#e4e4e7",
    800: "#f4f4f5",
    900: "#fafafa",
    950: "#ffffff",
  },
  white: "#000000",
  black: "#ffffff",
  transparent: "transparent",
};

// CSS 변수로 내보내기
export const createCSSVariables = (isDark = false) => {
  const colorPalette = isDark ? darkColors : colors;

  const variables: Record<string, string> = {};

  // 색상 변수 생성
  Object.entries(colorPalette).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === "string") {
      variables[`--color-${colorName}`] = colorValue;
    } else {
      Object.entries(colorValue).forEach(([shade, value]) => {
        variables[`--color-${colorName}-${shade}`] = value;
      });
    }
  });

  return variables;
};
