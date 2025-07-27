/**
 * 알림 관련 API 함수들
 * - 알림 목록 조회
 * - 알림 읽음 처리
 */

import { apiRequest } from "../api";
import {
  GetAllNotificationSwaggerResponse,
  CountUnreadNotificationSwaggerResponse,
} from "../../../docs/data-contracts";

// 모든 알림 조회
export const getAllNotifications =
  async (): Promise<GetAllNotificationSwaggerResponse> => {
    return apiRequest<GetAllNotificationSwaggerResponse>("/notifications", {
      method: "GET",
    });
  };

// 읽지 않은 알림 개수 조회
export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await apiRequest<{ success: boolean; result: number }>("/notifications/unread", {
    method: "GET",
  });
  return response?.result ?? 0;
};

// 알림 읽음 처리
export const readNotification = async (
  notificationId: number
): Promise<void> => {
  return apiRequest<void>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
};

// 알림 삭제
export const deleteNotification = async (
  notificationId: number
): Promise<void> => {
  return apiRequest<void>(`/notifications/${notificationId}`, {
    method: "DELETE",
  });
};

// 모든 알림 삭제
export const deleteAllNotifications = async (): Promise<void> => {
  return apiRequest<void>("/notifications", {
    method: "DELETE",
  });
};
