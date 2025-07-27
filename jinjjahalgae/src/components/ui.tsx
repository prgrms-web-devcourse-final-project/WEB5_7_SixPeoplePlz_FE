/**
 * 공통 컴포넌트 모음 - 모바일 우선 디자인
 * - 로딩 스피너
 * - 모달
 * - 버튼
 * - 카드
 * - 입력 필드
 * - 배지
 * - 진행률 바
 */

import React, { ReactNode } from "react";
import { components } from "@/styles/theme";
import { X, Copy } from "lucide-react";

// CopyableField 컴포넌트 - 예시 코드 스타일 적용
interface CopyableFieldProps {
  label: string;
  value: string;
}

export function CopyableField({ label, value }: CopyableFieldProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="w-full">
      <label className="text-sm font-semibold text-[#6b7280] mb-1.5 block">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="flex-grow bg-white border border-[#e5e7eb] rounded-lg px-4 py-3 text-[#6b7280] truncate">
          {value}
        </div>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 p-3 bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-50 transition-colors"
          aria-label={`${label} 복사`}
        >
          {copied ? (
            <span className="text-xs font-bold text-[#16a34a]">복사됨!</span>
          ) : (
            <Copy size={20} className="text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
}

// 로딩 스피너 - 예시 코드 스타일 적용
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-primary-600 rounded-full animate-spin`}
        style={{
          borderColor: "#e5e7eb",
          borderTopColor: "#2563eb",
        }}
      ></div>
    </div>
  );
}

// 통일된 모달 시스템 - 모바일 우선
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  hideHeader?: boolean;
  onBackdropClick?: () => void;
  className?: string;
  footer?: ReactNode;
  headerIcon?: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  hideHeader = false,
  onBackdropClick,
  className = "",
  footer,
  headerIcon,
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm w-full",
    md: "max-w-md w-full",
    lg: "max-w-lg w-full",
    xl: "max-w-2xl w-full",
    full: "max-w-4xl w-full h-[95vh]", // 전체 화면
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (onBackdropClick) {
        onBackdropClick();
      } else {
        onClose();
      }
    }
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black !bg-opacity-50 backdrop-blur-sm transition-all duration-300 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`
          ${sizeClasses[size]} 
          bg-white
          rounded-2xl
          shadow-2xl
          max-h-[90vh] 
          overflow-hidden
          transform transition-all duration-300 ease-out
          scale-100 opacity-100
          flex flex-col
          mx-auto
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        {!hideHeader && (title || showCloseButton || headerIcon) && (
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-3">
              {headerIcon && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                  {headerIcon}
                </div>
              )}
              {title && (
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {title}
                </h3>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200"
                aria-label="닫기"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div
            className={`py-4 ${
              !hideHeader && (title || showCloseButton || headerIcon)
                ? ""
                : "pt-6"
            }`}
          >
            {children}
          </div>
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-100 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// 모달 하단 액션 버튼 영역 컴포넌트
interface ModalActionsProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "spaced" | "stacked";
  noPadding?: boolean;
}

export function ModalActions({
  children,
  className = "",
  variant = "default",
  noPadding = false,
}: ModalActionsProps) {
  const variantClasses = {
    default: "flex gap-3",
    spaced: "flex gap-3 justify-between",
    stacked: "flex flex-col gap-3",
  };

  return (
    <div
      className={`${variantClasses[variant]} ${
        noPadding ? "" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

// 모달 섹션 컴포넌트 - 일관된 간격과 스타일링
interface ModalSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "highlighted" | "warning" | "info";
}

export function ModalSection({
  title,
  children,
  className = "",
  variant = "default",
}: ModalSectionProps) {
  const variantClasses = {
    default: "",
    highlighted: "bg-gray-50 border border-gray-200 rounded-lg p-4",
    warning: "bg-orange-50 border border-orange-200 rounded-lg p-4",
    info: "bg-blue-50 border border-blue-200 rounded-lg p-4",
  };

  return (
    <div className={`space-y-3 ${variantClasses[variant]} ${className}`}>
      {title && <h4 className="font-medium text-gray-800 mb-3">{title}</h4>}
      {children}
    </div>
  );
}

// 버튼 - 예시 코드 스타일 적용
interface ButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "outline"
    | "ghost"
    | "dark";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}

// --- 예시 코드 색상 팔레트 ---
const BUTTON_COLORS = {
  blue: "#2563eb",
  lightBlue: "#93c5fd",
  bgLightBlue: "#f0f5ff",
  gray: "#e5e7eb",
  red: "#ef4444",
  lightRed: "#fee2e2",
  grayText: "#6b7280",
  green: "#16a34a",
  lightGreen: "#eafdf0",
  yellow: "#facc15",
  darkYellow: "#b45309",
  lightYellow: "#fef3c7",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  children,
  onClick,
  type = "button",
  className = "",
}: ButtonProps) {
  const sizeMap = {
    sm: {
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
    },
    md: {
      padding: "1rem",
      fontSize: "1rem",
    },
    lg: {
      padding: "1.25rem 1.5rem",
      fontSize: "1.125rem",
    },
  };

  const variantMap = {
    primary: {
      backgroundColor: BUTTON_COLORS.blue,
      color: "white",
      border: "none",
    },
    dark: {
      backgroundColor: BUTTON_COLORS.grayText,
      color: "white",
      border: "none",
    },
    outline: {
      backgroundColor: "transparent",
      color: BUTTON_COLORS.grayText,
      border: `1px solid ${BUTTON_COLORS.gray}`,
    },
    ghost: {
      backgroundColor: "transparent",
      color: BUTTON_COLORS.grayText,
      border: "none",
    },
    secondary: {
      backgroundColor: BUTTON_COLORS.gray,
      color: BUTTON_COLORS.grayText,
      border: "none",
    },
    danger: {
      backgroundColor: BUTTON_COLORS.red,
      color: "white",
      border: "none",
    },
    success: {
      backgroundColor: BUTTON_COLORS.green,
      color: "white",
      border: "none",
    },
    warning: {
      backgroundColor: BUTTON_COLORS.yellow,
      color: "black",
      border: "none",
    },
  };

  const baseStyle = {
    ...sizeMap[size],
    width: fullWidth ? "100%" : "auto",
    fontWeight: 700,
    borderRadius: "0.75rem",
    transition: "opacity 0.2s",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.5 : 1,
    fontFamily: "Pretendard-Regular, sans-serif",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    ...variantMap[variant],
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={baseStyle}
      className={className}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoadingSpinner size="sm" />
          <span style={{ marginLeft: "0.5rem" }}>처리중...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// 카드 - 예시 코드 스타일 적용
interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
  shadow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = "",
  padding = "md",
  shadow = true,
  hover = false,
  onClick,
}: CardProps) {
  const style = {
    backgroundColor: "var(--surface-color)",
    borderRadius: "1rem",
    padding:
      padding === "lg"
        ? "1.5rem"
        : padding === "md"
        ? "1.25rem"
        : padding === "sm"
        ? "1rem"
        : "0",
    boxShadow: shadow ? "0 0.25rem 0.75rem rgba(0, 0, 0, 0.05)" : "none",
    marginBottom: "1rem",
    transition: hover ? "box-shadow 0.2s ease-in-out" : "none",
    cursor: onClick ? "pointer" : "default",
  };

  const hoverStyle = hover
    ? {
        ":hover": {
          boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.1)",
        },
      }
    : {};

  return (
    <div
      onClick={onClick}
      style={style}
      className={className}
      onMouseEnter={
        hover
          ? (e) => {
              e.currentTarget.style.boxShadow =
                "0 0.5rem 1rem rgba(0, 0, 0, 0.1)";
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              e.currentTarget.style.boxShadow =
                "0 0.25rem 0.75rem rgba(0, 0, 0, 0.05)";
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

// 진행률 바 - 예시 코드 스타일 적용
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "primary" | "success" | "danger" | "warning";
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  max = 100,
  color = "primary",
  showText = true,
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const heightMap = {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
  };

  const colorMap = {
    primary: "var(--primary-color)",
    success: "#22c55e",
    danger: "#ef4444",
    warning: "#f97316",
  };

  const barStyle = {
    height: heightMap[size],
    backgroundColor: "var(--border-color)",
    borderRadius: "999px",
    overflow: "hidden" as const,
  };

  const fillStyle = {
    height: "100%",
    backgroundColor: colorMap[color],
    borderRadius: "999px",
    width: `${percentage}%`,
    transition: "width 0.5s ease-in-out",
  };

  return (
    <div>
      {showText && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span style={{ color: "var(--text-color-normal)" }}>진행률</span>
          <span
            style={{
              fontWeight: 600,
              color: "var(--text-color-strong)",
            }}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div style={barStyle}>
        <div style={fillStyle} />
      </div>
    </div>
  );
}

// 상태 배지 - 강한 대비
interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "success" | "danger" | "warning" | "gray";
  size?: "sm" | "md" | "lg";
}

export function Badge({ children, variant = "gray", size = "sm" }: BadgeProps) {
  const baseClasses = components.badge.base;
  const sizeClasses = components.badge.sizes[size];
  const variantClasses = components.badge.variants[variant];

  return (
    <span className={`${baseClasses} ${sizeClasses} ${variantClasses}`}>
      {children}
    </span>
  );
}

// 입력 필드 - 모바일 친화적
interface InputProps {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  size = "md",
}: InputProps) {
  const baseClasses = components.input.base;
  const sizeClasses = components.input.sizes[size];
  const errorClasses = error ? components.input.states.error : "";
  const disabledClasses = disabled ? components.input.states.disabled : "";

  return (
    <div>
      {label && (
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-gray-700)" }}
        >
          {label}
          {required && (
            <span style={{ color: "var(--color-danger-500)" }} className="ml-1">
              *
            </span>
          )}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${baseClasses} ${sizeClasses} ${errorClasses} ${disabledClasses}`}
      />
      {error && (
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-danger-600)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// 텍스트 영역 - 모바일 최적화
interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  size?: "sm" | "md" | "lg";
}

export function Textarea({
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  size = "md",
}: TextareaProps) {
  const baseClasses = components.input.base;
  const sizeClasses = components.input.sizes[size];
  const errorClasses = error ? components.input.states.error : "";
  const disabledClasses = disabled ? components.input.states.disabled : "";

  return (
    <div>
      {label && (
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-gray-700)" }}
        >
          {label}
          {required && (
            <span style={{ color: "var(--color-danger-500)" }} className="ml-1">
              *
            </span>
          )}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`${baseClasses} ${sizeClasses} ${errorClasses} ${disabledClasses} resize-none`}
      />
      <div className="flex justify-between items-center mt-1">
        {error && (
          <p className="text-sm" style={{ color: "var(--color-danger-600)" }}>
            {error}
          </p>
        )}
        {maxLength && (
          <p
            className="text-sm ml-auto"
            style={{ color: "var(--color-gray-500)" }}
          >
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

// 통일된 바텀시트 시스템 - 모바일 우선
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  hideHeader?: boolean;
  onBackdropClick?: () => void;
  className?: string;
  footer?: ReactNode;
  headerIcon?: ReactNode;
  snapPoints?: string[];
  defaultSnap?: number;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  height = "lg",
  showCloseButton = true,
  hideHeader = false,
  onBackdropClick,
  className = "",
  footer,
  headerIcon,
}: BottomSheetProps) {
  if (!isOpen) return null;

  const heightClasses = {
    sm: "max-h-[33dvh]",
    md: "max-h-[50dvh]",
    lg: "max-h-[67dvh]",
    xl: "max-h-[83dvh]",
    full: "max-h-[100dvh]",
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (onBackdropClick) {
        onBackdropClick();
      } else {
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300"
      onClick={handleBackdropClick}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className={`
          w-full max-w-md mx-auto
          ${heightClasses[height]}
          min-h-0
          bg-white
          rounded-t-2xl
          shadow-2xl
          overflow-hidden
          transform transition-all duration-300 ease-out
          translate-y-0 opacity-100
          flex flex-col
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* BottomSheet Header */}
        {!hideHeader && (title || showCloseButton || headerIcon) && (
          <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-3">
              {headerIcon && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                  {headerIcon}
                </div>
              )}
              {title && (
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {title}
                </h3>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200"
                aria-label="닫기"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* BottomSheet Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="py-4">{children}</div>
        </div>

        {/* BottomSheet Footer */}
        {footer && (
          <div
            className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-100 bg-gray-50"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// 바텀시트 섹션 컴포넌트 - 일관된 간격과 스타일링
interface BottomSheetSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "highlighted" | "warning" | "info";
}

export function BottomSheetSection({
  title,
  children,
  className = "",
  variant = "default",
}: BottomSheetSectionProps) {
  const variantClasses = {
    default: "",
    highlighted: "bg-gray-50 border border-gray-200 rounded-lg p-4",
    warning: "bg-orange-50 border border-orange-200 rounded-lg p-4",
    info: "bg-blue-50 border border-blue-200 rounded-lg p-4",
  };

  return (
    <div className={`space-y-3 ${variantClasses[variant]} ${className}`}>
      {title && <h4 className="font-medium text-gray-800 mb-3">{title}</h4>}
      {children}
    </div>
  );
}

// Alert 모달 컴포넌트 - alert() 대체용
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  confirmText?: string;
  showCancel?: boolean;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  confirmText = "확인",
  showCancel = false,
  cancelText = "취소",
  onConfirm,
  onCancel,
}: AlertModalProps) {
  const typeConfig = {
    info: {
      icon: "ℹ️",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    success: {
      icon: "✅",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    warning: {
      icon: "⚠️",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    error: {
      icon: "❌",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  };

  const config = typeConfig[type];

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      hideHeader={!title}
      footer={
        <ModalActions variant="default" className="justify-end">
          {showCancel && (
            <Button variant="outline" onClick={handleCancel} className="">
              {cancelText}
            </Button>
          )}
          <Button
            variant={type === "error" ? "danger" : "primary"}
            onClick={handleConfirm}
            className="ml-2"
          >
            {confirmText}
          </Button>
        </ModalActions>
      }
    >
      <div
        className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{config.icon}</span>
          <div className="flex-1">
            <p className="text-gray-900 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Alert 훅 - 전역 상태 관리
interface AlertState {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  confirmText?: string;
  showCancel?: boolean;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useAlert() {
  const [alertState, setAlertState] = React.useState<AlertState>({
    isOpen: false,
    message: "",
  });

  const showAlert = React.useCallback((options: Omit<AlertState, "isOpen">) => {
    setAlertState({
      ...options,
      isOpen: true,
    });
  }, []);

  const hideAlert = React.useCallback(() => {
    setAlertState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const AlertComponent = React.useCallback(
    () => (
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        showCancel={alertState.showCancel}
        cancelText={alertState.cancelText}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
      />
    ),
    [alertState, hideAlert]
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
}
