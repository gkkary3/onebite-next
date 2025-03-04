# Next.js의 Page Router 방식과 App Router 방식을 익힘.
## Page Router
: Pages 폴더의 구조를 기반으로 페이지 라우팅을 제공
- 일반 경로
![](https://velog.velcdn.com/images/vekkary/post/bb5b4328-c446-4f75-8fc4-693890610f55/image.png)
![](https://velog.velcdn.com/images/vekkary/post/3be068d4-2ed8-4e29-b794-373d000a1bce/image.png)

- 동적 경로
![](https://velog.velcdn.com/images/vekkary/post/e960012c-8d9e-4cc7-a7bd-5aea9a096b72/image.png)

## Next App 생성
```
npx create-next-app@14 
```

## Navigating
``` js
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const onClickButton = () => {
    router.push("/test");
  };

  useEffect(() => {
    router.prefetch("/test");
  }, []);
  return (
    <>
      <header>
        <Link href={"/"}>index</Link>
        &nbsp;
        <Link href={"/search"} prefetch={false}>
          search
        </Link>
        &nbsp;
        <Link href={"/book/1"}>book/1</Link>
        <div>
          <button onClick={onClickButton}>/test 페이지로 이동</button>
        </div>
      </header>
      <Component {...pageProps} />
    </>
  );
}

```

next/link의 Link를 import하여 href에 해당 경로를 적어주기만 하면 된다.
```js
  import Link from "next/link"; 
   ...
  <Link href={"/book"}>book</Link>
```
신세계다!! 아래 기존 React-Router 방식에서 아주 편리한 기능을 보여준다.
```js
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/book",
    element: <book />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

```

## SSR(Server Side Rendering)
- 가장 기본적인 사전 렌더링 방식
- 요청이 들어올 떄 마다 사전 렌더링을 진행
![](https://velog.velcdn.com/images/vekkary/post/411b7a6b-1d00-4790-8171-d198ab54259c/image.png)

Next.js의 index.tsx에서 아래 getServerSideProps 함수를 설정하면 자동으로 SSR이 설정된다. 즉, localstorage:3000을 접속 시 getServerSideProps가 실행되고 return 문의 객체로 묶어준 data를 Home Component의 props로 전달된다.
``` javascript
	export const getServerSideProps = () => {
  // component보다 먼저 실행되어, 필요한 데이터를 불러오는 함수
  // 서버측에서 실행되는 함수 
      
    const data = "hello";
    return {
      props: {
        data,
      },
    };
};

    export default function Home({ data }: any) {
      console.log(data);
```
## SSG(Static Site Generation)
- SSR의 단점을 해결하는 사전 렌더링 방식
- 빌드 타임에 페이지를 미리 사전렌더링
``` javascript
  export const getStaticProps = () => {
    // component보다 먼저 실행되어, 필요한 데이터를 불러오는 함수
    // 서버측에서 실행되는 함수 

    const data = "hello";
    return {
      props: {
        data,
      },
    };
  };

  export default function Home({ data }: any) {
    console.log(data);
```

### 동적 경로에 SSG 적용
![](https://velog.velcdn.com/images/vekkary/post/7c266af3-f4ba-47d5-b9e4-4615f7298329/image.png)

- GetStaticPaths 
: 현재 페이지에 존재할 수 있는 경로들을 설정
> book/[id].tsx
> - id: 1
> - id: 2
> - id: 3
> 일 떄 GetStaticPaths를 통해 3개의 경로를 설정

```js
	export const getStaticPaths = () => {
    return {
      paths: [
        { params: { id: "1" } },
        { params: { id: "2" } },
        { params: { id: "3" } },
      ],
      // 위 id 경로외 다른 경로가 올 떄 대비책 => false 시 404NotFound
      fallback: false,
    };
};
```
## ISR(Incremental Static Regeneration)
- SSR 방식으로 생성된 정적 페이지를 일정 시간을 주기로 다시 생성
- SSG + SSR
![](https://velog.velcdn.com/images/vekkary/post/c3e74b0b-59c8-4e72-8d2e-b8fe31cfcfbc/image.png)

```js
	//2. SSG 동작
export const getStaticProps = async () => {
  // component보다 먼저 실행되어, 필요한 데이터를 불러오는 함수

  console.log("인덱스 페이지");
  // 동시에 병렬로 호출
  const [allBooks, recoBooks] = await Promise.all([
    fetchBooks(),
    fetchRandomBooks(),
  ]);

  return {
    props: { allBooks, recoBooks },
    revalidate: 3, // 재검증 3초
  };
};
```
```
    revalidate: 3, // 재검증 3초
```
기존 SSG방식인 getStaticProps에서 revalidate 속성을 추가해주면 3초 후 새 페이지를 렌더링 한다.

Next.js에서는 ISR방식으로 사용하는 걸 추천한다!!

하지만, ISR 방식을 사용할 떄 문제가 발생할 수 있다. 
예를 들어, 시간을 기반으로한 요청이 아닌 행동을 기반으로 한 페이지를 렌더링 할 때, 
즉, 사용자가 어떤 이벤트를 발생 시키고 페이지가 새로 렌더링되어야 할 때는 
On-Demand ISR(요청을 받을 떄 마다 페이지를 다시 생성하는 ISR)을 사용한다.

- localhost:3000/api/revalidate
```js
	import type { NextApiRequest, NextApiResponse } from "next";

    export default async function handler(
      req: NextApiRequest,
      res: NextApiResponse
    ) {
      try {
        await res.revalidate("/"); //index 페이지를 재생성
        return res.json({ revalidate: true });
      } catch (err) {
        if (err) return res.status(500).send("Revalidation Failed");
      }
    }

```
기존에     revalidate: 3, // 재검증 3초 <<을 지우고, api 라우터를 새로 만들어
localhost:3000/api/revalidate 경로로 요청을 보내면 index 페이지를 재생성하게 된다.

출처: 한 입 크기로 잘라먹는 Next.js

## 배포하기
``` js
npm install -g vercel

vercel login
```
