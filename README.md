# Next.js 프로젝트 구조 및 기능 분석 📚

## 1. 프로젝트 구조
```
src/
├── app/
│   ├── (with-searchbar)/           # 검색바가 필요한 페이지들
│   │   ├── layout.tsx              # 검색바 레이아웃
│   │   ├── page.tsx                # 메인 페이지
│   │   ├── search/                 # 검색 기능
│   │   │   └── page.tsx
│   │   └── error.tsx               # 에러 처리
│   ├── book/
│   │   └── [id]/                   # 동적 라우팅
│   │       ├── page.tsx
│   │       └── error.tsx
│   └── layout.tsx                  # 루트 레이아웃
├── actions/
│   └── create-review.action.ts     # 서버 액션
├── components/                      # 재사용 컴포넌트
└── types.ts                        # 타입 정의
```

## 2. 주요 기능 구현

### 2.1 데이터 페칭 및 캐싱
```typescript
// src/app/(with-searchbar)/page.tsx
async function AllBooks() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book`,
    { cache: "force-cache" }  // 정적 캐싱
  );
  const allBooks: BookData[] = await response.json();
  return (
    <div>
      {allBooks.map((book) => (
        <BookItem key={book.id} {...book} />
      ))}
    </div>
  );
}
```

### 2.2 동적 라우팅 및 정적 생성
```typescript
// src/app/book/[id]/page.tsx
export const dynamic = "force-dynamic";  // 동적 렌더링 강제

export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];  // 빌드 시 정적 생성
}
```

### 2.3 서버 액션
```typescript
// src/actions/create-review.action.ts
"use server";
export async function createReviewAction(_: any, formData: FormData) {
  // ... 리뷰 생성 로직 ...
  revalidateTag(`review-${bookId}`);  // 캐시 무효화
}
```

### 2.4 레이아웃 시스템
```typescript
// src/app/(with-searchbar)/layout.tsx
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Suspense fallback={<div>Loading ...</div>}>
        <Searchbar />
      </Suspense>
      {children}
    </div>
  );
}
```

### 2.5 메타데이터 관리
```typescript
// src/app/(with-searchbar)/search/page.tsx
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: `${q} : 한입북스 검색`,
    description: `${q}의 검색 결과입니다.`,
  };
}
```

### 2.6 에러 처리
```typescript
// src/app/book/[id]/error.tsx
"use client";
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h3>오류가 발생했습니다.({error.message})</h3>
      <button onClick={() => reset()}>다시 시도</button>
    </div>
  );
}
```

## 3. 성능 최적화 전략

### 3.1 Suspense를 통한 로딩 처리
```typescript
// src/app/(with-searchbar)/page.tsx
<Suspense fallback={<BookListSkeleton count={10} />}>
  <AllBooks />
</Suspense>
```

### 3.2 캐시 전략
1. **정적 캐싱**: `cache: "force-cache"`
2. **재검증**: `next: { revalidate: 3 }`
3. **태그 기반 재검증**: `revalidateTag()`

### 3.3 동적/정적 렌더링 제어
```typescript
// 동적 렌더링 강제
export const dynamic = "force-dynamic";

// 정적 페이지 생성
export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];
}
```

## 4. 주요 패턴 및 베스트 프랙티스

1. **서버/클라이언트 컴포넌트 분리**
   - 서버 컴포넌트: 데이터 페칭, 메타데이터
   - 클라이언트 컴포넌트: 상호작용, 이벤트 처리

2. **에러 처리 계층화**
   - 각 라우트별 에러 처리
   - 글로벌 에러 처리

3. **레이아웃 재사용**
   - 그룹 라우팅으로 공통 레이아웃 관리
   - Suspense를 통한 점진적 로딩

4. **데이터 관리**
   - 서버 액션으로 데이터 변경
   - 캐시 무효화로 최신 데이터 유지
