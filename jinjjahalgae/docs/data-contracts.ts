/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * 인증 상태
 * @example "APPROVED"
 */
export enum ProofStatus {
  APPROVE_PENDING = "APPROVE_PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

/**
 * 피드백 상태 (APPROVED, REJECTED)
 * @example "REJECTED"
 */
export enum FeedbackStatus {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

/**
 * 계약 수정 요청
 * 계약 수정 요청 DTO
 */
export interface ContractUpdateRequest {
  /**
   * 계약 제목
   * @example "매일 운동하기"
   */
  title: string;
  /**
   * 목표 상세 설명
   * @example "매일 1시간 이상 운동하기"
   */
  goal: string;
  /**
   * 실패 시 벌칙
   * @example "치킨 2번 못 먹기"
   */
  penalty?: string;
  /**
   * 성공 시 보상
   * @example "치킨 2번 먹기"
   */
  reward?: string;
  /**
   * 총 실행 횟수
   * @format int32
   * @min 1
   * @example 10
   */
  totalProof: number;
  /**
   * 당일 계약 여부
   * @example false
   */
  oneOff: boolean;
  /**
   * 계약 시작일
   * @format date-time
   * @example "2024-01-01T09:00:00Z"
   */
  startDate: string;
  /**
   * 계약 종료일
   * @format date-time
   * @example "2024-01-31T23:59:59Z"
   */
  endDate: string;
  /**
   * 계약서 디자인 타입
   * @example "BASIC"
   */
  type: string;
  /**
   * 계약자 재서명 이미지 키
   * @example "signature/contractor_12345.png"
   */
  signatureImageKey: string;
}

export interface NoContentSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /**
   * 응답 데이터
   * @example "Any Data"
   */
  result?: object;
}

/**
 * 에러 응답
 * API 요청 실패 시 반환되는 에러 정보
 */
export interface ErrorResponse {
  /** 요청 성공 여부 */
  success: boolean;
  /** 에러 코드 */
  code: string;
  /** 에러 메시지 */
  message: string;
}

/**
 * 인증에 대한 감독자의 피드백 생성 요청
 * 피드백 생성 요청
 */
export interface CreateFeedbackRequest {
  /**
   * 댓글
   * @minLength 0
   * @maxLength 100
   * @example "솔직히 이거 노인정"
   */
  comment?: string;
  /**
   * 피드백 상태 (APPROVED, REJECTED)
   * @example "REJECTED"
   */
  status: string;
}

/**
 * 인증/재인증 생성 요청
 * 인증 등록 정보
 */
export interface ProofCreateRequest {
  /**
   * 1 번째 이미지 키
   * @example "1234abcd-5678-efgh-ijkl-9012mnopqrst.jpg"
   */
  firstImageKey: string;
  /**
   * 2 번째 이미지 키
   * @example "7774dfsf-5678-efgh-ijkl-9012mnopqrst.jpg"
   */
  secondImageKey?: string;
  /**
   * 3 번째 이미지 키
   * @example "1784qwrr-5678-efgh-ijkl-9012mnopqrst.jpg"
   */
  thirdImageKey?: string;
  /**
   * 선택 입력 받는 인증 코멘트
   * @example "6시에 헬스장 가서 7시30분까지 운동했습니다."
   */
  comment?: string;
}

export interface CreateReProofSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /**
   * 응답 데이터
   * @example "Any Data"
   */
  result?: object;
}

/**
 * 초대시 계약서 미리보기 요청
 * 초대시 계약서 미리보기 요청 DTO
 */
export interface VerifyInvitePasswordRequest {
  /**
   * 초대코드에 맞는 비밀번호
   * @example "3cd039f4"
   */
  password: string;
}

/**
 * 계약서 Uuid 응답
 * 비밀번호가 맞는 경우 계약서의 Uuid 응답 DTO
 * @example {"contractUuid":"36865103-5d08-4139-ba4a-b32da2316d7f"}
 */
export interface ContractUuidResponse {
  /** 계약의 Uuid */
  contractUuid?: string;
}

export interface VerifyPasswordSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 비밀번호가 맞는 경우 계약서의 Uuid 응답 DTO */
  result?: ContractUuidResponse;
}

export interface CreateInviteLinkSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 계약의 초대 링크와 비밀번호 응답 DTO */
  result?: InviteLinkResponse;
}

