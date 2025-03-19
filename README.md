## App Router
![](https://velog.velcdn.com/images/vekkary/post/d245f7ef-c248-49f0-930a-bdf09b36a8ec/image.png)
- 동적 경로
![](https://velog.velcdn.com/images/vekkary/post/57e55f2c-68b0-46b8-82c2-17cbf2b2588b/image.png)

- localhost:3000/search?q=1
[src/app/search/page.tsx]
``` js
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;
  return <div>Search 페이지 : {q}</div>;
}

```
- localhost:3000/book/1
[src/app/book/[id]/page.tsx]

```js
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>book/ [id] 페이지 : {id}</div>;
}

```

## 레이아웃 설정
![](https://velog.velcdn.com/images/vekkary/post/31c2cbcd-85da-405d-9294-a99733f67b65/image.png)
### 라우트 그룹(경로에 영향을 미치지 않는 폴더)
[src/app/[with-searchbar]]]
: 하나의 소괄호()로 된 폴더를 만들어 놓고, 해당 폴더에 page.tsx를 넣으면 
경로에 영향을 미치지 않지만 해당 폴더 내에 layout.tsx를 만들어 놓으면, 해당 폴더내에 있는 page.tsx에만 layout이 적용이 되어 유용하게 쓰일 수 있다.
![](https://velog.velcdn.com/images/vekkary/post/de73d834-b88c-4832-8445-b6ee46cec20a/image.png)
book 폴더의 page.tsx에는 layout이 적용이 안된다.

## Server Component vs Client Component
- Server Component: 서버측에서만 실행되는 컴포넌트 (브라우저 실행 X)
App Router에서는 기본적으로 Server Component를 사용한다. (useEffect, useState 사용 불가능)
하지만 경우에 따라 상호작용이 있어야 하는 컴포넌트만 Client Component를 사용하면 된다.
사용 법은 상단에 "use client"를 적어주면 Server Component -> Client Component로 적용된다.

```js
"use client";

import { useState } from "react";

export default function Searchbar() {
  const [search, setSearch] = useState("");

  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div>
      <input value={search} onChange={onChangeSearch} />
      <button>검색</button>
    </div>
  );
}
```
### 주의사항
![](https://velog.velcdn.com/images/vekkary/post/6f0991d3-1c15-466c-a10e-074ca85be179/image.png)

## 네비게이팅
[src/app/layout.tsx]
``` js
	return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header>
          <Link href={"/"}>index</Link>
          &nbsp;
          <Link href={"/search"}>Search</Link>
          &nbsp;
          <Link href={"/book/1"}>book/1</Link>
        </header>
        {children}
      </body>
    </html>
  );
```
import Link from "next/link";
를 통해 네비게이팅이 가능하다. 

```js
	import { useRouter } from "next/navigation";
	export default function Searchbar() {
    	const router = useRouter();
		
		...

    const onSubmit = () => {
      router.push(`/search?q=${search}`);
    };
    return (
      <div>
        <input value={search} onChange={onChangeSearch} />
        <button onClick={onSubmit}>검색</button>
      </div>
    );
```
import { useRouter } from "**next/navigation**";
useRouter를 통해서 	프로그래매틱한 페이지 이동도 가능하다.
주의) Page Router 버전에서는 from '**next/router**'; 를 사용

## Pre-Fetching
: 데이터를 미리 가져와 빠르게 화면을 렌더링
Link 태그 사용 시 자동으로 pre-fetching 지원

## 데이터 패칭
### In Page Router
![](https://velog.velcdn.com/images/vekkary/post/905786d4-cf61-4a2f-ba16-4f0e1d75d1c5/image.png)
![](https://velog.velcdn.com/images/vekkary/post/81dc4279-56e2-4cac-8303-8a7cd7994792/image.png)

### In App Router
![](https://velog.velcdn.com/images/vekkary/post/a44014aa-d028-433e-ae74-32eae4c1fb10/image.png)
=> 기존의 getServerSideProps, getStaticProps ...를 대체한다!!

## 데이터 캐시
fetch 메서드를 활용해 불러온 데이터를 Next 서버에서 보관하는 기능
: 영구적으로 데이터를 보관 / 특정 시간을 주기로 갱신 
=> 불 필요한 데이터 요청의 수를 줄여 웹 서비스 성능을 크게 개선

![](https://velog.velcdn.com/images/vekkary/post/fc2b44ed-6671-4dd0-8cbe-ca75a38c905c/image.png)
=> 오직 fetch 메서드에서만 활용 가능
### { cache: "no-store"}
- 데이터 패칭의 결과를 저장하지 않는 옵션
- 캐싱을 아예 하지 않도록 설정하는 옵션
![](https://velog.velcdn.com/images/vekkary/post/cf73df46-6bd3-4bbf-a0ab-49377c472ce9/image.png)
### { cache: "force-cache"}
- 요청의 결과를 무조건 캐싱
- 한번 호출 된 이후에는 다시는 호출되지 않음
![](https://velog.velcdn.com/images/vekkary/post/2701ef8b-74d4-45e2-801c-281d9b4204a1/image.png)
### { next: {revalidate: 3 }}
- 특정 시간을 주기로 캐시를 업데이트 함
- 마치 Page Router의 ISR 방식과 유사 함
![](https://velog.velcdn.com/images/vekkary/post/43d52a83-8ba9-41f8-a048-8e3d09d80194/image.png)
![](https://velog.velcdn.com/images/vekkary/post/90d4a2a0-f538-436c-8775-2278ca67c31d/image.png)
### { next: {tags: ['a'] }}
- On-Demand Revalidate
- 요청이 들어왔을 떄 데이터를 최신화 함

## 리퀘스트 메모이제이션
- 요청을 기억함
- 같은 요청을 여러개 보낼 떄 중복된 API 요청을 하나의 요청으로 자동으로 합쳐줌. 
![](https://velog.velcdn.com/images/vekkary/post/1ebc8da5-07a9-41cb-b05c-7eaa93d7e783/image.png)

## 페이지 캐싱
### 풀 라우트 캐시
Next 서버측에서 빌드 타임에 특정 페이지의 렌더링 결과를 캐싱하는 기능
![](https://velog.velcdn.com/images/vekkary/post/698ca6c7-716a-4c20-b4d3-1d94ccae9364/image.png)
![](https://velog.velcdn.com/images/vekkary/post/a6e67510-2cee-4980-be84-fdcc8c521ba3/image.png)
정적(Static) 페이지에서만 풀 라우트 캐시를 적용해서 빠른 속도로 처리 가능
=> { cache: "force-cache" }를 fetch함수에서 적용해주면 된다.
#### 동적 경로에 generateStaticParams
정적인 param을 빌드 타임에 만들어내는 기능
```js
export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string | string[] }>;
}) {
  const param = await Promise.resolve(params); // `params`를 비동기적으로 해석
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/${param.id}`
  );
```
generateStaticParams 안에 배열로 특정 id를 설정해서 빌드 타임에 호출하여
속도가 빠르게 가능하다.
특정 id가 설정된 param 외에 호출이 될 시에 실시간으로 동적 페이지로 만들어진다.


### 라우트 세그먼트 옵션
특정 페이지에 캐싱이나 Revalidate 동작을 강제로 설정할 수 있게해주는 옵션
```js
export const dynamicParmas = false;
// 정적인 param을 빌드 타임에 만들어내는 기능
export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];
}
```

generateStaticParams으로 설정된 param 외에 호출 시 
dynamicParmas = false 옵션으로 강제로 404 Page로 이동

``` js
export const dynamic = "force-dynamic";
// 특정 페이지의 유형을 강제로 Static, Dynamic 페이지로 설정
// 1. auto : 기본 값, 아무것도 강제하지 않음.
// 2. force-dynamic : 페이지를 강제로 Dynamic 페이지로 설정
// 3. force-static : 페이지를 강제로 Static 페이지로 설정
// 4. error : 페이지를 강제로 Static 페이지로 설정 (설정하면 안되는 이유 => 빌드 오류)
```
### 클라이언트 라우터 캐시
- 브라우저에 저장되는 캐시 
- 페이지 이동을 효율적으로 진행하기 위헤 일부 데이터를 보관
![](https://velog.velcdn.com/images/vekkary/post/d18525e5-19f1-4e99-8f69-f9aa24161d11/image.png)
현재 ~/(index) 와 ~/search를 호출할 때 공통된 레이아웃(루트, 서치바)컴포너트를 호출하게되는데, 이것을 불필요한 동작이기 때문에 
~/(index)를 호출 할 때 공통된 레이아웃을 캐시하여 ~/search를 호출할 떄 캐시된 공통된 레이아웃은 빠르게 가져오고, 나머지 필요한 페이지 및 기타는 새로 요청해서 불러오게 되는 기능이다.

## 페이지 스트리밍(loading.tsx)
- 데이터를 패칭 전 서버에서 HTML을 점진적으로 전송하여 사용자가 더 빠르게 콘텐츠를 볼 수 있도록 하는 기술이다. 
![](https://velog.velcdn.com/images/vekkary/post/f33447ed-ad1f-4d04-b89f-fad250877b9f/image.png)
search 폴더에 loading.tsx를 생성해주면 자동으로 페이지 스트리밍이 적용됨.
단, 비동기 페이지 컴포넌트에서만 사용 가능하다.
## 컴포넌트 스트리밍(Suspense Component)
``` js
... 

async function SearchResult({ q }: { q: string }) {
  await delay(1500);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/search?q=${q}`,
    { cache: "force-cache" }
  );

  if (!response.ok) {
    return <div>오류가 발생했습니다..</div>;
  }

 ...

}

export default function Page({
  searchParams,
}: {
  searchParams: {
    q?: string;
  };
}) {
 
  return (
    <Suspense key={searchParams.q || ""} fallback={<div>Loading ...</div>}>
      <SearchResult q={searchParams.q || ""} />;
    </Suspense>
  );
}


```
페이지 스트리밍 시 loading.tsx를 사용하는 대신에 SusPense를 이용해
SearchResult를 Suspense로 묶어서 fallback 시 대체 UI로서 Loading ...이 표시된다.

Suspense 컴포넌트는 한 페이지 내에 비동기 작업이 여러 개가 있을 떄 진가를 발휘한다. 

### 스켈레톤 UI 적용하기
``` js
	        <Suspense
          fallback={
            <>
              <BookItemSkeleton />
            </>
          }
        >
```
fallback 속성에 대체될 Component를 적어주면 된다.
![](https://velog.velcdn.com/images/vekkary/post/e95f7bf8-8ef7-4f5a-8faa-e4410857b9a4/image.png)

## 에러 핸들링
fetch 호출 시 try-catch 구문으로 전부 에러를 핸들링 하기에는 손이 많이 가는 문제점이 발생한다. 그래서 Next.js에서는 페이지 경로에  error.tsx를 만들어 주면 자동으로 에러를 핸들링 한다.
![](https://velog.velcdn.com/images/vekkary/post/c80db297-0c6d-4452-9476-a809376dd165/image.png)

``` js
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    console.log(error.message);
  }, [error]);
  return (
    <div>
      <h3>오류가 발생했습니다.( {error.message} )</h3>
      <button
        onClick={() => {
          startTransition(() => {
            router.refresh(); // 현재 페이지에 필요한 서버컴포넌트들을 다시 불러옴
            reset(); // 에러 상태를 초기화, 컴포넌트들을 다시 렌더링
          });
        }}
      >
        다시 시도
      </button>
    </div>
  );
}

```
props로 error를 받으면 error의 message 출력이 가능하고, 
오류 발생시 router의 refresh함수를 통해서 현재 페이지의 서버컴포넌트의 fetch 데이터를 다시 불러와 데이터를 재랜더링하고 오류 페이지를 없앨 수 있다. 
이 때, router.refresh()는 비동기함수인데,reset()이 먼저 실행이 되는 문제가 발생해 이럴 떄는 startTransition을 이용해 
순차적으로 실행이 되게끔 콜백함수를 적어주면 된다.
