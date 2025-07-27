# 진짜할게 - 테마 시스템 & 모바일 우선 디자인

## 개요

진짜할게 프로젝트는 **모바일 우선 디자인**과 **체계적인 테마 시스템**을 기반으로 구축되었습니다.

## 🎨 테마 시스템

### 색상 팔레트

프로젝트는 5가지 주요 색상 팔레트를 사용합니다:

- **Primary (파란색)**: 주요 버튼, 링크, 활성 상태
- **Success (초록색)**: 성공 메시지, 완료 상태, 감독 관련 요소
- **Danger (빨간색)**: 오류 메시지, 삭제 버튼, 경고
- **Warning (주황색)**: 주의 메시지, 대기 상태
- **Gray**: 텍스트, 경계선, 배경

각 색상은 50~900까지의 음영을 제공합니다.

### 색상 사용법

```tsx
// CSS 변수 직접 사용
<div style={{ backgroundColor: 'var(--color-primary-600)' }}>

// Tailwind 클래스 사용
<div className="bg-primary-600 text-black">

// 유틸리티 함수 사용
import { getColor } from '@/styles/utils';
<div style={{ color: getColor('primary', 600) }}>
```

## 📱 모바일 우선 디자인

### 반응형 브레이크포인트

- **모바일**: 기본 (0px~)
- **태블릿**: `sm:` (640px~)
- **데스크톱**: `md:` (768px~)
- **대형 화면**: `lg:` (1024px~)

### 터치 친화적 디자인

- 최소 터치 타겟: 44px × 44px
- 충분한 간격과 패딩
- 큰 텍스트와 버튼
- 스와이프 제스처 지원

### 디자인 철학

- **적절한 크기**: 너무 크지 않고 너무 작지 않은 균형잡힌 크기
- **세련된 여백**: 넉넉하지만 과하지 않은 적절한 간격
- **명확한 계층**: 제목, 본문, 라벨의 명확한 크기 구분
- **일관된 둥글기**: 컴포넌트별 일관된 border-radius 사용

### 안전 영역 지원

iOS의 노치와 홈 인디케이터를 고려한 안전 영역 지원:

```css
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

## 🧩 컴포넌트 시스템

### 디자인 토큰

#### 폰트 크기 가이드라인

- **제목 (xl)**: `text-xl` (20px) - 페이지 제목
- **제목 (lg)**: `text-lg` (18px) - 카드 제목, 중요 제목
- **본문 (base)**: `text-base` (16px) - 기본 본문
- **본문 (sm)**: `text-sm` (14px) - 설명, 부제목
- **라벨 (xs)**: `text-xs` (12px) - 작은 라벨, 날짜

#### 아이콘 크기 가이드라인

- **대형**: `w-8 h-8` - 빈 상태 아이콘
- **중형**: `w-5 h-5` - 헤더 아이콘, 일반 아이콘
- **소형**: `w-4 h-4` - 인라인 아이콘, 장식 아이콘

#### 패딩 가이드라인

- **헤더**: `px-6 py-4` - 페이지 헤더
- **카드**: `p-6` - 카드 내부 패딩
- **메인 컨텐츠**: `px-6 py-6` - 메인 영역 패딩
- **버튼**: `px-4 py-2` (sm), `px-6 py-3` (md) - 버튼 패딩

#### 간격 가이드라인

- **카드 간격**: `space-y-4` - 카드들 사이 간격
- **요소 간격**: `space-y-3` - 카드 내부 요소 간격
- **작은 간격**: `space-y-2` - 라벨과 값 사이
- **섹션 간격**: `mb-6` - 섹션들 사이 여백

#### 둥글기 가이드라인

- **카드**: `rounded-2xl` - 메인 카드 컴포넌트
- **버튼**: `rounded-lg` - 일반 버튼
- **작은 요소**: `rounded-full` - 뱃지, 아바타
- **FAB**: `rounded-2xl` - 플로팅 액션 버튼

### 기본 컴포넌트

모든 UI 컴포넌트는 `src/components/ui.tsx`에서 제공됩니다:

```tsx
import { Button, Card, Input, Modal, Badge, ProgressBar } from '@/components/ui';

// 기본 사용법
<Button variant="primary" size="md" fullWidth>
  클릭하세요
</Button>

<Card padding="md" shadow hover>
  <h3>카드 제목</h3>
  <p>카드 내용</p>
</Card>
```

### 버튼 변형

- `primary`: 주요 액션
- `secondary`: 보조 액션
- `success`: 성공/완료 액션
- `danger`: 삭제/위험 액션
- `warning`: 주의 액션
- `outline`: 경계선만 있는 버튼
- `ghost`: 배경 없는 버튼

### 색상 사용 가이드

#### 역할별 색상 구분

```tsx
// 내 계약 (파란색 계열)
<ProgressBar value={progress} color="primary" />
<span className="text-blue-600">{progress}%</span>

// 감독중 계약 (초록색 계열)
<ProgressBar value={progress} color="success" />
<span className="text-green-600">{progress}%</span>