/**
 * 초대 링크 생성 응답
 * 계약의 초대 링크와 비밀번호 응답 DTO
 * @example {"inviteUrl":"https://jinjahalgae.vercel.app/invite/da2316d7","password":"ac08ee16"}
 */
export interface InviteLinkResponse {
  /** 초대 링크 */
  inviteUrl?: string;
  /** 초대 링크 접속 비밀번호 */
  password?: string;
}

/**
 * presigned url 생성 요청
 * 파일 업로드 정보
 */
export interface CreatePreSignedUrlRequest {
  /**
   * 파일 이름
   * @example "image.png"
   */
  fileName: string;
}

/**
 * presigned url 생성 응답
 * presigned url 응답 DTO
 * @example "Any Data"
 */
export interface CreatePreSignedUrlResponse {
  /**
   * Presigned URL
   * @example "https://presigned.com"
   */
  preSignedUrl?: string;
  /**
   * 파일키
   * @example "3d9ac273-2891-4084-9b29-5c9db453e3e4.png"
   */
  fileKey?: string;
}

export interface CreatePresignedUrlSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** presigned url 응답 DTO */
  result?: CreatePreSignedUrlResponse;
}

/**
 * 계약 생성 요청
 * 계약 생성 요청 DTO
 */
export interface CreateContractRequest {
  /**
   * 계약 제목
   * @example "매일 운동하기"
   */
  title: string;
  /**
   * 목표 상세 설명
   * @example "매일 30분 이상 운동하기"
   */
  goal: string;
  /**
   * 실패 시 벌칙
   * @example "치킨 못 먹기"
   */
  penalty?: string;
  /**
   * 성공 시 보상
   * @example "치킨 먹기"
   */
  reward?: string;
  /**
   * 총 실행 횟수
   * @format int32
   * @min 1
   * @example 10
   */
  totalProof: number;
  /**
   * 당일 계약 여부
   * @example false
   */
  oneOff: boolean;
  /**
   * 계약 시작일
   * @format date-time
   * @example "2025-01-01T00:00:00Z"
   */
  startDate: string;
  /**
   * 계약 종료일
   * @format date-time
   * @example "2025-01-01T00:00:00Z"
   */
  endDate: string;
  /**
   * 계약서 디자인 타입
   * @example "BASIC"
   */
  type: "BASIC" | "CASUAL" | "CHILD" | "STUDENT" | "JOSEON";
  /**
   * 서명 이미지 키
   * @example "signature.jpg"
   */
  signatureImageKey: string;
}

/**
 * 단순 계약 생성 성공 응답
 * 계약 생성 성공 시 반환되는 응답 DTO
 * @example "Any Data"
 */
export interface CreateContractResponse {
  /**
   * 계약 ID
   * @format int64
   * @example 1
   */
  contractId?: number;
  /**
   * 계약 UUID
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  contractUuid?: string;
}

export interface Type계약생성응답 {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 계약 생성 성공 시 반환되는 응답 DTO */
  result?: CreateContractResponse;
}

/**
 * 계약자 서명 생성 요청
 * 계약자가 계약 생성시에 자신이 서명하기 위한 요청 DTO
 */
export interface CreateContractorParticipationRequest {
  /**
   * 서명 이미지 키
   * @example "d868f036-7b91-4fc7-901d-83eb16291da9.png"
   */
  imageKey: string;
}

export interface CreateProofSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /**
   * 응답 데이터
   * @example "Any Data"
   */
  result?: object;
}

/**
 * 소셜로그인 응답
 * 로그인 성공 시 JWT 응답 DTO
 * @example {"accessToken":"eyJhbGc123451NiJ9.eyJzdWIiOiI2IiwiaWF0IjoxNzUxODMyNjMxLCJleHAiOjE3NTE4MzQ0MzF9.hY7PLaNrQifTgHUjg8Jb2899FQfCSoiGGJv6-yl6jS0","refreshToken":"eyJhbGc123451NiJ9.eyJzdWIiOiI2IiwiaWF0IjoxNzUxODMyNjMxLCJleHAiOjE3NTE4MzQ0MzF9.hY7PLaNrQifTgHUjg8Jb2899FQfCSoiGGJv6-yl6jS0"}
 */
export interface SocialLoginResponse {
  /** 서버에서 발급한 Access Token */
  accessToken?: string;
  /** 서버에서 발급한 Refresh Token */
  refreshToken?: string;
}

