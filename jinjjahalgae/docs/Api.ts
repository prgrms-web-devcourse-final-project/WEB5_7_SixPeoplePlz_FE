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

import {
  AbandonAsSupervisorData,
  AbandonAsSupervisorError,
  CancelContractData,
  CancelContractError,
  CheckInviteLinkData,
  CheckInviteLinkError,
  ContractUpdateRequest,
  CountUnreadNotificationByUserIdData,
  CountUnreadNotificationByUserIdError,
  CreateContractData,
  CreateContractError,
  CreateContractRequest,
  CreateContractorParticipationRequest,
  CreateFeedbackData,
  CreateFeedbackError,
  CreateFeedbackRequest,
  CreateInviteLinkData,
  CreateInviteLinkError,
  CreatePreSignedUrlRequest,
  CreatePresignedUrlData,
  CreatePresignedUrlError,
  CreateProofData,
  CreateProofError,
  CreateReProofData,
  CreateReProofError,
  DeleteAllNotificationData,
  DeleteAllNotificationError,
  DeleteMyAccountData,
  DeleteMyAccountError,
  DeleteSingleNotificationData,
  DeleteSingleNotificationError,
  GetAllNotificationsData,
  GetAllNotificationsError,
  GetAwaitProofsData,
  GetAwaitProofsError,
  GetContractDetailData,
  GetContractDetailError,
  GetContractHistoryData,
  GetContractHistoryError,
  GetContractInfoData,
  GetContractInfoError,
  GetContractPreviewData,
  GetContractPreviewError,
  GetContractTitleInfoData,
  GetContractTitleInfoError,
  GetContractorProofListData,
  GetContractorProofListError,
  GetContractsData,
  GetContractsError,
  GetMyInfoData,
  GetMyInfoError,
  GetProofDetailData,
  GetProofDetailError,
  GetRecentProofsData,
  GetRecentProofsError,
  GetSupervisorProofListData,
  GetSupervisorProofListError,
  JoinAsSupervisorData,
  JoinAsSupervisorError,
  LogoutData,
  LogoutError,
  MarkSingleNotificationAsReadData,
  MarkSingleNotificationAsReadError,
  ProofCreateRequest,
  RefreshData,
  RefreshError,
  RefreshRequest,
  SocialLoginForBodyData,
  SocialLoginForBodyError,
  SocialLoginForCookieData,
  SocialLoginForCookieError,
  SocialLoginRequest,
  TestLoginData,
  UpdateContractData,
  UpdateContractError,
  UpdateMyInfoData,
  UpdateMyInfoError,
  UpdateMyInfoRequest,
  VerifyInvitePasswordRequest,
  VerifyPasswordData,
  VerifyPasswordError,
  WithdrawAsSupervisorData,
  WithdrawAsSupervisorError,
  WithdrawContractData,
  WithdrawContractError,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description 특정 계약의 상세 정보를 조회합니다. 계약 내용과 참여자(감독자) 정보를 포함합니다.
   *
   * @tags 계약 API
   * @name GetContractDetail
   * @summary 계약 상세 조회
   * @request GET:/api/contracts/{contractId}
   * @secure
   * @response `200` `GetContractDetailData` 계약 상세 조회 성공
   * @response `401` `ErrorResponse` 인증 실패
   * @response `404` `ErrorResponse` 계약을 찾을 수 없음
   */
  getContractDetail = (contractId: number, params: RequestParams = {}) =>
    this.request<GetContractDetailData, GetContractDetailError>({
      path: `/api/contracts/${contractId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 기존 계약의 내용을 수정합니다. 감독자가 서명하기 전에만 수정 가능하며, 계약자만 수정할 수 있습니다.
   *
   * @tags 계약 API
   * @name UpdateContract
   * @summary 계약 수정
   * @request PUT:/api/contracts/{contractId}
   * @secure
   * @response `200` `UpdateContractData` 계약 수정 성공
   * @response `400` `ErrorResponse` 잘못된 요청 (필수 필드 누락, 유효성 검증 실패)
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 접근 권한 없음 (계약자가 아닌 사용자)
   * @response `404` `ErrorResponse` 계약을 찾을 수 없음
   */
  updateContract = (
    contractId: number,
    data: ContractUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateContractData, UpdateContractError>({
      path: `/api/contracts/${contractId}`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 시작 전 계약을 취소하고 완전히 삭제합니다. PENDING 상태의 계약만 취소할 수 있으며, 계약자만 실행할 수 있습니다.
   *
   * @tags 계약 API
   * @name CancelContract
   * @summary 계약 취소 및 삭제
   * @request DELETE:/api/contracts/{contractId}
   * @secure
   * @response `200` `CancelContractData` 계약 취소 및 삭제 성공
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 접근 권한 없음 (계약자가 아닌 사용자)
   * @response `404` `ErrorResponse` 계약을 찾을 수 없음
   * @response `409` `ErrorResponse` 계약 상태 오류 (시작 전이 아닌 계약)
   */
  cancelContract = (contractId: number, params: RequestParams = {}) =>
    this.request<CancelContractData, CancelContractError>({
      path: `/api/contracts/${contractId}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 감독자가 특정 인증에 대한 피드백을 생성합니다. <br> - 해당 계약에 참가중인 감독자만 피드백을 작성할 수 있습니다. <br> - 피드백 내용은 100자 이하여야 합니다. <br> - 피드백 상태는 `APPROVED`, `REJECTED` 중 하나여야 합니다.
   *
   * @tags 피드백 API
   * @name CreateFeedback
   * @summary 피드백 생성
   * @request POST:/api/proofs/{proofId}/feedback
   * @secure
   * @response `201` `CreateFeedbackData` 피드백 생성 성공
   * @response `400` `ErrorResponse` 잘못된 요청
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 권한 없음
   * @response `404` `ErrorResponse` 존재하지 않는 인증
   */
  createFeedback = (
    proofId: number,
    data: CreateFeedbackRequest,
    params: RequestParams = {},
  ) =>
    this.request<CreateFeedbackData, CreateFeedbackError>({
      path: `/api/proofs/${proofId}/feedback`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 요청한 데이터로 재인증 객체를 생성하여 저장
   *
   * @tags 인증 API
   * @name CreateReProof
   * @summary 재인증 생성
   * @request POST:/api/proofs/{proofId}/again
   * @secure
   * @response `201` `CreateReProofData` 재인증 생성 성공
   * @response `400` `ErrorResponse` 잘못된 요청(해당 일에 재인증이 이미 존재하거나 재인증 이미지가 존재하지 않는 경우)
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 계약에 대한 인증 생성 권한이 없음
   * @response `404` `ErrorResponse` 원본 인증이 존재하지 않거나 원본 인증과 연결된 계약이 존재하지 않는 경우
   * @response `409` `ErrorResponse` 원본 인증에 대한 재인증이 존재하는 경우
   */
  createReProof = (
    proofId: number,
    data: ProofCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<CreateReProofData, CreateReProofError>({
      path: `/api/proofs/${proofId}/again`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 입력된 비밀번호가 유효한지 검증하고, 성공 시 계약 UUID를 반환합니다.
   *
   * @tags 초대 API
   * @name VerifyPassword
   * @summary 초대링크 비밀번호 확인
   * @request POST:/api/invites/{inviteCode}/verify
   * @response `200` `VerifyPasswordData` 비밀번호 검증 성공
   * @response `401` `ErrorResponse` 비밀번호 불일치
   * @response `404` `ErrorResponse` 존재하지 않거나 만료된 초대링크
   */
  verifyPassword = (
    inviteCode: string,
    data: VerifyInvitePasswordRequest,
    params: RequestParams = {},
  ) =>
    this.request<VerifyPasswordData, VerifyPasswordError>({
      path: `/api/invites/${inviteCode}/verify`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 특정 계약에 대한 초대링크와 임시 비밀번호를 생성합니다. 로그인이 필요합니다.
   *
   * @tags 초대 API
   * @name CreateInviteLink
   * @summary 초대링크 생성
   * @request POST:/api/invites/{contractId}
   * @secure
   * @response `201` `CreateInviteLinkData` 초대링크 생성 성공
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 자신의 계약이 아닌 계약의 초대링크 생성을 요청한 경우
   * @response `404` `ErrorResponse` 초대링크 생성을 요청한 계약이 존재하지 않는 경우
   * @response `409` `ErrorResponse` 초대링크 생성을 요청한 계약이 대기 상태가 아닌경우
   */
  createInviteLink = (contractId: number, params: RequestParams = {}) =>
    this.request<CreateInviteLinkData, CreateInviteLinkError>({
      path: `/api/invites/${contractId}`,
      method: "POST",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 파일 업로드를 위한 presigned URL을 생성합니다. <br> - fileName은 필수입니다.<br> - fileName에는 확장자가 포함되어야 합니다. <br><br>  `presigned URL의 유효시간은 10분입니다.` <br><br> `response되는 fileKey로 S3에 PUT한 뒤, 서명, 인증사진 생성에 똑같이 사용하면 됩니다.` <br><br> `파일명만 받기 때문에 이미지 mimetype 검증은 없습니다. 이미지파일을 잘 보내주세요`
   *
   * @tags 파일 API
   * @name CreatePresignedUrl
   * @summary Presigned URL 생성
   * @request POST:/api/files/presigned-url
   * @secure
   * @response `200` `CreatePresignedUrlData` Presigned URL 생성 성공
   * @response `400` `ErrorResponse` 잘못된 요청 (fileName 누락 또는 유효하지 않은 파일명, 확장자 없음)
   * @response `401` `ErrorResponse` 유효하지 않은 토큰
   */
  createPresignedUrl = (
    data: CreatePreSignedUrlRequest,
    params: RequestParams = {},
  ) =>
    this.request<CreatePresignedUrlData, CreatePresignedUrlError>({
      path: `/api/files/presigned-url`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 사용자의 계약 목록을 역할별로 페이징하여 조회합니다. 계약자(CONTRACTOR)로 참여한 계약과 감독자(SUPERVISOR)로 참여한 계약을 구분하여 조회하며, 진행중(IN_PROGRESS), 대기중(PENDING),결과대기중(WAIT_RESULT) 계약만 반환합니다.
   *
   * @tags 계약 API
   * @name GetContracts
   * @summary 계약 목록 조회
   * @request GET:/api/contracts
   * @secure
   * @response `200` `GetContractsData` 계약 목록 조회 성공
   * @response `400` `ErrorResponse` 잘못된 요청 (유효하지 않은 역할)
   * @response `401` `ErrorResponse` 인증 실패
   */
  getContracts = (
    query: {
      /**
       * 조회할 역할 (계약자: CONTRACTOR, 감독자: SUPERVISOR)
       * @example "CONTRACTOR"
       */
      role: "CONTRACTOR" | "SUPERVISOR";
      /**
       * 페이징 정보 (기본: page=0, size=10)
       * @example {"page":0,"size":10,"sort":["id,desc"]}
       */
      pageable: object;
    },
    params: RequestParams = {},
  ) =>
    this.request<GetContractsData, GetContractsError>({
      path: `/api/contracts`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 새로운 계약을 생성합니다. 계약자가 작성한 계약서 정보를 저장하고 감독자 초대를 위한 준비를 합니다.
   *
   * @tags 계약 API
   * @name CreateContract
   * @summary 계약 생성
   * @request POST:/api/contracts
   * @secure
   * @response `201` `CreateContractData` 계약 생성 성공
   * @response `400` `ErrorResponse` 잘못된 요청 (필수 필드 누락, 유효성 검증 실패)
   * @response `401` `ErrorResponse` 인증 실패
   */
  createContract = (data: CreateContractRequest, params: RequestParams = {}) =>
    this.request<CreateContractData, CreateContractError>({
      path: `/api/contracts`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 초대받은 계약에 감독으로 참여하고 서명을 등록합니다. 로그인이 필요합니다.
   *
   * @tags 참여 API
   * @name JoinAsSupervisor
   * @summary 감독으로 계약 참여 (서명)
   * @request POST:/api/contracts/{contractId}/signature
   * @secure
   * @response `201` `JoinAsSupervisorData` 감독 참여 성공
   * @response `400` `ErrorResponse` 잘못된 요청
   * @response `401` `ErrorResponse` 인증 실패
   * @response `404` `ErrorResponse` 데이터 없음
   * @response `409` `ErrorResponse` 요청 충돌 (인원 초과 또는 잘못된 계약 상태)
   */
  joinAsSupervisor = (
    contractId: number,
    data: CreateContractorParticipationRequest,
    params: RequestParams = {},
  ) =>
    this.request<JoinAsSupervisorData, JoinAsSupervisorError>({
      path: `/api/contracts/${contractId}/signature`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 요청한 데이터로 인증 객체를 생성하여 저장
   *
   * @tags 인증 API
   * @name CreateProof
   * @summary 인증 생성
   * @request POST:/api/contracts/{contractId}/proofs
   * @secure
   * @response `201` `CreateProofData` 인증 생성 성공
   * @response `400` `ErrorResponse` 잘못된 요청(해당 일에 인증이 이미 존재하거나 인증 이미지가 존재하지 않는 경우)
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 계약에 대한 인증 생성 권한이 없음
   * @response `404` `ErrorResponse` 인증과 연결된 계약이 존재하지 않는 경우
   * @response `409` `ErrorResponse` 오늘 이미 인증을 한 경우
   */
  createProof = (
    contractId: number,
    data: ProofCreateRequest,
    params: RequestParams = {},
  ) =>
    this.request<CreateProofData, CreateProofError>({
      path: `/api/contracts/${contractId}/proofs`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 소셜로그인 없이 테스트 유저를 생성하고 JWT를 반환합니다. <br> 프론트 개발/테스트용 임시 API입니다. <br> nickname, email 등은 임시로 자동 생성되고, 한번 테스트유저가 생성되면 그 계정을 계속 이용합니다.
   *
   * @tags Test Auth API
   * @name TestLogin
   * @summary 테스트 유저 JWT 발급 (프론트 개발용)
   * @request POST:/api/auth/test-login
   * @response `201` `TestLoginData` 테스트 유저 JWT 발급 성공
   */
  testLogin = (params: RequestParams = {}) =>
    this.request<TestLoginData, any>({
      path: `/api/auth/test-login`,
      method: "POST",
      format: "json",
      ...params,
    });
  /**
   * @description 리프레시 토큰으로 access/refresh 토큰을 재발급합니다. <br> - accessToken 만료시간 30분<br> - refreshToken 만료시간 30일
   *
   * @tags Auth API
   * @name Refresh
   * @summary 토큰 재발급
   * @request POST:/api/auth/refresh
   * @response `200` `RefreshData` 토큰 재발급 성공
   * @response `400` `ErrorResponse` 잘못된 요청 (refreshToken 누락 등)
   * @response `401` `ErrorResponse` 유효하지 않은 리프레시 토큰
   * @response `404` `ErrorResponse` 존재하지 않거나 탈퇴한 유저
   */
  refresh = (data: RefreshRequest, params: RequestParams = {}) =>
    this.request<RefreshData, RefreshError>({
      path: `/api/auth/refresh`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 로그아웃 처리. 리프레시 토큰을 무효화합니다. <br> result는 null <br>인증 필요.
   *
   * @tags Auth API
   * @name Logout
   * @summary 로그아웃
   * @request POST:/api/auth/logout
   * @secure
   * @response `200` `LogoutData` 로그아웃 성공
   * @response `401` `ErrorResponse` 유효하지 않은 토큰
   * @response `404` `ErrorResponse` 존재하지 않는 유저
   */
  logout = (params: RequestParams = {}) =>
    this.request<LogoutData, LogoutError>({
      path: `/api/auth/logout`,
      method: "POST",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 소셜 플랫폼의 Access Token으로 로그인/회원가입을 처리하고, 자체 JWT를 HttpOnly 쿠키에 담아 반환합니다. 응답 Body에는 **성공 메시지만 포함** 됩니다. <br> - provider는 **[KAKAO | NAVER]** 만 허용됩니다. <br> - accessToken 만료시간 30분<br> - refreshToken 만료시간 30일<br> - fcmToken은 선택사항이며, 제공 시 푸시 알림에 사용됩니다.
   *
   * @tags Auth API
   * @name SocialLoginForCookie
   * @summary 소셜 로그인 (Cookie 방식)
   * @request POST:/api/auth/login/social/cookie
   * @response `201` `SocialLoginForCookieData` 로그인/회원가입 성공. 토큰은 쿠키로 설정됨
   * @response `400` `ErrorResponse` 잘못된 요청 (provider, accessToken 누락 등)
   * @response `401` `ErrorResponse` 유효하지 않은 소셜 AccessToken
   */
  socialLoginForCookie = (
    data: SocialLoginRequest,
    params: RequestParams = {},
  ) =>
    this.request<SocialLoginForCookieData, SocialLoginForCookieError>({
      path: `/api/auth/login/social/cookie`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 소셜 플랫폼의 Access Token으로 로그인/회원가입을 처리하고, 자체 JWT를 응답 Body에 담아 반환합니다. <br> - provider는 **[KAKAO | NAVER]** 만 허용됩니다.<br> - accessToken 만료시간 30분<br> - refreshToken 만료시간 30일<br> - fcmToken은 선택사항이며, 제공 시 푸시 알림에 사용됩니다.
   *
   * @tags Auth API
   * @name SocialLoginForBody
   * @summary 소셜 로그인 (Body 방식)
   * @request POST:/api/auth/login/social/body
   * @response `201` `SocialLoginForBodyData` 로그인/회원가입 성공
   * @response `400` `ErrorResponse` 잘못된 요청 (provider, accessToken 누락 등)
   * @response `401` `ErrorResponse` 유효하지 않은 소셜 AccessToken
   */
  socialLoginForBody = (data: SocialLoginRequest, params: RequestParams = {}) =>
    this.request<SocialLoginForBodyData, SocialLoginForBodyError>({
      path: `/api/auth/login/social/body`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 인증된 사용자의 정보를 조회합니다.
   *
   * @tags 유저 API
   * @name GetMyInfo
   * @summary 내 정보 조회
   * @request GET:/api/users/me
   * @secure
   * @response `200` `GetMyInfoData` 조회 성공
   * @response `401` `ErrorResponse` 유효하지 않은 토큰
   * @response `404` `ErrorResponse` 존재하지 않는 유저
   */
  getMyInfo = (params: RequestParams = {}) =>
    this.request<GetMyInfoData, GetMyInfoError>({
      path: `/api/users/me`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 인증된 사용자의 계정을 삭제합니다.
   *
   * @tags 유저 API
   * @name DeleteMyAccount
   * @summary 회원 탈퇴
   * @request DELETE:/api/users/me
   * @secure
   * @response `200` `DeleteMyAccountData` 탈퇴 성공
   * @response `401` `ErrorResponse` 유효하지 않은 토큰
   * @response `404` `ErrorResponse` 존재하지 않는 유저
   */
  deleteMyAccount = (params: RequestParams = {}) =>
    this.request<DeleteMyAccountData, DeleteMyAccountError>({
      path: `/api/users/me`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 인증된 사용자의 닉네임을 수정합니다. <br> - nickname
   *
   * @tags 유저 API
   * @name UpdateMyInfo
   * @summary 내 정보 수정
   * @request PATCH:/api/users/me
   * @secure
   * @response `200` `UpdateMyInfoData` 수정 성공
   * @response `400` `ErrorResponse` 잘못된 요청 (nickname이 없거나 공백, 또는 10자 초과)
   * @response `401` `ErrorResponse` 유효하지 않은 토큰
   * @response `404` `ErrorResponse` 존재하지 않는 유저
   */
  updateMyInfo = (data: UpdateMyInfoRequest, params: RequestParams = {}) =>
    this.request<UpdateMyInfoData, UpdateMyInfoError>({
      path: `/api/users/me`,
      method: "PATCH",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description 주어진 알림 ID에 해당하는 알림을 읽음 상태로 설정합니다.
   *
   * @tags 알림 API
   * @name MarkSingleNotificationAsRead
   * @summary 알림 읽음 처리
   * @request PATCH:/api/notifications/{notificationId}/read
   * @secure
   * @response `200` `MarkSingleNotificationAsReadData` 읽음 처리 성공 (응답 없음)
   * @response `401` `ErrorResponse` 유효하지 않은 토큰
   * @response `404` `ErrorResponse` 존재하지 않는 알림
   */
  markSingleNotificationAsRead = (
    notificationId: number,
    params: RequestParams = {},
  ) =>
    this.request<
      MarkSingleNotificationAsReadData,
      MarkSingleNotificationAsReadError
    >({
      path: `/api/notifications/${notificationId}/read`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 진행 중인 계약을 중도에 포기합니다. 계약 상태가 ABANDONED로 변경되며, 계약자만 실행할 수 있습니다.
   *
   * @tags 계약 API
   * @name WithdrawContract
   * @summary 계약 중도 포기
   * @request PATCH:/api/contracts/{contractId}/withdraw
   * @secure
   * @response `200` `WithdrawContractData` 계약 중도 포기 성공
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 접근 권한 없음 (계약자가 아닌 사용자)
   * @response `404` `ErrorResponse` 계약을 찾을 수 없음
   * @response `409` `ErrorResponse` 계약 상태 오류 (진행 중이 아닌 계약)
   */
  withdrawContract = (contractId: number, params: RequestParams = {}) =>
    this.request<WithdrawContractData, WithdrawContractError>({
      path: `/api/contracts/${contractId}/withdraw`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 시작 전인 계약에 대한 감독 참여를 완전히 철회합니다. 참여 기록이 삭제됩니다. 로그인이 필요합니다.
   *
   * @tags 참여 API
   * @name WithdrawAsSupervisor
   * @summary 감독 참여 철회 (계약 시작 전)
   * @request DELETE:/api/contracts/{contractId}/supervisors/withdraw
   * @secure
   * @response `200` `WithdrawAsSupervisorData` 감독 철회 성공
   * @response `401` `ErrorResponse` 인증 실패
   * @response `404` `ErrorResponse` 데이터 없음
   * @response `409` `ErrorResponse` 잘못된 계약 상태
   */
  withdrawAsSupervisor = (contractId: number, params: RequestParams = {}) =>
    this.request<WithdrawAsSupervisorData, WithdrawAsSupervisorError>({
      path: `/api/contracts/${contractId}/supervisors/withdraw`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 진행 중인 계약의 감독 역할을 포기합니다. 참여 기록은 남고 상태만 변경됩니다. 로그인이 필요합니다.
   *
   * @tags 참여 API
   * @name AbandonAsSupervisor
   * @summary 감독 중도 포기 (계약 진행 중)
   * @request PATCH:/api/contracts/{contractId}/supervisors/withdraw
   * @secure
   * @response `200` `AbandonAsSupervisorData` 감독 중도 포기 성공
   * @response `401` `ErrorResponse` 인증 실패
   * @response `404` `ErrorResponse` 데이터 없음
   * @response `409` `ErrorResponse` 잘못된 계약 상태
   */
  abandonAsSupervisor = (contractId: number, params: RequestParams = {}) =>
    this.request<AbandonAsSupervisorData, AbandonAsSupervisorError>({
      path: `/api/contracts/${contractId}/supervisors/withdraw`,
      method: "PATCH",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 한 달에 대한 처리 완료된 인증 정보를 응답에 담아 반환 (대기중인 인증은 반환 X)
   *
   * @tags 인증 API
   * @name GetSupervisorProofList
   * @summary 감독자용 인증 목록 조회
   * @request GET:/api/supervisors/contracts/{contractId}/proofs
   * @secure
   * @response `200` `GetSupervisorProofListData` 감독자용 인증 목록 조회 성공
   * @response `400` `ErrorResponse` 잘못된 값으로 요청
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 계약에 대한 접근 권한이 없음
   * @response `404` `ErrorResponse` 계약이 존재하지 않음
   */
  getSupervisorProofList = (
    contractId: number,
    query: {
      /**
       * 년
       * @format int32
       */
      year: number;
      /**
       * 월
       * @format int32
       */
      month: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<GetSupervisorProofListData, GetSupervisorProofListError>({
      path: `/api/supervisors/contracts/${contractId}/proofs`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 인증에 대한 상세 정보를 응답에 담아 반환
   *
   * @tags 인증 API
   * @name GetProofDetail
   * @summary 인증 상세 조회
   * @request GET:/api/proofs/{proofId}
   * @secure
   * @response `200` `GetProofDetailData` 인증 상세 조회 성공
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 계약에 대한 접근 권한이 없음
   * @response `404` `ErrorResponse` 인증이 존재하지 않는 경우
   */
  getProofDetail = (proofId: number, params: RequestParams = {}) =>
    this.request<GetProofDetailData, GetProofDetailError>({
      path: `/api/proofs/${proofId}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 현재 로그인한 사용자의 모든 알림 목록을 페이지네이션으로 조회합니다. <br> 페이지네이션 정보 (기본값: page=0, size=10, sort=createdAt,desc)
   *
   * @tags 알림 API
   * @name GetAllNotifications
   * @summary 알림 목록 조회
   * @request GET:/api/notifications
   * @secure
   * @response `200` `GetAllNotificationsData` 조회 성공
   * @response `400` `ErrorResponse` 잘못된 페이지네이션 요청
   * @response `401` `ErrorResponse` 유효하지 않은 토큰
   */
  getAllNotifications = (
    query?: {
      /**
       * Zero-based page index (0..N)
       * @default 0
       */
      page?: number;
      /**
       * The size of the page to be returned
       * @default 20
       */
      size?: number;
      /** Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. */
      sort?: string[];
    },
    params: RequestParams = {},
  ) =>
    this.request<GetAllNotificationsData, GetAllNotificationsError>({
      path: `/api/notifications`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 현재 로그인한 사용자의 모든 알림을 삭제합니다.
   *
   * @tags 알림 API
   * @name DeleteAllNotification
   * @summary 알림 전체 삭제
   * @request DELETE:/api/notifications
   * @secure
   * @response `200` `DeleteAllNotificationData` 삭제 성공
   * @response `401` `ErrorResponse` 유효하지 않은 토큰
   */
  deleteAllNotification = (params: RequestParams = {}) =>
    this.request<DeleteAllNotificationData, DeleteAllNotificationError>({
      path: `/api/notifications`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 현재 로그인한 사용자가 읽지 않은 알림의 개수를 조회합니다.
   *
   * @tags 알림 API
   * @name CountUnreadNotificationByUserId
   * @summary 읽지 않은 알림 개수 조회
   * @request GET:/api/notifications/unread
   * @secure
   * @response `200` `CountUnreadNotificationByUserIdData` 조회 성공
   * @response `401` `ErrorResponse` 유효하지 않은 토큰
   */
  countUnreadNotificationByUserId = (params: RequestParams = {}) =>
    this.request<
      CountUnreadNotificationByUserIdData,
      CountUnreadNotificationByUserIdError
    >({
      path: `/api/notifications/unread`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 초대 코드가 유효한지(만료되지 않았는지) 확인합니다.
   *
   * @tags 초대 API
   * @name CheckInviteLink
   * @summary 초대링크 유효성 검사
   * @request GET:/api/invites/{inviteCode}
   * @response `200` `CheckInviteLinkData` 초대링크 유효함
   * @response `404` `ErrorResponse` 존재하지 않거나 만료된 초대링크
   */
  checkInviteLink = (inviteCode: string, params: RequestParams = {}) =>
    this.request<CheckInviteLinkData, CheckInviteLinkError>({
      path: `/api/invites/${inviteCode}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description 비밀번호 검증 후 계약서의 상세 정보를 조회합니다.
   *
   * @tags 초대 API
   * @name GetContractInfo
   * @summary 초대 계약서 상세 조회
   * @request GET:/api/invites/{inviteCode}/detail/{contractUuid}
   * @response `200` `GetContractInfoData` 계약서 조회 성공
   * @response `400` `ErrorResponse` 요청한 사용자가 이미 계약에 참여한 경우
   * @response `404` `ErrorResponse` 초대링크에 해당하는 계약이 없거나 계약의 계약자가 없는 경우
   * @response `409` `ErrorResponse` 이미 5명의 감독자가 전부 채워진 경우
   */
  getContractInfo = (
    inviteCode: string,
    contractUuid: string,
    params: RequestParams = {},
  ) =>
    this.request<GetContractInfoData, GetContractInfoError>({
      path: `/api/invites/${inviteCode}/detail/${contractUuid}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * @description 계약의 제목과 목표만을 조회합니다. 유효한 참여자(계약자 또는 감독자)만 조회할 수 있습니다. 감독자 리스트에서 간단한 계약 정보를 표시할 때 사용합니다.
   *
   * @tags 계약 API
   * @name GetContractTitleInfo
   * @summary 계약 제목 정보 조회
   * @request GET:/api/contracts/{contractId}/titleInfo
   * @secure
   * @response `200` `GetContractTitleInfoData` 계약 제목 정보 조회 성공
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 접근 권한 없음 (계약 참여자가 아닌 사용자)
   * @response `404` `ErrorResponse` 계약을 찾을 수 없음
   */
  getContractTitleInfo = (contractId: number, params: RequestParams = {}) =>
    this.request<GetContractTitleInfoData, GetContractTitleInfoError>({
      path: `/api/contracts/${contractId}/titleInfo`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 최근 3개의 인증의 데이터를 응답에 담아 반환 (0~3개 응답 예정)
   *
   * @tags 인증 API
   * @name GetRecentProofs
   * @summary 최근 인증 조회
   * @request GET:/api/contracts/{contractId}/proofs/recent
   * @secure
   * @response `200` `GetRecentProofsData` 최근 인증 조회 성공
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 계약에 대한 접근 권한이 없음
   */
  getRecentProofs = (contractId: number, params: RequestParams = {}) =>
    this.request<GetRecentProofsData, GetRecentProofsError>({
      path: `/api/contracts/${contractId}/proofs/recent`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 승인/거절 처리를 해야하는 대기중인 인증 데이터를 응답에 담아 반환 (대기중인 인증이 여러 개일 수 있음)
   *
   * @tags 인증 API
   * @name GetAwaitProofs
   * @summary 대기중인 인증들 조회
   * @request GET:/api/contracts/{contractId}/proofs/await
   * @secure
   * @response `200` `GetAwaitProofsData` 대기중인 인증 조회 성공
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 계약에 대한 접근 권한이 없음
   * @response `404` `ErrorResponse` 계약이 존재하지 않음
   */
  getAwaitProofs = (contractId: number, params: RequestParams = {}) =>
    this.request<GetAwaitProofsData, GetAwaitProofsError>({
      path: `/api/contracts/${contractId}/proofs/await`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 계약서 미리보기 화면을 위한 정보를 조회합니다. 계약에 참여한 사용자만 조회할 수 있습니다.
   *
   * @tags 계약 API
   * @name GetContractPreview
   * @summary 계약 미리보기
   * @request GET:/api/contracts/{contractId}/preview
   * @secure
   * @response `200` `GetContractPreviewData` 계약 미리보기 조회 성공
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 접근 권한 없음 (계약 참여자가 아닌 사용자)
   * @response `404` `ErrorResponse` 계약을 찾을 수 없음
   */
  getContractPreview = (contractId: number, params: RequestParams = {}) =>
    this.request<GetContractPreviewData, GetContractPreviewError>({
      path: `/api/contracts/${contractId}/preview`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 사용자의 완료된 계약 히스토리를 조회합니다. 계약자/감독자 역할별로 필터링하고, 키워드 검색과 상태별 필터링이 가능합니다.<br> role은 CONTRACTOR, SUPERVISOR 중 하나여야 합니다.<br> status는 COMPLETED, FAILED, ABANDONED 중 하나여야 합니다.
   *
   * @tags 계약 API
   * @name GetContractHistory
   * @summary 계약 히스토리 조회
   * @request GET:/api/contracts/history
   * @secure
   * @response `200` `GetContractHistoryData` 계약 히스토리 조회 성공
   * @response `400` `ErrorResponse` 잘못된 요청 (유효하지 않은 role 또는 status)
   * @response `401` `ErrorResponse` 인증 실패
   */
  getContractHistory = (
    query: {
      /**
       * 조회할 역할 (CONTRACTOR/SUPERVISOR)
       * @example "CONTRACTOR"
       */
      role: string;
      /**
       * 검색 키워드
       * @example "운동"
       */
      keyword?: string;
      /**
       * 종료일
       * @format date-time
       * @example "2025-07-11T23:59:59Z"
       */
      endDate?: string;
      /**
       * 계약 타입
       * @example "PENDING"
       */
      status?: string;
      /**
       * Zero-based page index (0..N)
       * @min 0
       * @default 0
       */
      page?: number;
      /**
       * The size of the page to be returned
       * @min 1
       * @default 10
       */
      size?: number;
      /**
       * Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
       * @default ["endDate,DESC"]
       */
      sort?: string[];
    },
    params: RequestParams = {},
  ) =>
    this.request<GetContractHistoryData, GetContractHistoryError>({
      path: `/api/contracts/history`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 한 달에 대한 인증 정보를 응답에 담아 반환
   *
   * @tags 인증 API
   * @name GetContractorProofList
   * @summary 계약자용 인증 목록 조회
   * @request GET:/api/contractors/contracts/{contractId}/proofs
   * @secure
   * @response `200` `GetContractorProofListData` 계약자용 인증 목록 조회 성공
   * @response `400` `ErrorResponse` 잘못된 값으로 요청
   * @response `401` `ErrorResponse` 인증 실패
   * @response `403` `ErrorResponse` 계약에 대한 접근 권한이 없음
   * @response `404` `ErrorResponse` 계약이 존재하지 않음
   */
  getContractorProofList = (
    contractId: number,
    query: {
      /**
       * 년
       * @format int32
       */
      year: number;
      /**
       * 월
       * @format int32
       */
      month: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<GetContractorProofListData, GetContractorProofListError>({
      path: `/api/contractors/contracts/${contractId}/proofs`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description 주어진 알림 ID에 해당하는 알림을 삭제합니다.
   *
   * @tags 알림 API
   * @name DeleteSingleNotification
   * @summary 알림 단건 삭제
   * @request DELETE:/api/notifications/{notificationId}
   * @secure
   * @response `200` `DeleteSingleNotificationData` 삭제 성공 (응답 없음)
   * @response `401` `ErrorResponse` 유효하지 않은 토큰
   * @response `404` `ErrorResponse` 존재하지 않는 알림
   */
  deleteSingleNotification = (
    notificationId: number,
    params: RequestParams = {},
  ) =>
    this.request<DeleteSingleNotificationData, DeleteSingleNotificationError>({
      path: `/api/notifications/${notificationId}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
}
