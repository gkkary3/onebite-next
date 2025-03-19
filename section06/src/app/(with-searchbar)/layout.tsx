import { ReactNode, Suspense } from "react";
import Searchbar from "../../components/searchbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    //Suspense는 Next 서버 측에서 사전렌더링 시 묶여있는 항목을 렌더링 하지 않음.
    // SearchBar는 useSearchParams가 작동하기 떄문에 빌드 과정에서 불러올 수 없어
    // useSearchParams 이라는 비동기 함수가 끝난 후(쿼리스트링을 불러올 떄) 렌더링을 불러옴.
    <div>
      <Suspense fallback={<div>Loading ...</div>}>
        <Searchbar />
      </Suspense>
      {children}
    </div>
  );
}