/**
 * 리프레시 요청
 * 리프레시 토큰 요청 DTO
 */
export interface RefreshRequest {
  /**
   * 기존 리프레시 토큰
   * @example "eyJhbGc123451NiJ9.eyJzdWIiOiI2IiwiaWF0IjoxNzUxODMyNjMxLCJleHAiOjE3NTE4MzQ0MzF9.hY7PLaNrQifTgHUjg8Jb2899FQfCSoiGGJv6-yl6jS0"
   */
  refreshToken: string;
}

/**
 * 리프레시 응답
 * 리프레시 성공 시 JWT 응답 DTO
 * @example {"accessToken":"eyJhbGc123451NiJ9.eyJzdWIiOiI2IiwiaWF0IjoxNzUxODMyNjMxLCJleHAiOjE3NTE4MzQ0MzF9.hY7PLaNrQifTgHUjg8Jb2899FQfCSoiGGJv6-yl6jS0","refreshToken":"eyJhbGc123451NiJ9.eyJzdWIiOiI2IiwiaWF0IjoxNzUxODMyNjMxLCJleHAiOjE3NTE4MzQ0MzF9.hY7PLaNrQifTgHUjg8Jb2899FQfCSoiGGJv6-yl6jS0"}
 */
export interface RefreshResponse {
  /** 서버에서 새로 발급한 Access Token */
  accessToken?: string;
  /** 서버에서 새로 발급한 Refresh Token */
  refreshToken?: string;
}

export interface RefreshSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 리프레시 성공 시 JWT 응답 DTO */
  result?: RefreshResponse;
}

/**
 * 소셜로그인 요청
 * 소셜 로그인 정보 (provider: KAKAO|NAVER, accessToken: 소셜 AccessToken, fcmToken: [선택] FCM 토큰)
 */
export interface SocialLoginRequest {
  /**
   * 소셜 로그인 제공자 (NAVER, KAKAO)
   * @example "NAVER"
   */
  provider: string;
  /**
   * 써드파티로부터 받은 Access Token
   * @example "r3bas52789CPG-7jV9t3ht6XPwJKHCT9AABAEAQoXBi4AAAGX4VCtCK-b-4ep6DEo"
   */
  accessToken: string;
  /**
   * 클라이언트 기기 FCM 토큰. 웹앱 등 FCM 토큰이 없는 경우 비워둘 수 있습니다.
   * @example "c3a41..."
   */
  fcmToken?: string;
}

export interface SocialLoginCookieSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /**
   * 응답 데이터
   * @example "Any Data"
   */
  result?: string;
}

export interface SocialLoginBodySwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 로그인 성공 시 JWT 응답 DTO */
  result?: SocialLoginResponse;
}

/**
 * 내 유저정보 수정 요청
 * 수정 요청 DTO
 */
export interface UpdateMyInfoRequest {
  /**
   * 닉네임
   * @minLength 0
   * @maxLength 10
   * @example "홍길동"
   */
  nickname: string;
}

/**
 * 내 유저정보 응답
 * 내 유저정보 응답 DTO
 * @example "Any Data"
 */
export interface MyInfoResponse {
  /**
   * 유저 ID
   * @format int64
   * @example 1
   */
  id?: number;
  /**
   * 이름
   * @example "홍길동"
   */
  name?: string;
  /**
   * 닉네임
   * @example "홍길동"
   */
  nickname?: string;
  /**
   * 이메일
   * @example "user@example.com"
   */
  email?: string;
}

export interface MyInfoSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 내 유저정보 응답 DTO */
  result?: MyInfoResponse;
}

export interface GetSupervisorProofListSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 감독자 한 달치 인증 목록 응답 DTO */
  result?: SupervisorProofListResponse;
}

/**
 * 인증 목록 조회 (달력) 인증/재인증 공통 응답
 * 인증과 재인증의 공통 필드를 정의한 dto
 * @example {"imageKey":"1234abcd-5678-efgh-ijkl-9012mnopqrst.jpg","status":"APPROVED","totalSupervisors":4,"completedSupervisors":2,"proofId":20}
 */
