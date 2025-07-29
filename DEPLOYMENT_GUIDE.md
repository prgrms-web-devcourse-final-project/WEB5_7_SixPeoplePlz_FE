# 배포 가이드 (Deployment Guide)

이 문서는 진짜할게 프로젝트의 웹 애플리케이션과 모바일 앱 배포 방법을 설명합니다.

## 📁 프로젝트 구조

- `jinjahalgae/` - Next.js 웹 애플리케이션 (Vercel 배포)
- `jinjjahalgae-app/` - React Native Expo 앱 (앱스토어 배포)

---

## 🌐 웹 애플리케이션 배포 (Vercel)

### 프로젝트 정보
- **프로젝트**: `jinjahalgae/`
- **프레임워크**: Next.js 15.3.5
- **패키지 매니저**: pnpm
- **배포 플랫폼**: Vercel

### 배포 방법

#### 1. Vercel CLI를 사용한 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# jinjahalgae 디렉토리로 이동
cd jinjahalgae

# 의존성 설치
pnpm install

# 빌드 테스트
pnpm build

# Vercel에 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### 2. Vercel 웹 인터페이스를 통한 배포

**단계별 가이드:**

1. **Vercel 계정 생성 및 로그인**
   - [vercel.com](https://vercel.com)에 접속
   - GitHub, GitLab, Bitbucket 계정으로 로그인

2. **새 프로젝트 생성**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 저장소 선택 (jinjahalgae 프로젝트)
   - "Import" 클릭

3. **프로젝트 설정**
   - **Framework Preset**: `Next.js` 선택
   - **Root Directory**: `jinjahalgae` 입력
   - **Build Command**: `pnpm build` 입력
   - **Output Directory**: `.next` 입력
   - **Install Command**: `pnpm install` 입력

4. **환경 변수 설정**
   - "Environment Variables" 섹션에서 추가:
     - **Name**: `NEXT_PUBLIC_MOCK_API`
     - **Value**: `false`
     - **Environment**: Production, Preview, Development 모두 선택

5. **배포 설정**
   - "Deploy" 클릭하여 첫 배포 실행
   - 배포 완료 후 자동으로 URL 생성

#### 3. GitHub 연동을 통한 자동 배포

1. **GitHub 저장소 연결**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 설정:
     - **Framework Preset**: Next.js
     - **Root Directory**: `jinjahalgae`
     - **Build Command**: `pnpm build`
     - **Output Directory**: `.next`

2. **환경 변수 설정**
   ```
   NEXT_PUBLIC_MOCK_API=false
   ```

3. **자동 배포 설정**
   - `main` 브랜치에 푸시 시 자동 배포
   - Pull Request 시 프리뷰 배포

#### 4. 수동 배포 스크립트

```bash
#!/bin/bash
# deploy-web.sh

cd jinjahalgae

# 의존성 설치
pnpm install

# 빌드
pnpm build

# Vercel 배포
vercel --prod --yes
```

### 배포 확인

```bash
# 빌드 상태 확인
pnpm build

# 로컬에서 프로덕션 빌드 테스트
pnpm start
```

### Vercel 웹 인터페이스 관리

#### 프로젝트 설정 변경
1. **Vercel 대시보드** → 프로젝트 선택
2. **Settings** 탭에서 설정 변경:
   - **General**: 프로젝트 이름, 도메인 설정
   - **Build & Development**: 빌드 명령어, 환경 변수
   - **Domains**: 커스텀 도메인 설정

#### 환경 변수 관리
1. **Settings** → **Environment Variables**
2. 환경별 변수 설정:
   - **Production**: 프로덕션 환경
   - **Preview**: PR 및 브랜치 배포
   - **Development**: 로컬 개발 환경

#### 배포 히스토리 확인
1. **Deployments** 탭에서 모든 배포 기록 확인
2. 각 배포의 상세 정보 및 로그 확인
3. 이전 버전으로 롤백 가능

#### 도메인 설정
1. **Settings** → **Domains**
2. 커스텀 도메인 추가:
   - **Domain**: `your-domain.com`
   - **Configure DNS**: Vercel에서 제공하는 DNS 설정 적용

---

## 📱 모바일 앱 배포 (앱스토어)

### 프로젝트 정보
- **프로젝트**: `jinjjahalgae-app/`
- **프레임워크**: React Native + Expo
- **패키지 매니저**: pnpm
- **배포 플랫폼**: Google Play Store / App Store

### 사전 준비

#### 1. EAS CLI 설치
```bash
npm install -g @expo/eas-cli
```

#### 2. Expo 계정 로그인
```bash
eas login
```

#### 3. 프로젝트 설정
```bash
cd jinjjahalgae-app
eas build:configure
```

### AAB 파일 빌드 (Google Play Store용)

#### 1. 로컬 빌드 (개발용)

**사전 준비:**
```bash
# Android SDK 설치 확인
# macOS의 경우
brew install android-sdk

# 또는 Android Studio 설치 후 SDK 설정
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Java 11 설치 (필수)
brew install openjdk@11
export JAVA_HOME=/opt/homebrew/opt/openjdk@11
```

**로컬 빌드 실행:**
```bash
cd jinjjahalgae-app

# 의존성 설치
pnpm install

# 개발용 로컬 빌드
eas build --platform android --profile development --local

# 프로덕션용 로컬 빌드
eas build --platform android --profile production --local

# 특정 프로필로 로컬 빌드
eas build --platform android --profile preview --local
```

**로컬 빌드 옵션:**
```bash
# 캐시 클리어 후 빌드
eas build --platform android --profile development --local --clear-cache

# 디버그 모드로 빌드
eas build --platform android --profile development --local --debug

# 특정 아키텍처만 빌드
eas build --platform android --profile development --local --arch arm64
```

#### 2. 클라우드 빌드 (프로덕션용)

```bash
# 프로덕션 AAB 빌드
eas build --platform android --profile production

# 또는 특정 프로필로 빌드
eas build --platform android --profile preview
```

#### 3. Expo 웹사이트를 통한 빌드

**단계별 가이드:**

1. **Expo 계정 생성 및 로그인**
   - [expo.dev](https://expo.dev)에 접속
   - GitHub, Google, Apple 계정으로 로그인

2. **프로젝트 연결**
   - 대시보드에서 "Create a project" 클릭
   - GitHub 저장소 선택 (jinjjahalgae-app)
   - 또는 "Import existing project" 선택

3. **빌드 설정**
   - **Build** 탭으로 이동
   - **Platform**: Android 선택
   - **Profile**: production/preview/development 선택
   - **Branch**: main 또는 특정 브랜치 선택

4. **빌드 실행**
   - "Start Build" 클릭
   - 빌드 진행 상황 실시간 모니터링
   - 완료 후 AAB 파일 다운로드

**빌드 설정 관리:**
- **Build Configuration**: `eas.json` 파일 기반 설정
- **Environment Variables**: 웹 인터페이스에서 환경 변수 설정
- **Build Triggers**: GitHub 푸시 시 자동 빌드 설정

#### 로컬 vs 클라우드 vs 웹사이트 빌드 비교

| 항목 | 로컬 빌드 | 클라우드 빌드 | Expo 웹사이트 |
|------|-----------|---------------|---------------|
| **속도** | 첫 빌드 후 빠름 | 네트워크 속도에 따라 다름 | 네트워크 속도에 따라 다름 |
| **환경 설정** | Android SDK, Java 필요 | 설정 불필요 | 설정 불필요 |
| **보안** | 코드가 로컬에서만 처리 | Expo 서버에서 처리 | Expo 서버에서 처리 |
| **인터넷** | 불필요 | 필수 | 필수 |
| **디버깅** | 쉬움 | 로그 확인만 가능 | 실시간 로그 확인 |
| **리소스** | 로컬 컴퓨터 리소스 사용 | 서버 리소스 사용 | 서버 리소스 사용 |
| **UI** | CLI 명령어 | CLI 명령어 | 직관적인 웹 인터페이스 |
| **협업** | 개인 작업 | 팀 공유 가능 | 팀 협업 최적화 |
| **모니터링** | 로컬 로그 | CLI 로그 | 실시간 대시보드 |

#### 4. 빌드 상태 확인
```bash
# 빌드 목록 확인
eas build:list

# 특정 빌드 상태 확인
eas build:view [BUILD_ID]
```

### Expo 웹사이트 빌드 관리

#### 빌드 히스토리 확인
1. **Expo 대시보드** → 프로젝트 선택
2. **Builds** 탭에서 모든 빌드 기록 확인
3. 각 빌드의 상세 정보:
   - **Status**: 성공/실패/진행 중
   - **Duration**: 빌드 소요 시간
   - **Platform**: Android/iOS
   - **Profile**: production/preview/development

#### 빌드 설정 변경
1. **Settings** → **Build** 탭
2. **Build Configuration**:
   - `eas.json` 파일 직접 편집
   - 또는 웹 인터페이스에서 설정 변경
3. **Environment Variables**:
   - 환경별 변수 설정 (Production/Preview/Development)
   - 민감한 정보는 암호화하여 저장

#### 자동 빌드 설정
1. **Settings** → **Build Triggers**
2. **GitHub Integration**:
   - 저장소 연결 확인
   - 브랜치별 빌드 규칙 설정
   - Pull Request 시 자동 빌드 설정

#### 팀 협업 설정
1. **Settings** → **Team**
2. **Member Management**:
   - 팀원 초대 및 권한 설정
   - 빌드 권한 관리
   - 프로젝트 접근 권한 설정

### 빌드 프로필 설정

`eas.json` 파일에서 빌드 프로필을 관리합니다:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 앱스토어 제출

#### Google Play Store

```bash
# AAB 파일 제출
eas submit --platform android

# 또는 특정 빌드 제출
eas submit --platform android --id [BUILD_ID]
```

#### App Store (iOS)

```bash
# iOS 빌드
eas build --platform ios --profile production

# App Store 제출
eas submit --platform ios
```

### 배포 스크립트

```bash
#!/bin/bash
# deploy-app.sh

cd jinjjahalgae-app

# 의존성 설치
pnpm install

# Android AAB 빌드
echo "Building Android AAB..."
eas build --platform android --profile production --non-interactive

# 빌드 완료 대기
echo "Waiting for build to complete..."
eas build:list --platform android --limit 1

echo "Build completed! Check EAS dashboard for download link."
```

### 환경별 빌드

```bash
# 개발용 빌드
eas build --platform android --profile development

# 테스트용 빌드
eas build --platform android --profile preview

# 프로덕션 빌드
eas build --platform android --profile production
```

---

## 🔧 환경 변수 설정

### 웹 애플리케이션 (jinjahalgae)

```bash
# .env.local
NEXT_PUBLIC_MOCK_API=false
NEXT_PUBLIC_API_URL=https://api.jinjjahalgae.xyz
```

### 모바일 앱 (jinjjahalgae-app)

```bash
# app.config.js 또는 eas.json에서 설정
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.jinjjahalgae.xyz"
    }
  }
}
```

---

## 📋 배포 체크리스트

### 웹 애플리케이션 배포 전

- [ ] 모든 테스트 통과
- [ ] 환경 변수 설정 완료
- [ ] 빌드 성공 확인
- [ ] SEO 메타데이터 설정
- [ ] 에러 페이지 설정
- [ ] 성능 최적화 확인

### 모바일 앱 배포 전

- [ ] 앱 아이콘 및 스플래시 스크린 설정
- [ ] 앱 버전 업데이트
- [ ] 번들 ID 확인
- [ ] 서명 설정 완료
- [ ] 푸시 알림 설정
- [ ] 앱 스토어 메타데이터 준비

---

## 🚨 문제 해결

### 웹 애플리케이션 문제

```bash
# 빌드 오류 해결
rm -rf .next
pnpm install
pnpm build

# Vercel 배포 오류
vercel --debug
```

#### Vercel 웹 인터페이스 문제 해결

1. **빌드 실패**
   - **Deployments** → 실패한 배포 클릭
   - **Build Logs** 확인
   - **Functions** 탭에서 서버리스 함수 오류 확인

2. **환경 변수 문제**
   - **Settings** → **Environment Variables** 확인
   - 환경별 변수 설정 확인 (Production/Preview/Development)

3. **도메인 문제**
   - **Settings** → **Domains** 확인
   - DNS 설정이 올바른지 확인
   - SSL 인증서 상태 확인

4. **성능 문제**
   - **Analytics** 탭에서 성능 메트릭 확인
   - **Speed Insights**에서 Core Web Vitals 확인

### 모바일 앱 문제

```bash
# 캐시 클리어
expo r -c

# EAS 빌드 재시도
eas build --platform android --clear-cache

# 로컬 빌드 문제
npx expo install --fix
```

#### 로컬 빌드 문제 해결

**1. Android SDK 문제**
```bash
# Android SDK 경로 확인
echo $ANDROID_HOME

# SDK 도구 설치
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

# Gradle 캐시 클리어
rm -rf ~/.gradle/caches/
```

**2. Java 버전 문제**
```bash
# Java 버전 확인
java -version

# Java 11로 설정
export JAVA_HOME=/opt/homebrew/opt/openjdk@11
export PATH=$JAVA_HOME/bin:$PATH
```

**3. 로컬 빌드 실패 시**
```bash
# Docker 캐시 클리어
docker system prune -a

# EAS 로컬 빌드 재시도
eas build --platform android --profile development --local --clear-cache

# 또는 클라우드 빌드로 전환
eas build --platform android --profile development
```

**4. 메모리 부족 문제**
```bash
# Docker 메모리 증가 (macOS)
# Docker Desktop → Settings → Resources → Memory: 8GB 이상

# 또는 빌드 시 메모리 제한 설정
eas build --platform android --profile development --local --max-workers 2
```

#### Expo 웹사이트 빌드 문제 해결

**1. 빌드 실패**
- **Builds** 탭 → 실패한 빌드 클릭
- **Build Logs** 확인하여 오류 메시지 분석
- **Build Configuration** → `eas.json` 설정 확인

**2. 환경 변수 문제**
- **Settings** → **Environment Variables** 확인
- 환경별 변수 설정 확인 (Production/Preview/Development)
- 민감한 정보는 올바르게 암호화되었는지 확인

**3. GitHub 연동 문제**
- **Settings** → **Build Triggers** → **GitHub Integration**
- 저장소 권한 확인
- 웹훅 설정 확인

**4. 팀 권한 문제**
- **Settings** → **Team** → **Member Management**
- 팀원 권한 설정 확인
- 프로젝트 접근 권한 확인

---

## 📞 지원

배포 관련 문제가 발생하면 다음을 확인하세요:

1. **로그 확인**: Vercel 대시보드 또는 EAS 대시보드에서 빌드 로그 확인
2. **환경 변수**: 모든 필요한 환경 변수가 올바르게 설정되었는지 확인
3. **의존성**: `package.json`의 모든 의존성이 올바르게 설치되었는지 확인

---

## 📚 추가 리소스

- [Vercel 배포 가이드](https://vercel.com/docs)
- [EAS 빌드 가이드](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com/) 