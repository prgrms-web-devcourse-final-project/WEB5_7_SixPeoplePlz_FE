/**
 * 계약 관련 API 함수들
 * - 계약 생성, 조회, 수정, 삭제
 * - 계약 목록 조회 (내 계약, 감독 계약, 히스토리)
 * - 계약 서명, 포기
 */

import { apiRequest } from "../api";
import {
  CreateContractRequest,
  ContractPreviewResponse,
  ContractUpdateRequest,
  Type계약생성응답,
  PageContractListResponse,
  Type계약목록조회응답,
  ContractBasicResponse,
} from "../../../docs/data-contracts";

// 계약 생성 (계약 서명 포함)
export const createContract = async (
  data: CreateContractRequest
): Promise<Type계약생성응답> => {
  return apiRequest<Type계약생성응답>("/contracts", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// 계약 목록 조회 (내 계약)
export const getMyContracts = async (
  role: "CONTRACTOR" | "SUPERVISOR",
  page?: number,
  size?: number
): Promise<Type계약목록조회응답> => {
  const params = new URLSearchParams();
  params.append("role", role);
  if (page !== undefined) {
    params.append("page", String(page));
  }
  if (size !== undefined) {
    params.append("size", String(size));
  }

  const queryString = params.toString();
  const url = `/contracts?${queryString}`;

  return apiRequest<Type계약목록조회응답>(url, {
    method: "GET",
  });
};

// 계약 상세 조회
export const getContract = async (
  contractId: number
): Promise<{ success: boolean; result: ContractPreviewResponse }> => {
  return apiRequest<{ success: boolean; result: ContractPreviewResponse }>(
    `/contracts/${contractId}`,
    {
      method: "GET",
    }
  );
};

// 계약 포기 (시작 전)
export const deleteContract = async (contractId: number): Promise<void> => {
  return apiRequest<void>(`/contracts/${contractId}`, {
    method: "DELETE",
  });
};

// 계약 중도 포기
export const withdrawContract = async (contractId: number): Promise<void> => {
  return apiRequest<void>(`/contracts/${contractId}/withdraw`, {
    method: "PATCH",
  });
};

// 감독으로 계약 참여 (서명) - UUID 버전
export const signContractAsSupervisor = async (
  contractIdOrUuid: number | string,
  imageKey: string
): Promise<void> => {
  return apiRequest<void>(`/contracts/${contractIdOrUuid}/signature`, {
    method: "POST",
    body: JSON.stringify({ imageKey }),
  });
};

// 감독 참여 철회 (계약 시작 전)
export const withdrawSupervisorBefore = async (
  contractId: number
): Promise<void> => {
  return apiRequest<void>(`/contracts/${contractId}/supervisors/withdraw`, {
    method: "DELETE",
  });
};

// 감독 중도 포기 (계약 진행 중)
export const withdrawSupervisorDuring = async (
  contractId: number
): Promise<void> => {
  return apiRequest<void>(`/contracts/${contractId}/supervisors/withdraw`, {
    method: "PATCH",
  });
};

// 계약 수정
export const updateContract = async (
  contractId: number,
  data: ContractUpdateRequest
): Promise<{ success: boolean; result: ContractPreviewResponse }> => {
  return apiRequest<{ success: boolean; result: ContractPreviewResponse }>(
    `/contracts/${contractId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

// 계약 제목 정보 조회
export const getContractTitleInfo = async (
  contractId: number
): Promise<{ success: boolean; result: { title: string; goal: string } }> => {
  return apiRequest<{
    success: boolean;
    result: { title: string; goal: string };
  }>(`/contracts/${contractId}/titleInfo`, {
    method: "GET",
  });
};

// 계약 미리보기 조회
export const getContractPreview = async (
  contractId: number
): Promise<{ success: boolean; result: ContractPreviewResponse }> => {
  return apiRequest<{ success: boolean; result: ContractPreviewResponse }>(
    `/contracts/${contractId}/preview`,
    {
      method: "GET",
    }
  );
};

// 계약 히스토리 조회
export const getContractHistory = async (
  role: "CONTRACTOR" | "SUPERVISOR",
  keyword?: string,
  endDate?: string,
  status?: string,
  page?: number,
  size?: number
): Promise<Type계약목록조회응답> => {
  const params = new URLSearchParams();
  params.append("role", role);
  if (keyword) params.append("keyword", keyword);
  if (endDate) params.append("endDate", endDate);
  if (status) params.append("status", status);
  if (page !== undefined) params.append("page", String(page));
  if (size !== undefined) params.append("size", String(size));

  const queryString = params.toString();
  const url = `/contracts/history?${queryString}`;

  return apiRequest<Type계약목록조회응답>(url, {
    method: "GET",
  });
};