export interface ProofSimpleResponse {
  /** 1 번째 이미지 (대표 사진) 키 */
  imageKey?: string;
  /** 인증 상태 */
  status?: ProofStatus;
  /**
   * 계약에 참여한 총 감독자 수
   * @format int32
   */
  totalSupervisors?: number;
  /**
   * 인증에 대한 처리(승인/거절)을 수행한 감독자 수
   * @format int32
   */
  completeSupervisors?: number;
  /**
   * 인증 id
   * @format int64
   */
  proofId?: number;
}

/**
 * 감독자용 상세 페이지 인증 목록 조회 (달력)
 * 감독자 한 달치 인증 목록 응답 DTO
 * @example "{
 *   "date": "2025-07-09T00:34:38Z",
 *   "originalProof": {
 *     "imageKey": "1234abcd-5678-efgh-ijkl-9012mnopqrst.jpg",
 *     "status": "REJECTED",
 *     "totalSupervisors": 4,
 *     "completedSupervisors": 2,
 *     "proofId": 20
 *   },
 *   "originalFeedbackStatus": "REJECTED",
 *   "reProof": {
 *     "imageKey": "5678abcd-5678-efgh-ijkl-9012mnopqrst.jpg",
 *     "status": "APPROVED",
 *     "totalSupervisors": 4,
 *     "completedSupervisors": 2,
 *     "proofId": 21
 *   },
 *   "reProofFeedbackStatus": "APPROVED",
 * }
 * "
 */
export interface SupervisorProofListResponse {
  /**
   * 인증이 생성된 날짜 (달력 일 단위 매핑용)
   * @format date-time
   */
  date?: string;
  /** 인증과 재인증의 공통 필드를 정의한 dto */
  originalProof?: ProofSimpleResponse;
  /** 피드백 상태 (APPROVED, REJECTED) */
  originalFeedbackStatus?: FeedbackStatus;
  /** 인증과 재인증의 공통 필드를 정의한 dto */
  reProof?: ProofSimpleResponse;
  /** 피드백 상태 (APPROVED, REJECTED) */
  reProofFeedbackStatus?: FeedbackStatus;
}

/**
 * 인증 상세 페이지 피드백 조회
 * 상세 페이지 내 피드백 응답 DTO
 * @example {"createdAt":"2025-07-09T13:30:00Z","status":"APPROVED","comment":"확인했습니다!"}
 */
export interface FeedbackResponse {
  /**
   * 피드백 생성일
   * @format date-time
   */
  createdAt?: string;
  /** 피드백 상태 (APPROVED, REJECTED) */
  status?: FeedbackStatus;
  /** 코멘트 (없으면 null) */
  comment?: string;
}

export interface GetProofDetailSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 인증 상세 페이지 응답 DTO */
  result?: ProofDetailResponse;
}

/**
 * 인증 상세 페이지 조회
 * 인증 상세 페이지 응답 DTO
 * @example {"imageKeys":["1234abcd-5678-efgh-ijkl-9012mnopqrst.jpg","5678ssss-5678-efgh-ijkl-9012mnopqrst.jpg","1468qwer-5678-efgh-ijkl-9012mnopqrst.jpg"],"comment":"6시에 헬스장 가서 7시30분까지 운동했습니다.","status":"REJECTED","createdAt":"2025-07-09T13:30:00Z","reProof":false,"feedbacks":[{"createdAt":"2025-07-09T13:30:00Z","status":"APPROVED","comment":"확인했습니다!"},{"createdAt":"2025-07-09T14:55:00Z","status":"REJECTED","comment":"사진만 찍고 온거 아님?"},{"createdAt":"2025-07-09T16:00:00Z","status":"REJECTED","comment":null}],"proofId":17}
 */
export interface ProofDetailResponse {
  /** 인증 이미지 키들 (1 번 이미지부터 순서대로 정렬된 상태) */
  imageKeys?: string[];
  /** 계약자가 작성한 인증 코멘트 (없으면 null) */
  comment?: string;
  /** 인증 상태 */
  status?: ProofStatus;
  /**
   * 인증 생성일
   * @format date-time
   */
  createdAt?: string;
  /** 재인증 여부 (원본 = false, 재인증 = true) */
  reProof?: boolean;
  /** 인증에 달린 감독자들의 피드백 데이터들 */
  feedbacks?: FeedbackResponse[];
  /**
   * 인증 id
   * @format int64
   */
  proofId?: number;
}

export interface GetAllNotificationSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 응답 데이터  */
  result?: PageNotificationGetResponse;
}

/**
 * 알림 조회 응답
 * 사용자 ID로 조회한 알림 목록의 각 알림 정보를 담은 DTO
 */
