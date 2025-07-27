/**
 * 파일 관련 API 함수들
 * - Presigned URL 요청
 * - 파일 업로드
 */

import { apiRequest } from "../api";
import {
  CreatePreSignedUrlRequest,
  CreatePreSignedUrlResponse,
} from "../../../docs/data-contracts";

// Presigned URL 요청
export const getPresignedUrl = async (
  data: CreatePreSignedUrlRequest
): Promise<CreatePreSignedUrlResponse> => {
  const response = await apiRequest<any>("/files/presigned-url", {
    method: "POST",
    body: JSON.stringify(data),
  });

  // MSW 응답 구조: { success: true, result: { presignedUrl, imageKey } }
  // 실제 API 응답 구조도 이와 동일할 것으로 예상
  if (response.success && response.result) {
    return {
      preSignedUrl:
        response.result.presignedUrl || response.result.preSignedUrl,
      fileKey: response.result.imageKey || response.result.fileKey,
    };
  }

  throw new Error("Invalid presigned URL response");
};

// S3에 파일 업로드 (presigned URL 사용)
export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File
): Promise<void> => {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
};

// 파일 업로드 헬퍼 함수 (presigned URL 요청 + 업로드)
export const uploadFile = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}_${file.name}`;

  // 1. Presigned URL 요청
  const { preSignedUrl, fileKey } = await getPresignedUrl({
    fileName: fileName,
  });

  if (!preSignedUrl || !fileKey) {
    throw new Error("Failed to get presigned URL or file key");
  }

  // 2. S3에 파일 업로드
  await uploadFileToS3(preSignedUrl, file);

  // 3. S3 키 반환
  return fileKey;
};
