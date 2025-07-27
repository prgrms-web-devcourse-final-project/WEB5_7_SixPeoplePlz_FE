# 진짜할게 (JinjjaHalgae)

계약 기반 목표 달성 앱 - 지인들의 감시와 패널티로 목표를 확실히 달성하세요!

## 📱 프로젝트 소개

진짜할게는 사용자가 자신의 목표를 설정하고, 달성하지 못했을 경우의 패널티를 걸어서 동기를 부여하는 **나와 지인 간의 계약 기반 목표 달성 앱**입니다.

### 🚀 현재 프로젝트 상태

#### ✅ 완료된 작업 (API 연동)

- **API 클라이언트 시스템**: 모든 백엔드 API 엔드포인트에 대한 TypeScript 클라이언트 구현
- **인증 페이지**: 소셜 로그인, JWT 토큰 관리 완료
- **메인 페이지**: 계약 목록 조회 API 연동 완료
- **알림 페이지**: 알림 조회, 삭제 API 연동 완료
- **계약 생성 페이지**: 계약 생성, 초대링크 생성 API 연동 완료
- **프로필 페이지**: 사용자 정보 조회, 계약 히스토리, 로그아웃 API 연동 완료

#### 🔄 진행 중인 작업

- **계약 상세/인증 페이지**: API 연동 진행 중
- **초대 페이지**: 감독자 초대 플로우 API 연동 진행 중
- **파일 업로드**: S3 presigned URL 업로드 플로우 구현 필요

#### 📋 남은 작업

- [ ] 모든 페이지의 API 연동 완료 및 에러 처리 개선
- [ ] 파일 업로드 (계약서 서명, 인증 사진) 기능 완성
- [ ] 실시간 알림 (WebSocket/SSE) 연동
- [ ] 글로벌 상태 관리 (사용자 정보, 인증 상태) 추가
- [ ] 로딩/에러 상태 개선 및 UX 향상
- [ ] 실제 백엔드와의 테스트 및 최종 검증

### 주요 특징

- 🤝 **계약 기반**: 명확한 목표와 기간, 보상/벌칙 설정
- 👥 **감독자 시스템**: 최대 5명의 지인이 감독자로 참여
- 📸 **사진 인증**: 매일 목표 실행을 사진으로 인증
- ⭐ **피드백 시스템**: 감독자들이 인증을 승인/거절하며 코멘트 제공
- 📊 **진행률 추적**: 실시간으로 목표 달성률 확인

## 🛠 기술 스택

### Frontend

- **Framework**: Next.js 15.3.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **State Management**: React Hooks
- **Deployment**: Vercel

### Backend (예정)

- **Language**: Java (JDK 21)
- **Framework**: Spring Boot 3.5.3
- **Database**: MySQL, Redis
- **Authentication**: JWT, OAuth2.0 (Kakao, Naver)
- **File Storage**: AWS S3
- **Deployment**: AWS EC2

## 📁 프로젝트 구조

```
src/
├── app/                          # Next.js App Router 페이지
│   ├── auth/                     # 인증 페이지 (✅ API 연동 완료)
│   ├── page.tsx                  # 메인 페이지 (✅ API 연동 완료)
│   ├── contracts/                # 계약 관련 페이지
│   │   ├── create/               # 계약 생성 (✅ API 연동 완료)
│   │   ├── [id]/                 # 계약 상세 (🔄 API 연동 중)
│   │   └── [id]/verify/          # 인증하기 (🔄 API 연동 중)
│   ├── supervise/                # 감독자 페이지 (📋 API 연동 필요)
│   ├── invite/                   # 초대 링크 처리 (🔄 API 연동 중)
│   ├── notifications/            # 알림 페이지 (✅ API 연동 완료)
│   └── profile/                  # 마이페이지 (✅ API 연동 완료)
├── lib/
│   ├── api/                      # API 클라이언트 시스템 (✅ 완성)
│   │   ├── api.ts                # 기본 API 설정, 토큰 관리
│   │   ├── auth.ts               # 인증 API
│   │   ├── users.ts              # 사용자 API
│   │   ├── contracts.ts          # 계약 API
│   │   ├── proofs.ts             # 인증 API
│   │   ├── files.ts              # 파일 업로드 API
│   │   ├── invites.ts            # 초대 API
│   │   ├── notifications.ts      # 알림 API
│   │   └── index.ts              # 통합 export
│   └── api.ts                    # 레거시 API 파일 (제거 예정)
└── components/                   # 공통 컴포넌트
    ├── ui.tsx                    # UI 컴포넌트
    └── BottomNavigation.tsx      # 하단 네비게이션
```

## 🔧 API 클라이언트 시스템

### 주요 특징

- **타입 안전성**: 모든 API 요청/응답에 대한 TypeScript 타입 정의
- **토큰 관리**: 자동 JWT 토큰 포함 및 리프레시 토큰 처리
- **에러 처리**: 통일된 에러 핸들링 및 사용자 친화적 메시지
- **파일 업로드**: S3 presigned URL을 활용한 파일 업로드 지원

### 사용 예시

```typescript
// 인증
import { socialLogin } from "@/lib/api/auth";
await socialLogin({ provider: "kakao", accessToken: "token" });

// 계약 관리
import { createContract, getMyContracts } from "@/lib/api/contracts";
const contracts = await getMyContracts("CONTRACTOR");
const newContract = await createContract(contractData);

// 알림
import { getNotifications, deleteNotification } from "@/lib/api/notifications";
const notifications = await getNotifications();
await deleteNotification(notificationId);
```