export interface NotificationGetResponse {
  /**
   * 알림 ID
   * @format int64
   * @example 1
   */
  notificationId: number;
  /**
   * 알림 타입
   * @example "CONTRACT_STARTED"
   */
  type:
    | "SUPERVISOR_ADDED"
    | "SUPERVISOR_WITHDRAWN"
    | "CONTRACT_STARTED"
    | "CONTRACT_AUTO_DELETED"
    | "CONTRACT_ENDED_FAIL"
    | "CONTRACT_ENDED_SUCCESS"
    | "PROOF_ADDED"
    | "PROOF_ACCEPTED"
    | "PROOF_REJECTED"
    | "FEEDBACK_ADDED"
    | "REPROOF_ADDED";
  /**
   * 알림 읽음 상태
   * @example false
   */
  readStatus: boolean;
  /**
   * 알림 본문 내용
   * @example "'홍길동'님의 '매일 운동하기' 계약이 시작되었습니다."
   */
  content: string;
  /**
   * 알림을 받을 사용자 ID
   * @format int64
   * @example 1
   */
  targetUserId: number;
  /**
   * 관련 계약 ID (클릭 시 이동할 계약)
   * @format int64
   * @example 1
   */
  contractId: number;
}

/**
 * 응답 데이터
 * @example "Any Data"
 */
export interface PageNotificationGetResponse {
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
  /** @format int32 */
  size?: number;
  content?: NotificationGetResponse[];
  /** @format int32 */
  number?: number;
  sort?: SortObject;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface PageableObject {
  /** @format int64 */
  offset?: number;
  sort?: SortObject;
  unpaged?: boolean;
  paged?: boolean;
  /** @format int32 */
  pageNumber?: number;
  /** @format int32 */
  pageSize?: number;
}

export interface SortObject {
  empty?: boolean;
  sorted?: boolean;
  unsorted?: boolean;
}

export interface CountUnreadNotificationSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /**
   * 응답 데이터
   * @format int64
   */
  result?: number;
}

export interface GetInviteContractInfoSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 초대 링크를 통해 조회한 계약 정보 DTO */
  result?: InviteContractInfoResponse;
}

/**
 * 계약서 미리보기 응답
 * 초대 링크를 통해 조회한 계약 정보 DTO
 * @example {"contractId":1,"contractorName":"홍길동","contractorSignatureKey":"36865103-5d08-4139-ba4a-b32da2316d7f","uuid":"36865103-5d08-4139-ba4a-b32da2316d7f","startDate":"2025-07-01T00:00:00Z","endDate":"2025-07-31T23:59:59Z","title":"매일 아침 30분 운동하기","goal":"한 달 동안 매일 아침 조깅을 하여 체력을 증진한다.","penalty":"실패 시 친구에게 커피 사주기","reward":"성공 시 나에게 선물 사주기","totalProof":30,"oneOff":false,"status":"PENDING","type":"BASIC","supervisorInfos":[{"supervisorName":"김감독","supervisorSignatureKey":"1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"},{"supervisorName":"박감시","supervisorSignatureKey":"9z8y7x6w-5v4u-3t2s-1r0q-p9o8n7m6l5k4"}]}
 */
export interface InviteContractInfoResponse {
  /**
   * 계약 ID
   * @format int64
   */
  contractId?: number;
  /** 계약자 이름 */
  contractorName?: string;
  /** 계약자 서명 이미지 키 */
  contractorSignatureKey?: string;
  /** 계약 고유 uuid */
  uuid?: string;
  /**
   * 계약 시작일
   * @format date-time
   */
  startDate?: string;
  /**
   * 계약 종료일
   * @format date-time
   */
  endDate?: string;
  /** 목표 제목 */
  title?: string;
  /** 계약 목표 */
  goal?: string;
  /** 벌칙 */
  penalty?: string;
  /** 보상 */
  reward?: string;
  /**
   * 총 인증 횟수
   * @format int32
   */
  totalProof?: number;
  /** 단발성 여부 */
  oneOff?: boolean;
  /** 계약 상태 */
  status?:
    | "PENDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "FAILED"
    | "ABANDONED"
    | "WAIT_RESULT";
  /** 계약서 템플릿 타입 */
  type?: "BASIC" | "CASUAL" | "CHILD" | "STUDENT" | "JOSEON";
  /** 감독자 정보 목록 (이름과 서명 이미지 키) */
  supervisorInfos?: SupervisorResponse[];
}

