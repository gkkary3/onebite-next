import { notFound } from "next/navigation";
import style from "./page.module.css";

//false 시  generateStaticParams안에 있는 param외에 404 Page로 보내버림.
// export const dynamicParmas = false;
export const dynamic = "force-dynamic";
// 정적인 param을 빌드 타임에 만들어내는 기능
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

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    return <div>오류가 발생했습니다...</div>;
  }
  const book = await response.json();
  const { id, title, subTitle, description, author, publisher, coverImgUrl } =
    book;

  return (
    <div className={style.container}>
      <div
        className={style.cover_img_container}
        style={{ backgroundImage: `url('${coverImgUrl}')` }}
      >
        <img src={coverImgUrl} />
      </div>
      <div className={style.title}>{title}</div>
      <div className={style.subTitle}>{subTitle}</div>
      <div className={style.author}>
        {author} | {publisher}
      </div>
      <div className={style.description}>{description}</div>
    </div>
  );
}
