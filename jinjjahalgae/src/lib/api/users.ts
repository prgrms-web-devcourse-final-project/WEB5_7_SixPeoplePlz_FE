/**
 * 사용자 관련 API 함수들
 * - 사용자 정보 조회
 * - 사용자 정보 수정 (닉네임)
 * - 회원 탈퇴
 */

import { apiRequest } from "../api";
import {
  MyInfoSwaggerResponse,
  UpdateMyInfoRequest,
} from "../../../docs/data-contracts";

// 사용자 정보 조회
export const getMyInfo = async (): Promise<MyInfoSwaggerResponse> => {
  return apiRequest<MyInfoSwaggerResponse>("/users/me", {
    method: "GET",
  });
};

// 사용자 정보 수정 (닉네임)
export const updateMyInfo = async (
  data: UpdateMyInfoRequest
): Promise<MyInfoSwaggerResponse> => {
  return apiRequest<MyInfoSwaggerResponse>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

// 회원 탈퇴
export const deleteAccount = async (): Promise<void> => {
  return apiRequest<void>("/users/me", {
    method: "DELETE",
  });
};