/** 감독자 정보 목록 (이름과 서명 이미지 키) */
export interface SupervisorResponse {
  supervisorName?: string;
  supervisorSignatureKey?: string;
}

/**
 * 계약 리스트 응답
 * 계약 목록 조회 시 반환되는 응답 DTO, 메인 페이지, 히스토리 페이지 등에 사용(계약 상태로 구분분)
 */
export interface ContractListResponse {
  /**
   * 계약 ID
   * @format int64
   * @example 1
   */
  contractId?: number;
  /**
   * 계약 UUID
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  contractUuid?: string;
  /**
   * 계약 제목
   * @example "매일 운동하기"
   */
  title?: string;
  /**
   * 계약 상태
   * @example "PENDING"
   */
  contractStatus?:
    | "PENDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "FAILED"
    | "ABANDONED"
    | "WAIT_RESULT";
  /**
   * 계약 시작 날짜
   * @format date-time
   * @example "2024-01-01T09:00:00Z"
   */
  startDate?: string;
  /**
   * 계약 종료 날짜
   * @format date-time
   * @example "2024-01-31T23:59:59Z"
   */
  endDate?: string;
  /**
   * 보상
   * @example "치킨 먹기"
   */
  reward?: string;
  /**
   * 벌칙
   * @example "치킨 못 먹기"
   */
  penalty?: string;
  /**
   * 단발성 계약 여부
   * @example false
   */
  oneOff?: boolean;
  /**
   * 현재 인증 횟수 / 총 인증 횟수
   * @example "5/10"
   */
  achievementRatio?: string;
  /**
   * 경과 기간 / 총 기간 (일)
   * @example "15/30"
   */
  periodRatio?: string;
  /**
   * 횟수 달성률
   * @format double
   * @example 50
   */
  achievementPercent?: number;
  /**
   * 기간 달성률
   * @format double
   * @example 75
   */
  periodPercent?: number;
  /**
   * 오늘자 인증 존재 여부 (오늘자 인증이 없으면 false)
   * @example false
   */
  todayProofExist?: boolean;
}

/**
 * 응답 데이터
 * @example "Any Data"
 */
export interface PageContractListResponse {
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
  /** @format int32 */
  size?: number;
  content?: ContractListResponse[];
  /** @format int32 */
  number?: number;
  sort?: SortObject;
  /** @format int32 */
  numberOfElements?: number;
  pageable?: PageableObject;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface Type계약목록조회응답 {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 응답 데이터  */
  result?: PageContractListResponse;
}

/** 계약 조회 공통 데이터 */
export interface ContractBasicResponse {
  /**
   * 계약 ID
   * @format int64
   * @example 1
   */
  contractId?: number;
  /**
   * 계약 UUID
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  contractUuid?: string;
  /**
   * 계약 제목
   * @example "매일 운동하기"
   */
  title?: string;
  /**
   * 목표 상세
   * @example "매일 30분 이상 운동하기"
   */
  goal?: string;
  /**
   * 벌칙
   * @example "치킨 못 먹기"
   */
  penalty?: string;
  /**
   * 보상
   * @example "치킨 먹기"
   */
  reward?: string;
  /**
   * 총 인증 수
   * @format int32
   * @example 10
   */
  totalProof?: number;
  /**
   * 시작 날짜
   * @format date-time
   * @example "2024-01-01T09:00:00Z"
   */
  startDate?: string;
  /**
   * 종료 날짜
   * @format date-time
   * @example "2024-01-31T23:59:59Z"
   */
  endDate?: string;
}

/** 참가자 기본 정보 */
export interface ParticipantSimpleResponse {
  /**
   * 사용자 ID
   * @format int64
   */
  userId?: number;
  /** 사용자 이름 */
  userName?: string;
  /** 역할 */
  role?: "CONTRACTOR" | "SUPERVISOR";
  /** 참여 유효 여부 */
  valid?: boolean;
}

export interface Type계약상세조회응답 {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 응답 데이터  */
  result?: ContractPreviewResponse;
}

/**
 * 계약 제목 정보 응답
 * 계약의 제목과 목표만 포함한 간단한 정보 응답 DTO
 * @example "Any Data"
 */
export interface ContractTitleInfoResponse {
  /**
   * 계약 제목
   * @example "매일 운동하기"
   */
  title?: string;
  /**
   * 계약 목표
   * @example "매일 30분 이상 운동하기"
   */
  goal?: string;
}

export interface Type계약제목정보조회응답 {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 계약의 제목과 목표만 포함한 간단한 정보 응답 DTO */
  result?: ContractTitleInfoResponse;
}

export interface GetRecentProofsSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 최근 3개의 인증 응답 DTO (리스트에 담겨서 보내짐) */
  result?: ProofRecentResponse;
}

