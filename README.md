# Next.js 프로젝트 상세 분석 및 기능 가이드 📚

## 목차
1. [프로젝트 구조](#1-프로젝트-구조)
2. [라우팅 시스템](#2-라우팅-시스템)
3. [데이터 페칭 전략](#3-데이터-페칭-전략)
4. [서버/클라이언트 컴포넌트](#4-서버클라이언트-컴포넌트)
5. [최적화 전략](#5-최적화-전략)
6. [에러 처리](#6-에러-처리)

## 1. 프로젝트 구조

```
src/
├── app/
│   ├── @modal/                     # Parallel Routes
│   │   └── (.)book/[id]/          # Intercepting Routes
│   ├── (with-searchbar)/          # 그룹 라우팅
│   ├── book/
│   │   └── [id]/                  # 동적 라우팅
│   └── layout.tsx
├── actions/
├── components/
└── types.ts
```

## 2. 라우팅 시스템

### 2.1 Parallel Routes (@modal)
```typescript:src/app/@modal/(.)book/[id]/page.tsx
export default function BookModal({ params }: { params: { id: string } }) {
  return (
    <Modal>
      <BookDetail id={params.id} />
    </Modal>
  );
}
```
- `@modal`: 병렬 라우트 슬롯
- 메인 콘텐츠와 모달을 동시에 렌더링

### 2.2 Intercepting Routes
```typescript:src/app/@modal/(.)book/[id]/page.tsx
// (.) - 현재 레벨
// (..) - 한 레벨 위
// (...) - 루트 레벨
```
- `(.)`: 현재 URL 구조 유지하며 다른 레이아웃 표시
- 모달이나 슬라이드오버에 적합

### 2.3 모달 구현
```typescript:src/components/modal.tsx
"use client";

export default function Modal({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  return createPortal(
    <dialog
      onClose={() => router.back()}
      onClick={(e) => {
        if ((e.target as any).nodeName === "DIALOG") {
          router.back();
        }
      }}
    >
      {children}
    </dialog>,
    document.getElementById("modal-root") as HTMLElement
  );
}
```

## 3. 최적화 전략

### 3.1 이미지 최적화
```typescript:src/components/book-item.tsx
import Image from 'next/image';

export default function BookItem({ coverImgUrl }: BookItemProps) {
  return (
    <Image
      src={coverImgUrl}
      alt="책 표지"
      width={200}
      height={300}
      priority={true}  // LCP 최적화
      quality={75}     // 품질 조정
      placeholder="blur"  // 로딩 중 블러 효과
    />
  );
}
```
- 자동 이미지 최적화
- WebP 포맷 자동 변환
- 레이지 로딩 자동 적용

### 3.2 SEO 최적화
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
      images: [book.coverImgUrl],
    },
    alternates: {
      canonical: `/book/${params.id}`,
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}
```

### 3.3 정적 메타데이터
```typescript:src/app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    template: '%s | 한입북스',
    default: '한입북스 - 프로그래밍 도서 리뷰',
  },
  description: '프로그래밍 도서 리뷰 플랫폼',
  keywords: ['프로그래밍', '도서', '리뷰'],
};
```

## 4. 성능 최적화 패턴

### 4.1 스트리밍과 Suspense
```typescript:src/app/(with-searchbar)/page.tsx
export default function Page() {
  return (
    <>
      <Suspense fallback={<BookListSkeleton />}>
        <AllBooks />
      </Suspense>
      <Suspense fallback={<RecommendSkeleton />}>
        <RecommendBooks />
      </Suspense>
    </>
  );
}
```

### 4.2 라우트 세그먼트 설정
```typescript:src/app/book/[id]/page.tsx
// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

// 정적 페이지 생성
export async function generateStaticParams() {
  const books = await getBooks();
  return books.map((book) => ({
    id: book.id.toString(),
  }));
}
```

### 4.3 캐시 전략
```typescript
// 1. 영구 캐시
const data = await fetch(URL, { cache: 'force-cache' });

// 2. 재검증
const data = await fetch(URL, { next: { revalidate: 3600 } });

// 3. 캐시 무효화
revalidateTag('books');
revalidatePath('/book/[id]');
```

## 5. 주요 패턴 및 베스트 프랙티스

1. **라우팅 패턴**
   - Parallel Routes로 모달 구현
   - Intercepting Routes로 UX 향상
   - 그룹 라우팅으로 코드 구조화

2. **성능 최적화**
   - 이미지 자동 최적화
   - 메타데이터로 SEO 강화
   - Suspense로 점진적 로딩

3. **데이터 전략**
   - 서버 컴포넌트에서 데이터 페칭
   - 적절한 캐싱 전략 선택
   - 서버 액션으로 데이터 변경

4. **에러 처리**
   - 라우트별 에러 처리
   - 에러 복구 메커니즘
   - 사용자 친화적 에러 UI

---