// 뱃지 색상
<span className="bg-green-100 text-green-700">계약자</span>
<span className="bg-blue-100 text-blue-700">감독자</span>
```

### 레이아웃 패턴

#### 페이지 레이아웃

```tsx
// 표준 페이지 구조
<div className="min-h-screen bg-gray-50 flex justify-center">
  <div className="w-full max-w-md bg-white min-h-screen shadow-lg">
    {/* 헤더 */}
    <header className="px-6 py-4 bg-white sticky top-0 z-10 border-b border-gray-100">
      {/* 헤더 내용 */}
    </header>

    {/* 탭 네비게이션 (선택사항) */}
    <nav className="bg-white border-b border-gray-100 px-2">
      {/* 탭 내용 */}
    </nav>

    {/* 메인 컨텐츠 */}
    <main className="px-6 py-6 pb-24">{/* 컨텐츠 */}</main>
  </div>
</div>
```

#### 헤더 패턴

```tsx
// 중앙 제목 + 우측 아이콘
<header className="px-6 py-4 bg-white sticky top-0 z-10 border-b border-gray-100">
  <div className="flex items-center justify-between">
    <div className="text-center flex-1">
      <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-1">
        페이지 제목
      </h1>
      <p className="text-xs text-gray-500">부제목</p>
    </div>
    <div className="flex items-center gap-2 ml-4">
      <Link href="/notifications" className="p-2 rounded-lg hover:bg-gray-50">
        <Bell className="w-5 h-5 text-gray-600" />
      </Link>
    </div>
  </div>
</header>
```

#### 탭 네비게이션 패턴

```tsx
// 2개 탭 구조
<nav className="bg-white border-b border-gray-100 px-2">
  <div className="flex">
    <button
      className={`
      flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 text-sm
      ${
        activeTab === "tab1"
          ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }
    `}
    >
      탭 1
    </button>
    <button
      className={`
      flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 text-sm
      ${
        activeTab === "tab2"
          ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }
    `}
    >
      탭 2
    </button>
  </div>
</nav>
```

#### 카드 패턴

```tsx
// 기본 카드 구조
<Card hover>
  <div className="space-y-4 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
    {/* 카드 헤더 */}
    <div>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-gray-900">카드 제목</h3>
        <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 font-medium whitespace-nowrap ml-3">
          라벨
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">카드 설명</p>
    </div>

    {/* 진행률 또는 추가 정보 */}
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-700 text-sm">라벨</span>
        <span className="font-bold text-blue-600 text-base">값</span>
      </div>
      <ProgressBar value={progress} color="primary" showText={false} />
    </div>

    {/* 액션 버튼 */}
    <div className="flex gap-3 pt-3">
      <Button variant="outline" fullWidth size="md">
        액션 1
      </Button>
      <Button variant="primary" fullWidth size="md">
        액션 2
      </Button>
    </div>
  </div>
</Card>
```

#### 빈 상태 패턴

```tsx
// 빈 상태 컴포넌트
<div className="text-center py-12 px-4">
  <div className="mx-auto w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
    <Icon className="w-8 h-8 text-blue-500" strokeWidth={1.5} />
  </div>
  <h3 className="text-lg font-bold text-gray-900 mb-3">상태 제목</h3>
  <p className="text-sm text-gray-500 mb-8 leading-relaxed">설명 텍스트</p>
  <Button variant="primary" size="md">
    액션
  </Button>
</div>
```

#### FAB 패턴

```tsx
// 플로팅 액션 버튼
<Link
  href="/create"
  className="
  fixed bottom-20 right-6 
  w-14 h-14
  bg-blue-600 hover:bg-blue-700
  text-white
  rounded-2xl
  flex items-center justify-center 
  shadow-lg hover:shadow-xl
  transition-all duration-200
  hover:scale-105
  active:scale-95
  z-50
"
>
  <Plus className="w-7 h-7" strokeWidth={2.5} />
</Link>
```

## 🛠 유틸리티 함수

`src/styles/utils.ts`에서 다양한 유틸리티 함수를 제공합니다:

```tsx
import { cn, buttonClasses, responsiveText, mobileSpacing } from '@/styles/utils';

// 클래스명 조합
const className = cn(
  'base-class',
  isActive && 'active-class',
  'another-class'
);

// 반응형 텍스트
<h1 className={responsiveText.xl}>제목</h1>

// 모바일 스페이싱
<div className={mobileSpacing.container}>
  내용
</div>
```

## 🎯 베스트 프랙티스

### 1. 모바일 우선 개발

모든 디자인과 개발은 모바일을 먼저 고려합니다:

```tsx
// ✅ 좋은 예: 모바일 기본, 데스크톱 확장
<div className="text-sm sm:text-base lg:text-lg">