## 🔧 주요 기능

### 📋 계약 관리

- **계약 생성**: 다단계 프로세스로 상세한 목표 설정
- **템플릿 선택**: 5가지 계약서 디자인 템플릿
- **감독자 초대**: 링크와 비밀번호로 안전한 초대
- **계약 수정**: 감독자 서명 전까지 수정 가능
- **계약 포기**: 시작 전/후 포기 옵션

### 📸 인증 시스템

- **일일 인증**: 최대 3장의 사진으로 목표 실행 인증
- **재인증**: 거절된 인증에 대해 24시간 내 1회 재인증
- **감독자 피드백**: 승인/거절 + 코멘트 시스템
- **자동 승인**: 24시간 내 미처리 시 자동 승인

### 👥 감독자 기능

- **인증 검토**: 대기중인 인증 승인/거절
- **피드백 제공**: 코멘트와 템플릿 메시지 지원
- **진행 모니터링**: 달력 형태로 인증 현황 확인
- **감독 포기**: 필요 시 중도 포기 가능

### 📊 통계 및 히스토리

- **성공률 추적**: 전체 계약 성공률 통계
- **월별 분석**: 월별 계약 현황 그래프
- **역할별 통계**: 계약자/감독자 경험 분석
- **검색 및 필터**: 계약 히스토리 검색 및 필터링

## 🎯 사용 시나리오

1. **계약 생성**: 사용자가 "헬스장 주 3회 가기" 목표로 계약 생성
2. **감독자 초대**: 친구들에게 초대 링크 전송
3. **계약 시작**: 감독자들이 서명하면 계약 시작
4. **일일 인증**: 헬스장에서 운동 후 사진으로 인증
5. **감독자 검토**: 친구들이 인증 사진을 보고 승인/거절
6. **목표 달성**: 설정한 기간 동안 꾸준히 실행하여 목표 달성
7. **보상 수령**: 성공 시 미리 설정한 보상, 실패 시 벌칙 수행

## 🚀 시작하기

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### 환경 변수 설정

```bash
# .env.local 파일 생성
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_AWS_S3_BUCKET=your-bucket-name
```

## 📱 페이지 목록

- **`/`** - 메인 페이지 (내 계약 / 감독중 탭)
- **`/auth`** - 로그인/회원가입
- **`/contracts/create`** - 계약 생성 (6단계)
- **`/contracts/[id]`** - 계약 상세 (개요/인증기록 탭)
- **`/contracts/[id]/verify`** - 인증 제출
- **`/supervise/[id]/verify`** - 감독자 인증 검토
- **`/invite/[code]`** - 감독자 초대 링크
- **`/notifications`** - 알림 목록
- **`/profile`** - 마이페이지 (프로필/히스토리/통계 탭)

## 🎨 디자인 시스템

### 색상

- **Primary**: Blue-600 (#2563eb)
- **Success**: Green-600 (#16a34a)
- **Danger**: Red-600 (#dc2626)
- **Warning**: Yellow-600 (#ca8a04)

### 컴포넌트

- 모든 UI 컴포넌트는 `src/components/ui.tsx`에 정의
- Tailwind CSS 기반의 일관된 디자인
- 모바일 우선 반응형 디자인

## 📈 향후 계획

- [ ] 백엔드 API 연동
- [ ] 실제 파일 업로드 기능
- [ ] 푸시 알림 (FCM)
- [ ] 소셜 로그인 구현
- [ ] 결제 시스템 (패널티 자동 이행)
- [ ] React Native 앱 개발
- [ ] 실시간 알림 (WebSocket)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

---

**진짜할게**로 미루던 목표를 확실히 달성해보세요! 💪

## 🔧 소셜 로그인 설정

### 카카오 로그인 설정

1. [카카오 개발자 센터](https://developers.kakao.com/)에서 애플리케이션 등록
2. **플랫폼 설정** > **Web** 추가
3. **제품 설정** > **카카오 로그인** 활성화
4. **Redirect URI** 설정:
   - 개발: `http://localhost:3000/login/oauth2/code/kakao`
   - 배포: `https://yourdomain.com/login/oauth2/code/kakao`
5. **동의항목** 설정에서 필요한 정보 체크:
   - 닉네임 (필수)
   - 카카오계정(이메일) (필수)
   - 성별 (선택)
6. `.env.local`에 환경변수 설정:
   ```env
   NEXT_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key
   NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/login/oauth2/code/kakao
   ```

### 네이버 로그인 설정

1. [네이버 개발자 센터](https://developers.naver.com/)에서 애플리케이션 등록
2. **API 설정**에서 **네아로(네이버 아이디로 로그인)** 추가
3. **서비스 URL** 및 **Callback URL** 설정:
   - 서비스 URL: `http://localhost:3000` (개발) / `https://yourdomain.com` (배포)
   - Callback URL: `http://localhost:3000/login/oauth2/code/naver` (개발) / `https://yourdomain.com/login/oauth2/code/naver` (배포)
4. **제공정보** 선택:
   - 이메일 주소 (필수)
   - 닉네임 (필수)
   - 성별 (선택)
5. `.env.local`에 환경변수 설정:
   ```env
   NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id
   NEXT_PUBLIC_NAVER_CLIENT_SECRET=your_naver_client_secret
   ```

### 주의사항

- 백엔드 서버에서도 동일한 Redirect URI를 설정해야 합니다
- 배포 시에는 실제 도메인으로 Redirect URI를 변경해야 합니다
- Client Secret은 보안을 위해 환경변수로 관리합니다
