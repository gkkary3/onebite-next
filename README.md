## 목차
1. [프로젝트 구조](#1-프로젝트-구조)
2. [라우팅 시스템](#2-라우팅-시스템)
3. [데이터 페칭과 캐싱](#3-데이터-페칭과-캐싱)
4. [서버/클라이언트 컴포넌트](#4-서버클라이언트-컴포넌트)
5. [성능 최적화](#5-성능-최적화)
6. [에러 처리와 로딩](#6-에러-처리와-로딩)

## 1. 프로젝트 구조

### 1.1 기본 구조
```
src/
├── app/                           # App Router 기반 페이지
│   ├── @modal/                    # 병렬 라우트 (모달)
│   │   └── (.)book/[id]/         # 인터셉트 라우트
│   ├── (with-searchbar)/         # 그룹 라우팅
│   │   ├── layout.tsx            # 검색바 레이아웃
│   │   ├── page.tsx              # 메인 페이지
│   │   └── search/               # 검색 기능
│   ├── book/                     # 책 관련 페이지
│   │   └── [id]/                 # 동적 라우팅
│   └── layout.tsx                # 루트 레이아웃
├── actions/                      # 서버 액션
├── components/                   # 재사용 컴포넌트
└── types.ts                     # 타입 정의
```

### 1.2 주요 파일 설명
- `app/layout.tsx`: 전체 애플리케이션의 레이아웃
- `app/page.tsx`: 메인 페이지
- `actions/*.ts`: 서버 사이드 액션
- `components/*.tsx`: 재사용 가능한 UI 컴포넌트

## 2. 라우팅 시스템

### 2.1 기본 라우팅
```typescript:src/app/page.tsx
// 기본 페이지 (/) 
export default function HomePage() {
  return (
    <main>
      <h1>한입 북스에 오신 것을 환영합니다</h1>
      <Suspense fallback={<BookListSkeleton />}>
        <AllBooks />
      </Suspense>
    </main>
  );
}
```

### 2.2 동적 라우팅
```typescript:src/app/book/[id]/page.tsx
// 동적 라우트 (/book/1, /book/2, ...)
export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await getBook(params.id);
  
  return (
    <article>
      <h1>{book.title}</h1>
      <BookDetail book={book} />
    </article>
  );
}

// 정적 페이지 생성 최적화
export async function generateStaticParams() {
  const books = await getBooks();
  return books.map((book) => ({
    id: book.id.toString(),
  }));
}
```

### 2.3 Parallel Routes (병렬 라우팅)
```typescript:src/app/layout.tsx
// 루트 레이아웃에서 병렬 라우트 설정
export default function RootLayout({
  children,
  modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        {modal}
      </body>
    </html>
  );
}
```

```typescript:src/app/@modal/(.)book/[id]/page.tsx
// 모달 페이지
export default function BookModal({ params }: { params: { id: string } }) {
  return (
    <Modal>
      <Suspense fallback={<BookDetailSkeleton />}>
        <BookDetail id={params.id} />
      </Suspense>
    </Modal>
  );
}
```

### 2.4 Intercepting Routes
```typescript:src/app/@modal/(.)book/[id]/page.tsx
// (.) - 현재 세그먼트 가로채기
// (..) - 한 단계 위 세그먼트 가로채기
// (...) - 루트에서 가로채기

export default function InterceptedBookPage({ params }: { params: { id: string } }) {
  return (
    <Modal>
      <BookDetail id={params.id} />
    </Modal>
  );
}
```

### 2.5 그룹 라우팅
```typescript:src/app/(with-searchbar)/layout.tsx
// 검색바가 필요한 페이지들을 그룹화
export default function SearchbarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout-with-searchbar">
      <Suspense fallback={<SearchbarSkeleton />}>
        <Searchbar />
      </Suspense>
      <main>{children}</main>
    </div>
  );
}
```

### 2.6 라우팅 네비게이션
```typescript:src/components/navigation.tsx
"use client";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  return (
    <nav>
      <Link href="/" className={pathname === "/" ? "active" : ""}>
        홈
      </Link>
      <button onClick={() => router.push("/search")}>
        검색
      </button>
      <button onClick={() => router.back()}>
        뒤로가기
      </button>
    </nav>
  );
}
```

### 2.7 라우팅 패턴 사용 예시
```typescript:src/app/(with-searchbar)/search/page.tsx
// 검색 페이지 구현
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const books = await searchBooks(searchParams.q);
  
  return (
    <div>
      <h1>검색 결과: {searchParams.q}</h1>
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults books={books} />
      </Suspense>
    </div>
  );
}
```

## 3. 데이터 페칭과 캐싱

### 3.1 데이터 페칭 전략
```typescript:src/app/(with-searchbar)/page.tsx
// 1. 정적 데이터 페칭
async function getAllBooks() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book`,
    { cache: "force-cache" }  // 빌드 시 캐싱
  );
  return response.json();
}

// 2. 동적 데이터 페칭
async function getRealtimeData() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/realtime`,
    { cache: "no-store" }  // 매 요청마다 새로운 데이터
  );
  return response.json();
}

// 3. 재검증 데이터 페칭
async function getRevalidatedData() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/data`,
    { next: { revalidate: 60 } }  // 60초마다 재검증
  );
  return response.json();
}
```

### 3.2 서버 액션
```typescript:src/actions/create-review.action.ts
"use server";

export async function createReviewAction(
  prevState: any,
  formData: FormData
) {
  try {
    // 1. 데이터 유효성 검사
    const bookId = formData.get("bookId");
    const content = formData.get("content");
    
    // 2. 데이터베이스 작업
    await createReview({ bookId, content });
    
    // 3. 캐시 무효화
    revalidateTag(`reviews-${bookId}`);
    revalidatePath(`/book/${bookId}`);
    
    return { message: "리뷰가 등록되었습니다." };
  } catch (error) {
    return { error: "리뷰 등록에 실패했습니다." };
  }
}
```

### 3.3 캐시 전략
```typescript:src/app/book/[id]/page.tsx
// 1. 태그 기반 캐싱
const data = await fetch(URL, {
  next: { tags: [`book-${id}`] }
});

// 2. 경로 기반 재검증
revalidatePath('/book/[id]');

// 3. 태그 기반 재검증
revalidateTag(`book-${id}`);
```

## 4. 서버/클라이언트 컴포넌트

### 4.1 서버 컴포넌트
```typescript:src/app/book/[id]/page.tsx
// 기본적으로 서버 컴포넌트
export default async function BookPage({ params }: { params: { id: string } }) {
  // 서버에서 직접 데이터 페칭
  const book = await getBook(params.id);
  const reviews = await getBookReviews(params.id);
  
  return (
    <article>
      <BookDetail book={book} />
      <ReviewList initialReviews={reviews} />
    </article>
  );
}
```

### 4.2 클라이언트 컴포넌트
```typescript:src/components/review-form.tsx
"use client";

export default function ReviewForm({ bookId }: { bookId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  // 클라이언트 상태 관리
  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createReviewAction(null, formData);
      if (result.error) setError(result.error);
    });
  };
  
  return (
    <form action={handleSubmit}>
      <textarea name="content" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "등록 중..." : "리뷰 작성"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

## 5. 성능 최적화

### 5.1 이미지 최적화
```typescript:src/components/book-cover.tsx
import Image from 'next/image';

export default function BookCover({ book }: { book: Book }) {
  return (
    <div className="book-cover">
      <Image
        src={book.coverUrl}
        alt={`${book.title} 표지`}
        width={300}
        height={400}
        priority={true}  // LCP 최적화
        quality={75}     // 이미지 품질 조정
        placeholder="blur"  // 로딩 중 블러 효과
        blurDataURL={book.blurUrl}  // 블러 이미지
      />
    </div>
  );
}
```

### 5.2 SEO 최적화
```typescript:src/app/book/[id]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const book = await getBook(params.id);
  
  return {
    title: `${book.title} - 한입북스`,
    description: book.description,
    openGraph: {
      title: `${book.title} - 한입북스`,
      description: book.description,
      images: [
        {
          url: book.coverUrl,
          width: 800,
          height: 600,
          alt: `${book.title} 표지`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${book.title} - 한입북스`,
      description: book.description,
      images: [book.coverUrl],
    },
  };
}
```

## 6. 에러 처리와 로딩

### 6.1 에러 처리
```typescript:src/app/book/[id]/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    console.error(error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>앗! 문제가 발생했어요 😢</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>
        다시 시도하기
      </button>
    </div>
  );
}
```

### 6.2 로딩 처리
```typescript:src/app/book/[id]/loading.tsx
export default function Loading() {
  return (
    <div className="loading-container">
      <div className="book-skeleton">
        <div className="cover-skeleton pulse" />
        <div className="title-skeleton pulse" />
        <div className="description-skeleton pulse" />
      </div>
    </div>
  );
}
```

### 6.3 Suspense 경계
```typescript:src/app/(with-searchbar)/page.tsx
export default function HomePage() {
  return (
    <main>
      <h1>한입 북스</h1>
      
      {/* 최신 도서 */}
      <Suspense fallback={<BookListSkeleton />}>
        <NewBooks />
      </Suspense>
      
      {/* 추천 도서 */}
      <Suspense fallback={<BookListSkeleton />}>
        <RecommendedBooks />
      </Suspense>
      
      {/* 리뷰 */}
      <Suspense fallback={<ReviewListSkeleton />}>
        <LatestReviews />
      </Suspense>
    </main>
  );
}
```

## 🎯 베스트 프랙티스

1. **데이터 페칭**
   - 서버 컴포넌트에서 데이터 페칭
   - 적절한 캐싱 전략 선택
   - 필요한 경우에만 클라이언트 데이터 페칭

2. **성능 최적화**
   - 이미지 자동 최적화 활용
   - 메타데이터로 SEO 강화
   - Suspense로 로딩 상태 관리

3. **에러 처리**
   - 각 라우트별 에러 처리
   - 사용자 친화적인 에러 UI
   - 에러 복구 메커니즘 구현

4. **코드 구조화**
   - 명확한 폴더 구조
   - 컴포넌트 책임 분리
   - 재사용 가능한 유틸리티 함수

## 📚 추가 학습 자료
- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 서버 컴포넌트](https://react.dev/reference/react/use-server)
- [App Router 마이그레이션](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
