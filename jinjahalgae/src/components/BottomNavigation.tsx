/**
 * 하단 네비게이션 바 - 모바일 우선 디자인
 * - 홈, 알림, 프로필 링크
 * - 현재 페이지 하이라이트
 * - 터치 친화적인 디자인
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, User } from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "홈",
      icon: <Home className="w-6 h-6" />,
      active: pathname === "/",
    },
    {
      href: "/notifications",
      label: "알림",
      icon: <Bell className="w-6 h-6" />,
      active: pathname === "/notifications",
    },
    {
      href: "/profile",
      label: "마이페이지",
      icon: <User className="w-6 h-6" />,
      active: pathname === "/profile",
    },
  ];

  // 특정 페이지에서는 하단 네비게이션을 숨김
  const hideNavigation = ["/auth", "/invite", "/contracts/create"].some(
    (path) => pathname.startsWith(path)
  );

  if (hideNavigation) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t safe-area-bottom z-20"
      style={{
        backgroundColor: "var(--color-white)",
        borderTopColor: "var(--color-gray-200)",
      }}
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex flex-col items-center 
              py-3 px-2 
              min-w-0 flex-1 
              transition-all duration-200
              hover:scale-105
              active:scale-95
              ${item.active ? "" : "hover:bg-gray-50"}
            `}
            style={{
              color: item.active
                ? "var(--color-primary-600)"
                : "var(--color-gray-500)",
            }}
          >
            <div className="mb-1">{item.icon}</div>
            <span
              className="text-xs font-medium"
              style={{
                color: item.active
                  ? "var(--color-primary-600)"
                  : "var(--color-gray-500)",
              }}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