/**
 * 최근 인증 조회
 * 최근 3개의 인증 응답 DTO (리스트에 담겨서 보내짐)
 * @example {"imageKey":"1234abcd-5678-efgh-ijkl-9012mnopqrst.jpg","comment":null,"status":"APPROVED","createdAt":"2025-07-09T13:30:00+09:00","reProof":false,"proofId":20}
 */
export interface ProofRecentResponse {
  /** 1 번째 이미지 (대표 사진) 키 */
  imageKey?: string;
  /** 인증 코멘트 (없으면 null) */
  comment?: string;
  /** 인증 상태 */
  status?: ProofStatus;
  /**
   * 인증 생성일
   * @format date-time
   */
  createdAt?: string;
  /** 재인증 여부 (원본 = false, 재인증 = true */
  reProof?: boolean;
  /**
   * 인증 id
   * @format int64
   */
  proofId?: number;
}

export interface GetAwaitProofsSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /**
   * 응답 데이터
   * @example "Any Data"
   */
  result?: object;
}

/**
 * 응답 데이터
 * @example "Any Data"
 */
export interface ContractPreviewResponse {
  /** 계약 조회 공통 데이터 */
  contractBasicResponse?: ContractBasicResponse;
  /**
   * 계약서 디자인 타입
   * @example "BASIC"
   */
  type?: "BASIC" | "CASUAL" | "CHILD" | "STUDENT" | "JOSEON";
  /**
   * 참여자 정보
   * @example "참여자 정보"
   */
  participants?: ParticipantFullResponse[];
}

/**
 * 참여자 정보
 * @example "참여자 정보"
 */
export interface ParticipantFullResponse {
  /** 참가자 기본 정보 */
  basicInfo?: ParticipantSimpleResponse;
  /** 서명 이미지 키 */
  signatureImageKey?: string;
}

/**
 * 계약자용 상세 페이지 인증 목록 조회 (달력)
 * 계약자 한 달치 인증 목록 응답 DTO
 * @example "{
 *   "date": "2025-07-09T00:34:38Z",
 *   "endDate": "2025-07-31T00:34:38Z"
 *   "originalProof": {
 *     "imageKey": "1234abcd-5678-efgh-ijkl-9012mnopqrst.jpg",
 *     "status": "APPROVED",
 *     "totalSupervisors": 4,
 *     "completedSupervisors": 2,
 *     "proofId": 20
 *   },
 *   "rejectedAt": "2025-07-09T00:34:38Z",
 *   "reProof": null
 * }
 * "
 */
export interface ContractorProofListResponse {
  /**
   * 인증이 생성된 날짜 (달력 일 단위 매핑용)
   * @format date-time
   */
  date?: string;
  /**
   * 계약의 종료일 (종료 2일 전 재인증 요청 불가 검증에 사용할 필드)
   * @format date-time
   */
  endDate?: string;
  /** 인증과 재인증의 공통 필드를 정의한 dto */
  originalProof?: ProofSimpleResponse;
  /**
   * 인증이 거절처리된 시간 (재인증 요청 버튼 출력용)
   * @format date-time
   */
  rejectedAt?: string;
  /** 인증과 재인증의 공통 필드를 정의한 dto */
  reProof?: ProofSimpleResponse;
}

export interface GetContractorProofListSwaggerResponse {
  /**
   * 요청 성공 여부
   * @example true
   */
  success: boolean;
  /** 계약자 한 달치 인증 목록 응답 DTO */
  result?: ContractorProofListResponse;
}

export type GetContractDetailData = Type계약상세조회응답;

export type GetContractDetailError = ErrorResponse;

export type UpdateContractData = NoContentSwaggerResponse;

export type UpdateContractError = ErrorResponse;

export type CancelContractData = NoContentSwaggerResponse;

export type CancelContractError = ErrorResponse;

