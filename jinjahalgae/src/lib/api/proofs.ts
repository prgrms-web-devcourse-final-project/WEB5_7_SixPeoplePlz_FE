/**
 * 인증 관련 API 함수들
 * - 인증 생성, 조회
 * - 재인증
 * - 감독자 인증 처리 (피드백)
 */

import { apiRequest } from "../api";
import {
  CreateFeedbackRequest,
  ProofCreateRequest,
  ProofDetailResponse,
  SupervisorProofListResponse,
} from "../../../docs/data-contracts";

// 인증 생성
export const createProof = async (
  contractId: number,
  data: ProofCreateRequest
): Promise<void> => {
  return apiRequest<void>(`/contracts/${contractId}/proofs`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// 인증 상세 정보 조회
export const getProof = async (
  proofId: number
): Promise<ProofDetailResponse> => {
  return apiRequest<ProofDetailResponse>(`/proofs/${proofId}`, {
    method: "GET",
  });
};

// 계약자용 인증 목록 조회
export const getContractorProofsByMonth = async (
  contractId: number,
  year: number,
  month: number
): Promise<SupervisorProofListResponse[]> => {
  const response = await apiRequest<any>(
    `/contractors/contracts/${contractId}/proofs?year=${year}&month=${month}`,
    {
      method: "GET",
    }
  );
  // API 응답이 { success: true, result: [] } 형태이므로 result 배열을 반환
  return Array.isArray(response.result) ? response.result : [];
};

// 감독자용 인증 목록 조회 - 공식 엔드포인트 사용
export const getSupervisorProofsByMonth = async (
  contractId: number,
  year: number,
  month: number
): Promise<SupervisorProofListResponse[]> => {
  const response = await apiRequest<any>(
    `/supervisors/contracts/${contractId}/proofs?year=${year}&month=${month}`,
    {
      method: "GET",
    }
  );
  // API 응답이 { success: true, result: [] } 형태이므로 result 배열을 반환
  return Array.isArray(response.result) ? response.result : [];
};

// 재인증 생성
export const createReProof = async (
  proofId: number,
  data: ProofCreateRequest
): Promise<void> => {
  return apiRequest<void>(`/proofs/${proofId}/again`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// 최근 인증 조회
export const getRecentProofs = async (contractId: number): Promise<any[]> => {
  const response = await apiRequest<any>(
    `/contracts/${contractId}/proofs/recent`,
    {
      method: "GET",
    }
  );
  // API 응답이 { success: true, result: [] } 형태이므로 result 배열을 반환
  return Array.isArray(response.result) ? response.result : [];
};

// 대기중인 인증들 조회
export const getAwaitProofs = async (contractId: number): Promise<any[]> => {
  const response = await apiRequest<any>(
    `/contracts/${contractId}/proofs/await`,
    {
      method: "GET",
    }
  );
  // API 응답이 { success: true, result: [] } 형태이므로 result 배열을 반환
  return Array.isArray(response.result) ? response.result : [];
};

// 감독자 인증 처리 (피드백)
export const submitProofFeedback = async (
  proofId: number,
  data: CreateFeedbackRequest
): Promise<void> => {
  return apiRequest<void>(`/proofs/${proofId}/feedback`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};
