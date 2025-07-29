/**
 * 알림 페이지
 * - 알림 목록 표시
 * - 알림 타입별 아이콘 및 색상 구분
 * - 개별 알림 삭제
 * - 전체 알림 삭제
 * - 알림 클릭 시 해당 계약 페이지로 이동
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAllNotifications,
  readNotification,
  deleteNotification,
  deleteAllNotifications,
} from "@/lib/api/notifications";
import { NotificationGetResponse } from "../../../docs/data-contracts";
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  XCircle,
  Trash2,
  Camera,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { useAlert } from "@/components/ui";
import { CommonHeader } from "@/components/CommonHeader";
import { Button } from "@/components/ui";

// 글로벌 스타일
const GlobalStyles = () => (
  <style jsx global>{`
    :root {
      --color-blue: #2563eb;
      --color-sky-blue: #93c5fd;
      --color-background: #f0f5ff;
      --color-gray-border: #e5e7eb;
      --color-gray-text: #6b7280;
      --color-red: #ef4444;
      --color-green: #15803d;
      --color-yellow: #facc15;
      --color-white: #ffffff;
      --color-black: #1f2937;
      --color-blue-light: #dbeafe;
      --color-green-light: #d1fae5;
      --color-red-light: #fee2e2;
      --color-yellow-light: #fef9c3;
      --color-orange: #f97316;
      --color-orange-light: #ffedd5;
      --spacing-xs: 0.5rem;
      --spacing-sm: 0.75rem;
      --spacing-md: 1rem;
      --spacing-lg: 1.25rem;
      --spacing-xl: 1.5rem;
      --font-size-xs: 0.75rem;
      --font-size-sm: 0.875rem;
      --font-size-base: 1rem;
      --font-size-lg: 1.125rem;
      --border-radius-lg: 0.75rem;
      --border-radius-full: 9999px;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      max-width: 480px;
      height: 100%;
      margin: 0 auto;
      background-color: var(--color-white);
      box-shadow: 0 0 1.25rem rgba(0, 0, 0, 0.05);
    }
    .app-header {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: var(--spacing-md) var(--spacing-xl);
      border-bottom: 1px solid var(--color-gray-border);
      flex-shrink: 0;
    }
    .header-back-button {
      position: absolute;
      left: var(--spacing-xl);
      top: 50%;
      transform: translateY(-50%);
      width: 1.5rem;
      height: 1.5rem;
      color: var(--color-black);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .header-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
    }
    .app-main {
      flex-grow: 1;
      background-color: var(--color-background);
      overflow-y: auto;
    }
    .notification-list {
      display: flex;
      flex-direction: column;
    }
    .notification-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-lg) var(--spacing-xl);
      background-color: var(--color-white);
      border-bottom: 1px solid var(--color-gray-border);
    }
    .notification-list > .notification-item:last-child {
      border-bottom: none;
    }
    .notification-icon-wrapper {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--border-radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .notification-icon {
      width: 1.5rem;
      height: 1.5rem;
    }
    .notification-content {
      flex-grow: 1;
      padding-top: 0.125rem;
    }
    .notification-message {
      font-size: var(--font-size-sm);
      line-height: 1.5;
      color: var(--color-black);
    }
    .notification-timestamp {
      font-size: var(--font-size-xs);
      color: var(--color-gray-text);
      margin-top: var(--spacing-xs);
    }
    .notification-item--info .notification-icon-wrapper {
      background-color: var(--color-blue-light);
    }
    .notification-item--info .notification-icon {
      color: var(--color-blue);
    }
    .notification-item--success .notification-icon-wrapper {
      background-color: var(--color-green-light);
    }
    .notification-item--success .notification-icon {
      color: var(--color-green);
    }
    .notification-item--reminder .notification-icon-wrapper {
      background-color: var(--color-orange-light);
    }
    .notification-item--reminder .notification-icon {
      color: var(--color-orange);
    }
    .notification-item--error .notification-icon-wrapper {
      background-color: var(--color-red-light);
    }
    .notification-item--error .notification-icon {
      color: var(--color-red);
    }
    .notification-item--warning .notification-icon-wrapper {
      background-color: var(--color-red-light);
    }
    .notification-item--warning .notification-icon {
      color: var(--color-red);
    }
    .notification-delete-btn {
      opacity: 0.7;
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--spacing-xs);
      border-radius: var(--border-radius-full);
      transition: background 0.2s, color 0.2s;
      align-self: flex-start;
      margin-left: var(--spacing-xs);
    }
    .notification-delete-btn:hover {
      background: var(--color-red-light);
      color: var(--color-red);
      opacity: 1;
    }
  `}</style>
);

function getNotificationTypeClass(type: string) {
  switch (type) {
    case "PROOF_APPROVED":
    case "PROOF_ACCEPTED":
    case "CONTRACT_ENDED_SUCCESS":
      return "notification-item--success";
    case "PROOF_REJECTED":
    case "CONTRACT_ENDED_FAIL":
      return "notification-item--error";
    case "PROOF_SUBMISSION":
    case "PROOF_REQUEST":
    case "PROOF_ADDED":
    case "REPROOF_ADDED":
      return "notification-item--reminder";
    case "CONTRACT_AUTO_DELETED":
    case "SUPERVISOR_ADDED":
    case "SUPERVISOR_WITHDRAWN":
    case "CONTRACT_STARTED":
    case "FEEDBACK_ADDED":
      return "notification-item--info";
    default:
      return "notification-item--info";
  }
}

function getNotificationIconSVG(type: string) {
  // Return lucide-react icons matching the design system
  switch (type) {
    case "PROOF_APPROVED":
    case "PROOF_ACCEPTED":
    case "CONTRACT_ENDED_SUCCESS":
      return <CheckCircle className="notification-icon" />;
    case "PROOF_REJECTED":
    case "CONTRACT_ENDED_FAIL":
      return <XCircle className="notification-icon" />;
    case "PROOF_SUBMISSION":
    case "PROOF_REQUEST":
    case "PROOF_ADDED":
    case "REPROOF_ADDED":
      return <Camera className="notification-icon" />;
    case "CONTRACT_AUTO_DELETED":
    case "SUPERVISOR_ADDED":
    case "SUPERVISOR_WITHDRAWN":
    case "CONTRACT_STARTED":
    case "FEEDBACK_ADDED":
    default:
      return <Bell className="notification-icon" />;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationGetResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const { showAlert, AlertComponent } = useAlert();
  const [pendingDeleteAll, setPendingDeleteAll] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getAllNotifications();
        if (response.success) {
          let notificationsList: any[] = [];
          if (
            response.result &&
            response.result.content &&
            Array.isArray(response.result.content)
          ) {
            notificationsList = response.result.content;
          } else if (Array.isArray(response.result)) {
            notificationsList = response.result;
          } else if (response.result && typeof response.result === "object") {
            notificationsList = [response.result];
          }
          const transformedNotifications = notificationsList.map(
            (notification) => ({
              notificationId: notification.notificationId,
              content: notification.message || notification.content || "",
              readStatus:
                notification.isRead !== undefined
                  ? notification.isRead
                  : notification.readStatus || false,
              type: notification.type || "",
              contractId: notification.contractId || null,
              targetUserId: notification.targetUserId || 0,
            })
          );
          const validNotifications = transformedNotifications.filter(
            (notification) =>
              notification &&
              typeof notification.notificationId === "number" &&
              typeof notification.content === "string" &&
              notification.content.length > 0
          );
          setNotifications(validNotifications);
        } else {
          showAlert({
            message: "알림 목록을 불러오는데 실패했습니다.",
            type: "error",
          });
        }
      } catch (error) {
        showAlert({
          message: "알림 목록을 불러오는데 실패했습니다.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleReadNotification = async (notificationId: number) => {
    try {
      await readNotification(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, readStatus: true } : n
        )
      );
    } catch (error) {}
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== notificationId)
      );
    } catch (error) {
      showAlert({ message: "알림 삭제에 실패했습니다.", type: "error" });
    }
  };

  const handleDeleteAll = async () => {
    setPendingDeleteAll(true);
    showAlert({
      message: "모든 알림을 삭제하시겠습니까?",
      showCancel: true,
      confirmText: "삭제",
      cancelText: "취소",
      type: "warning",
      onConfirm: async () => {
        try {
          await deleteAllNotifications();
          setNotifications([]);
        } catch (error) {
          showAlert({
            message: "모든 알림 삭제에 실패했습니다.",
            type: "error",
          });
        } finally {
          setPendingDeleteAll(false);
        }
      },
      onCancel: () => setPendingDeleteAll(false),
    });
  };

  const getRedirectUrl = (type: string, contractId?: number) => {
    if (!contractId) return "/";
    switch (type) {
      case "SUPERVISOR_ADDED":
      case "SUPERVISOR_WITHDRAWN":
      case "CONTRACT_STARTED":
        return `/contracts/${contractId}`;
      case "CONTRACT_ENDED_FAIL":
      case "CONTRACT_ENDED_SUCCESS":
        return `/profile/history`;
      case "CONTRACT_AUTO_DELETED":
        return "/";
      case "PROOF_ADDED":
      case "REPROOF_ADDED":
        return `/supervise/${contractId}`;
      case "PROOF_ACCEPTED":
      case "PROOF_REJECTED":
      case "FEEDBACK_ADDED":
        return `/contracts/${contractId}`;
      default:
        return `/contracts/${contractId}`;
    }
  };

  const handleNotificationClick = (notification: NotificationGetResponse) => {
    if (!notification.readStatus) {
      handleReadNotification(notification.notificationId);
    }
    const redirectUrl = getRedirectUrl(
      notification.type,
      notification.contractId
    );
    router.push(redirectUrl);
  };

  return (
    <>
      <GlobalStyles />
      <AlertComponent />
      <div className="min-h-screen bg-[#f0f5ff] flex justify-center">
        <div className="container-mobile">
          <CommonHeader
            title="알림"
            rightContent={
              !loading && notifications.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteAll}
                  disabled={pendingDeleteAll}
                  loading={pendingDeleteAll}
                  aria-label="모든 알림 삭제"
                  className="!p-2"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </Button>
              ) : null
            }
          />
                      <main className="flex-grow overflow-y-auto bg-[#f0f5ff]">
            <ul className="notification-list">
              {loading ? (
                <li className="notification-item">
                  <div className="notification-content">
                    <span className="notification-message">
                      알림 로딩 중...
                    </span>
                  </div>
                </li>
              ) : notifications.length === 0 ? (
                <li className="notification-item">
                  <div className="notification-content">
                    <span className="notification-message">
                      알림이 없습니다
                    </span>
                  </div>
                </li>
              ) : (
                notifications.map((notification) => {
                  const notificationId = notification?.notificationId;
                  const content = notification?.content || "";
                  const readStatus = notification?.readStatus || false;
                  const type = notification?.type || "";
                  const contractId = notification?.contractId;
                  if (!notificationId || !content) return null;
                  return (
                    <li
                      key={notificationId}
                      className={`notification-item ${getNotificationTypeClass(
                        type
                      )}`}
                      style={readStatus ? { opacity: 0.6 } : {}}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-icon-wrapper">
                        {getNotificationIconSVG(type)}
                      </div>
                      <div className="notification-content">
                        <p className="notification-message">
                          <span
                            dangerouslySetInnerHTML={{
                              __html: content.replace(
                                /'([^']+)'/g,
                                "<strong>$1</strong>"
                              ),
                            }}
                          />
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notificationId);
                        }}
                        className="notification-delete-btn"
                        aria-label="알림 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </main>
        </div>
      </div>
    </>
  );
}
