/**
 * 초대 관련 API 함수들
 * - 초대링크 생성
 * - 초대링크 검증
 * - 계약서 조회 (초대링크 통해)
 */

import { apiRequest } from "../api";
import {
  InviteContractInfoResponse,
  CreateInviteLinkSwaggerResponse,
  VerifyInvitePasswordRequest,
  VerifyPasswordSwaggerResponse,
} from "../../../docs/data-contracts";

// 초대링크 생성
export const createInviteLink = async (
  contractId: number
): Promise<CreateInviteLinkSwaggerResponse> => {
  return apiRequest<CreateInviteLinkSwaggerResponse>(`/invites/${contractId}`, {
    method: "POST",
  });
};

// 초대링크 존재 확인
export const checkInviteExists = async (inviteCode: string): Promise<void> => {
  return apiRequest<void>(`/invites/${inviteCode}`, {
    method: "GET",
  });
};

// 초대링크 비밀번호 확인
export const verifyInvitePassword = async (
  inviteCode: string,
  data: VerifyInvitePasswordRequest
): Promise<VerifyPasswordSwaggerResponse> => {
  return apiRequest<VerifyPasswordSwaggerResponse>(
    `/invites/${inviteCode}/verify`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};

// 초대 계약서 상세 조회
export const getContractDetailByInvite = async (
  inviteCode: string,
  contractUuid: string
): Promise<{ success: boolean; result: InviteContractInfoResponse }> => {
  return apiRequest<{ success: boolean; result: InviteContractInfoResponse }>(
    `/invites/${inviteCode}/detail/${contractUuid}`,
    {
      method: "GET",
    }
  );
};
