만들어야할 api 목록을 대강 정리해봅시다 :)

있어야될 것 같은데 다룬 적 없거나 기획에서 빠져있었다면 바로 논의

상세 Request, Response는 추후 Swagger로 상세히 제공

### 회원가입

| 기능            | 메서드 | url           | 예상 statusCode | 비고                                      | 담당자 |
| --------------- | ------ | ------------- | --------------- | ----------------------------------------- | ------ |
| 회원가입/로그인 | POST   | /auth/social  | 201, 400        | provider, 써드파티 accessToken을 넘겨받음 | 김수혁 |
| 리프레시        | POST   | /auth/refresh | 201             |                                           | 김수혁 |
| 로그아웃        | POST   | /auth/signout | 204             |                                           | 김수혁 |

### 유저

| 기능           | 메서드 | url       | 예상 statusCode | 비고        | 담당자 |
| -------------- | ------ | --------- | --------------- | ----------- | ------ |
| 유저 정보 수정 | PATCH  | /users/me | 200, 400        | 닉네임 변경 | 김수혁 |
| 회원 탈퇴      | POST   | /users/me | 200             |             | 김수혁 |
| 유저 정보 조회 | GET    | /users/me | 200             |             | 김수혁 |

### 계약

| 기능                       | 메서드 | url                                         | 예상 statusCode | 비고                                                     | 담당자    |
| -------------------------- | ------ | ------------------------------------------- | --------------- | -------------------------------------------------------- | --------- |
| 계약 생성 (계약 서명 포함) | POST   | /contracts                                  | 201, 400        | 예외 관련 명세 상세히                                    | 이상진 🔥 |
| 계약 포기 (시작 전)        | DELETE | /contracts/{contractId}                     | 204, 400        |                                                          |           |
| 계약 중도 포기             | PATCH  | /contracts/{contractId}/contractor/withdraw |                 | 더 못올리게 막기 / 인증기록은 유지 / 상태변경 (이행실패) |           |
| 계약 목록 조회             | GET    | /contracts                                  | 200, 400        |                                                          |           |
| 계약 상세 조회             | GET    | /contracts/{contractId}                     | 200, 404        |                                                          |           |

| 끝난 계약 목록 조회
(히스토리) | GET | /users/contracts/history?subject=challenger&keyword={keyword}&type={type} | 200, 400 | | |
| | | | | | |
| 감독 계약 목록 조회 | GET | /contracts/supervision | 200, 400 | | |
| 감독자 계약 서명 | POST | /contracts/{contractId}/signature | 201, 400 | | |
| 감독 계약 상세 조회 | GET | /contracts/supervision/{contractId} | 200, 404 | | |
| 끝난 감독 계약 목록 조회
(히스토리) | GET | /users/contracts/history?subject=supervision&keyword={keyword}&type={type} | 200, 400 | | |
| 감독 포기 | PATCH | /contracts/{contractId}/supervision/withdraw | 204, 400 | | |

### 파일

| 기능               | 메서드 | url        | 예상 statusCode | 비고                                   | 담당자 |
| ------------------ | ------ | ---------- | --------------- | -------------------------------------- | ------ |
| presigned url 요청 | POST   | /presigned | 201, 400        | 파일명(확장자포함)을 요청데이터에 포함 | 김수혁 |

### 인증

| 기능                      | 메서드 | url                                                      | 예상 statusCode | 비고                   | 담당자 |
| ------------------------- | ------ | -------------------------------------------------------- | --------------- | ---------------------- | ------ |
| 인증 생성                 | POST   | /contracts/{contractId}/proofs                           | 201, 400        | 예외 관련 명세 상세히  |        |
| 인증 상세 정보 조회       | GET    | /proofs/{proofId}                                        | 200, 404        |                        |        |
| 인증 목록 조회(한달)      | GET    | /contracts/{contractId}/proofs?year={year}&month={month} | 200,            | 쿼리파라미터로 월 지정 |        |
| 최근 3개 인증 조회        | GET    | /contracts/{contractId}/proofs/recent                    | 200,            |                        |        |
| 재인증 생성               | POST   | /proofs/{proofId}/again                                  | 201, 400        |                        |        |
| 대기중인 인증 조회(감독)  | GET    | /contracts/{contractId}/proofs/await                     | 200,            |                        |        |
| 감독자 인증 처리 (피드백) | POST   | /proofs/{proofId}/feedback                               | 201, 403, 404   |                        |        |
|                           |        |                                                          |                 |                        |        |
|                           |        |                                                          |                 |                        |        |

### 초대링크 & 계약서

추후 조정될 가능성 있음

| 기능          | 메서드 | url                            | 예상 statusCode | 비고                          | 담당자 |
| ------------- | ------ | ------------------------------ | --------------- | ----------------------------- | ------ |
| 초대링크 생성 | POST   | /contracts/{contractId}/invite | 201             | [프론트 도메인 초대 url 예시] |

[https://jinjjahalgae.xyz/contract/invite](https://jinjjahalgae.xyz/contract/invite/1Ba21idp8)/[1Ba21idp8](https://jinjjahalgae.xyz/contract/invite/1Ba21idp8)

[추후 활용 방향]

1. 계약서 조회를 해서 존재하는 계약서인지 확인하고 있으면 비밀번호 입력 페이지 띄우기
2. 비밀번호 검사
3. 비밀번호가 유효하면 ajax로 계약서 조회

[1Ba21idp8](https://jinjjahalgae.xyz/contract/invite/1Ba21idp8) → inviteCode
inviteCode ≠ 비밀번호

response에 일회성 비밀번호와 초대 url 포함

**response body**
{
“password” :”41jkfads”,
“inviteUrl”: “[https://jinjjahalgae.xyz/contract/invite](https://jinjjahalgae.xyz/contract/invite/1Ba21idp8)/[1Ba21idp8](https://jinjjahalgae.xyz/contract/invite/1Ba21idp8)”
}
| 황치연 |
| 초대링크 비밀번호 확인 | POST | /invites/{inviteCode}/verify | 200, 400, 401 | request body에 password 포함
response body에 계약서 uuid 포함 | 황치연 |
| 계약서 조회 | GET | /invites/{inviteCode}/detail/{contractUuid} | 200 | | 황치연 |
| 계약서 존재 조회 | GET | /invites/{inviteCode} | 200,404 | | 황치연 |

### 알림

| 기능                | 메서드 | url                             | 예상 statusCode | 비고                                   | 담당자 |
| ------------------- | ------ | ------------------------------- | --------------- | -------------------------------------- | ------ |
| 알림 목록 조회      | GET    | /notifications                  | 200             | 파일명(확장자포함)을 요청데이터에 포함 |        |
| 알림 목록 전체 삭제 | DELETE | /notifications                  | 204             |                                        |        |
| 알림 개별 삭제      | DELETE | /notifications/{notificationId} | 204             |                                        |        |