// ❌ 나쁜 예: 데스크톱 기본, 모바일 축소
<div className="text-lg md:text-sm">
```

### 2. 적절한 크기 사용

과하지 않은 균형잡힌 크기를 사용합니다:

```tsx
// ✅ 좋은 예: 적절한 크기
<h1 className="text-xl font-bold">페이지 제목</h1>
<h2 className="text-lg font-bold">카드 제목</h2>
<p className="text-sm text-gray-600">설명 텍스트</p>
<Icon className="w-5 h-5" />

// ❌ 나쁜 예: 너무 큰 크기
<h1 className="text-4xl font-bold">페이지 제목</h1>
<Icon className="w-12 h-12" />
```

### 3. 여백 일관성

정의된 여백 시스템을 사용합니다:

```tsx
// ✅ 좋은 예: 시스템적 여백
<div className="space-y-4">          {/* 카드 간격 */}
  <Card>
    <div className="space-y-3 p-6">  {/* 카드 내부 */}
      <div className="space-y-2">    {/* 요소 간격 */}
        <span>라벨</span>
        <span>값</span>
      </div>
    </div>
  </Card>
</div>

// ❌ 나쁜 예: 임의의 여백
<div className="space-y-7">
  <div className="p-9">
    <div className="mb-5">
```

### 4. 색상 일관성

정의된 색상 팔레트만 사용하고, 임의의 색상은 피합니다:

```tsx
// ✅ 좋은 예
<div className="text-gray-700 bg-primary-50">

// ❌ 나쁜 예
<div style={{ color: '#333333', backgroundColor: '#f0f8ff' }}>
```

### 5. 터치 최적화

모든 상호작용 요소는 터치하기 쉽게 만듭니다:

```tsx
// ✅ 좋은 예: 충분한 크기와 간격
<button className="min-h-[44px] px-6 py-3">

// ❌ 나쁜 예: 너무 작은 터치 영역
<button className="px-1 py-1 text-xs">
```

### 6. 성능 최적화

- 이미지는 WebP 형식 사용
- 컴포넌트는 필요시에만 렌더링
- 무거운 애니메이션은 피하기

## 📝 개발 가이드라인

### 새 컴포넌트 추가

1. `src/components/ui.tsx`에 기본 컴포넌트 추가
2. 테마 시스템 색상 사용
3. 모바일 우선 반응형 디자인 적용
4. TypeScript 타입 정의
5. JSDoc 주석 추가

### 새 페이지 개발

1. 모바일 레이아웃부터 시작
2. 표준 페이지 구조 사용 (`max-w-md`, 중앙 정렬)
3. 헤더는 `px-6 py-4` 패딩 사용
4. 메인 컨텐츠는 `px-6 py-6 pb-24` 패딩 사용
5. 안전 영역 고려
6. 하단 네비게이션 공간 확보 (`pb-24`)
7. 로딩 상태 구현 (`py-16` 패딩)
8. 에러 핸들링 추가

### 스타일링 규칙

1. Tailwind CSS 우선 사용
2. CSS 변수로 색상 관리
3. 인라인 스타일은 동적 값에만 사용
4. 일관된 간격과 크기 사용:
   - 카드 간격: `space-y-4`
   - 카드 내부: `space-y-3` 또는 `space-y-4`
   - 카드 패딩: `p-6`
   - 작은 요소 간격: `space-y-2`

### 컴포넌트 생성 체크리스트

#### 카드 컴포넌트

- [ ] `rounded-2xl` 사용
- [ ] `p-6` 패딩 적용
- [ ] `space-y-4` 내부 간격
- [ ] 호버 효과 (`hover:shadow-md`)
- [ ] 제목은 `text-lg font-bold`
- [ ] 설명은 `text-sm text-gray-600`

#### 버튼 컴포넌트

- [ ] 최소 높이 44px 보장
- [ ] 적절한 패딩 (`px-6 py-3`)
- [ ] 역할에 맞는 variant 사용
- [ ] 로딩 상태 지원

#### 빈 상태 컴포넌트

- [ ] `py-12 px-4` 패딩
- [ ] 아이콘 크기 `w-16 h-16` (컨테이너), `w-8 h-8` (아이콘)
- [ ] 제목 `text-lg font-bold`
- [ ] 설명 `text-sm text-gray-500`

#### 폼 컴포넌트

- [ ] 라벨과 입력 필드 간격 `space-y-2`
- [ ] 에러 메시지 `text-sm text-red-600`
- [ ] 적절한 입력 필드 크기
- [ ] 포커스 상태 스타일링

## 🔧 설정 파일

### Tailwind 설정

`tailwind.config.ts`에서 테마 색상과 유틸리티가 정의됩니다.

### 글로벌 스타일

`src/app/globals.css`에서 기본 스타일과 CSS 변수가 정의됩니다.

### 테마 프로바이더

`src/styles/ThemeProvider.tsx`에서 테마 상태를 관리합니다.

## 🚀 시작하기

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 타입 체크
npm run type-check

# 린트
npm run lint
```

## 📚 추가 리소스

- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Next.js 문서](https://nextjs.org/docs)
- [React 문서](https://react.dev/)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)
