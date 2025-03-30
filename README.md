# Next.js 프로젝트 완벽 가이드 📚

## 목차
1. [Next.js란?](#1-nextjs란)
2. [프로젝트 구조](#2-프로젝트-구조)
3. [주요 기능 설명](#3-주요-기능-설명)
4. [실제 코드로 보는 Next.js](#4-실제-코드로-보는-nextjs)
5. [성능 최적화](#5-성능-최적화)

## 1. Next.js란?
Next.js는 React 기반의 웹 프레임워크입니다. 쉽게 말해서, React로 웹사이트를 만들 때 필요한 여러 기능들을 미리 준비해둔 도구상자라고 생각하면 됩니다.

### 1.1 Next.js의 장점
- 📱 서버 사이드 렌더링 (SSR) 지원
- 🚀 빠른 페이지 로딩
- 🛠 자동 코드 분할
- 📂 파일 기반 라우팅
- 🎨 스타일링 지원

## 2. 프로젝트 구조

우리 프로젝트는 다음과 같은 구조로 되어있습니다:

```
src/
├── app/                # 페이지와 라우팅을 담당
├── components/         # 재사용 가능한 컴포넌트들
├── actions/           # 서버에서 실행되는 함수들
├── mock/             # 테스트용 가짜 데이터
├── util/             # 유용한 도구 함수들
└── types.ts          # 타입스크립트 타입 정의
```

### 2.1 각 폴더의 역할
- **app**: 웹사이트의 페이지들이 있는 곳
- **components**: 여러 곳에서 재사용되는 부품들
- **actions**: 서버에서 실행되는 동작들
- **mock**: 개발할 때 사용하는 테스트 데이터
- **util**: 자주 사용하는 편리한 함수들

## 3. 주요 기능 설명

### 3.1 페이지 라우팅
```typescript
// app/page.tsx
export default function Home() {
  return <h1>홈페이지</h1>
}

// app/about/page.tsx
export default function About() {
  return <h1>소개 페이지</h1>
}
```

### 3.2 서버 컴포넌트 vs 클라이언트 컴포넌트

```typescript
// 서버 컴포넌트 (기본값)
export default async function ServerComponent() {
  const data = await getData(); // 서버에서 직접 데이터 페칭
  return <div>{data}</div>
}

// 클라이언트 컴포넌트
'use client'
export default function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 3.3 레이아웃 시스템
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
```

## 4. 실제 코드로 보는 Next.js

### 4.1 검색 기능 구현
```typescript
"use client";

export default function Searchbar() {
  const [search, setSearch] = useState("");
  
  return (
    <div>
      <input 
        value={search} 
        onChange={e => setSearch(e.target.value)}
        placeholder="책 제목을 검색하세요"
      />
      <button>검색</button>
    </div>
  );
}
```

### 4.2 에러 처리
```typescript
"use client";

export default function Error({ error }) {
  return (
    <div>
      <h3>앗! 에러가 발생했어요 😢</h3>
      <button onClick={() => window.location.reload()}>
        다시 시도하기
      </button>
    </div>
  );
}
```

## 5. 성능 최적화

### 5.1 로딩 상태 처리
```typescript
<Suspense fallback={<div>로딩중...</div>}>
  <BookList />
</Suspense>
```

### 5.2 이미지 최적화
```typescript
import Image from 'next/image'

<Image 
  src="/book-cover.jpg"
  width={200}
  height={300}
  alt="책 표지"
/>
```

## 🎯 정리

Next.js는 다음과 같은 장점이 있습니다:

1. 📁 폴더만 만들면 자동으로 페이지가 생성됩니다.
2. 🚀 서버에서 데이터를 가져와 빠른 로딩이 가능합니다.
3. 🎨 이미지, 폰트 등을 자동으로 최적화해줍니다.
4. 🛠 개발할 때 필요한 도구들이 미리 설정되어 있습니다.

## 📚 추가 학습 자료
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Next.js 학습 사이트](https://nextjs.org/learn)
- [React 공식 문서](https://react.dev)

---


# Next.js 고급 기능 완벽 가이드 🚀

## 목차
1. [데이터 캐싱 전략](#1-데이터-캐싱-전략)
2. [라우팅 심화](#2-라우팅-심화)
3. [검색엔진 최적화 (SEO)](#3-검색엔진-최적화-seo)
4. [Request Memoization](#4-request-memoization)

## 1. 데이터 캐싱 전략

### 1.1 페이지 캐싱
Next.js는 기본적으로 정적 페이지를 빌드 시점에 생성하여 캐시합니다.

```typescript
// 정적 페이지 생성 (빌드 시 생성됨)
export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];
}
```

### 1.2 데이터 캐싱
프로젝트에서 사용된 세 가지 주요 캐싱 전략:

```typescript
// 1. 영구 캐시 (기본값)
const response = await fetch(URL, { cache: 'force-cache' });

// 2. 캐시 없음 (매번 새로운 데이터)
const response = await fetch(URL, { cache: 'no-store' });

// 3. 재검증 (특정 시간마다 갱신)
const response = await fetch(URL, { next: { revalidate: 3600 } });
```

### 1.3 캐시 무효화
서버 액션에서 사용된 캐시 무효화 예시:

```typescript
"use server";

export async function createReviewAction(_: any, formData: FormData) {
  // ... 리뷰 생성 로직 ...

  // 특정 태그의 캐시만 무효화
  revalidateTag(`review-${bookId}`);
  
  // 특정 경로의 캐시 무효화
  revalidatePath(`/book/${bookId}`);
}
```

## 2. 라우팅 심화

### 2.1 Parallel Routes (병렬 라우팅)
동시에 여러 페이지를 보여줄 수 있는 기능입니다.

```typescript
// @modal 슬롯을 사용한 병렬 라우팅
export default function BookModal({ params }: { params: { id: string } }) {
  return (
    <Modal>
      <BookDetail id={params.id} />
    </Modal>
  );
}
```

### 2.2 Intercepting Routes (경로 가로채기)
현재 레이아웃을 유지하면서 다른 경로의 내용을 보여줄 수 있습니다.

```typescript
// (..) 를 사용하여 상위 경로로 이동하면서 현재 컨텍스트 유지
export default function BookPage({ params }: { params: { id: string } }) {
  return <BookDetail id={params.id} />;
}
```

### 2.3 네비게이션
클라이언트 컴포넌트에서의 네비게이션 처리:

```typescript
"use client";

export default function Searchbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const onSubmit = () => {
    router.push(`/search?q=${search}`);
  };

  return (
    // ... 검색바 UI
  );
}
```

## 3. 검색엔진 최적화 (SEO)

### 3.1 정적 메타데이터

```typescript
export const metadata: Metadata = {
  title: "한입 북스",
  description: "한입 북스에 등록된 도서를 만나보세요.",
  openGraph: {
    title: "한입 북스",
    description: "한입 북스에 등록된 도서를 만나보세요.",
    images: ["/thumbnail.png"],
  },
};
```

### 3.2 동적 메타데이터

```typescript
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  return {
    title: `${searchParams.q} : 한입북스 검색`,
    description: `${searchParams.q}의 검색 결과입니다.`,
    openGraph: {
      title: `${searchParams.q} : 한입북스 검색`,
      description: `${searchParams.q}의 검색 결과입니다.`,
      images: ["/thumbnail.png"],
    },
  };
}
```

## 4. Request Memoization

Next.js는 같은 요청을 자동으로 메모이제이션합니다:

```typescript
async function getBook(id: string) {
  // 같은 ID로 여러 번 호출해도 실제로는 한 번만 요청됨
  const res = await fetch(`${process.env.API_URL}/book/${id}`);
  return res.json();
}

// 여러 컴포넌트에서 사용해도 한 번만 요청
export default async function Page({ params: { id } }) {
  const book = await getBook(id);  // 첫 번째 호출
  const sameBook = await getBook(id);  // 메모이제이션된 결과 사용
  
  return (
    // ... 렌더링 로직
  );
}
```

## 🔍 성능 최적화 팁

1. **데이터 캐싱 전략 선택**
   - 자주 변경되지 않는 데이터: `cache: 'force-cache'`
   - 실시간 데이터: `cache: 'no-store'`
   - 주기적 갱신: `next: { revalidate: 시간(초) }`

2. **경로 가로채기 활용**
   - 모달이나 슬라이드오버에 적합
   - 사용자 경험 향상

3. **병렬 라우팅 활용**
   - 독립적인 로딩 상태 관리
   - 동시에 여러 콘텐츠 로드

4. **SEO 최적화**
   - 각 페이지별 메타데이터 설정
   - 동적 메타데이터 활용

## 📌 주의사항

1. 캐시 전략은 데이터 특성에 맞게 선택
2. 병렬 라우팅 사용 시 폴더 구조 주의
3. SEO 메타데이터는 가능한 상세하게 설정
4. Request Memoization은 같은 렌더링 사이클 내에서만 작동

---