export type CreateFeedbackData = NoContentSwaggerResponse;

export type CreateFeedbackError = ErrorResponse;

export type CreateReProofData = CreateReProofSwaggerResponse;

export type CreateReProofError = ErrorResponse;

export type VerifyPasswordData = VerifyPasswordSwaggerResponse;

export type VerifyPasswordError = ErrorResponse;

export type CreateInviteLinkData = CreateInviteLinkSwaggerResponse;

export type CreateInviteLinkError = ErrorResponse;

export type CreatePresignedUrlData = CreatePresignedUrlSwaggerResponse;

export type CreatePresignedUrlError = ErrorResponse;

export type GetContractsData = Type계약목록조회응답;

export type GetContractsError = ErrorResponse;

export type CreateContractData = Type계약생성응답;

export type CreateContractError = ErrorResponse;

export type JoinAsSupervisorData = NoContentSwaggerResponse;

export type JoinAsSupervisorError = ErrorResponse;

export type CreateProofData = CreateProofSwaggerResponse;

export type CreateProofError = ErrorResponse;

export type TestLoginData = SocialLoginResponse;

export type RefreshData = RefreshSwaggerResponse;

export type RefreshError = ErrorResponse;

export type LogoutData = NoContentSwaggerResponse;

export type LogoutError = ErrorResponse;

export type SocialLoginForCookieData = SocialLoginCookieSwaggerResponse;

export type SocialLoginForCookieError = ErrorResponse;

export type SocialLoginForBodyData = SocialLoginBodySwaggerResponse;

export type SocialLoginForBodyError = ErrorResponse;

export type GetMyInfoData = MyInfoSwaggerResponse;

export type GetMyInfoError = ErrorResponse;

export type DeleteMyAccountData = NoContentSwaggerResponse;

export type DeleteMyAccountError = ErrorResponse;

export type UpdateMyInfoData = MyInfoSwaggerResponse;

export type UpdateMyInfoError = ErrorResponse;

export type MarkSingleNotificationAsReadData = NoContentSwaggerResponse;

export type MarkSingleNotificationAsReadError = ErrorResponse;

export type WithdrawContractData = NoContentSwaggerResponse;

export type WithdrawContractError = ErrorResponse;

export type WithdrawAsSupervisorData = NoContentSwaggerResponse;

export type WithdrawAsSupervisorError = ErrorResponse;

export type AbandonAsSupervisorData = NoContentSwaggerResponse;

export type AbandonAsSupervisorError = ErrorResponse;

export type HealthData = string;

export type GetSupervisorProofListData = GetSupervisorProofListSwaggerResponse;

export type GetSupervisorProofListError = ErrorResponse;

export type GetProofDetailData = GetProofDetailSwaggerResponse;

export type GetProofDetailError = ErrorResponse;

export type GetAllNotificationsData = GetAllNotificationSwaggerResponse;

export type GetAllNotificationsError = ErrorResponse;

export type DeleteAllNotificationData = NoContentSwaggerResponse;

export type DeleteAllNotificationError = ErrorResponse;

export type CountUnreadNotificationByUserIdData =
  CountUnreadNotificationSwaggerResponse;

export type CountUnreadNotificationByUserIdError = ErrorResponse;

export type CheckInviteLinkData = NoContentSwaggerResponse;

export type CheckInviteLinkError = ErrorResponse;

export type GetContractInfoData = GetInviteContractInfoSwaggerResponse;

export type GetContractInfoError = ErrorResponse;

export type GetContractTitleInfoData = Type계약제목정보조회응답;

export type GetContractTitleInfoError = ErrorResponse;

export type GetRecentProofsData = GetRecentProofsSwaggerResponse;

export type GetRecentProofsError = ErrorResponse;

export type GetAwaitProofsData = GetAwaitProofsSwaggerResponse;

export type GetAwaitProofsError = ErrorResponse;

export type GetContractPreviewData = Type계약상세조회응답;

export type GetContractPreviewError = ErrorResponse;

export type GetContractHistoryData = Type계약목록조회응답;

export type GetContractHistoryError = ErrorResponse;

export type GetContractorProofListData = GetContractorProofListSwaggerResponse;

export type GetContractorProofListError = ErrorResponse;

export type DeleteSingleNotificationData = NoContentSwaggerResponse;

export type DeleteSingleNotificationError = ErrorResponse;
