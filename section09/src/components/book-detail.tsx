"use client";

import { useState, useEffect } from "react";
import { BookData } from "@/types";
import style from "./book-detail.module.css";

interface BookDetailProps {
  bookId: string;
}

export default function BookDetail({ bookId }: BookDetailProps) {
  const [book, setBook] = useState<BookData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/${bookId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch book data");
        }
        const data = await response.json();
        setBook(data);
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!book) {
    return <div>도서 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className={style.container}>
      <div
        className={style.cover_img_container}
        style={{ backgroundImage: `url('${book.coverImgUrl}')` }}
      >
        <img src={book.coverImgUrl} alt={book.title} />
      </div>
      <div className={style.title}>{book.title}</div>
      <div className={style.subTitle}>{book.subTitle}</div>
      <div className={style.author}>
        {book.author} | {book.publisher}
      </div>
      <div className={style.description}>{book.description}</div>
      <button
        className={style.edit_button}
        onClick={() => setIsModalOpen(true)}
      >
        수정하기
      </button>

      <div
        className={`${style.modal_overlay} ${isModalOpen ? style.visible : ""}`}
        style={{ display: isModalOpen ? "block" : "none" }}
      >
        <div className={style.modal_content}>
          <h2>도서 정보 수정</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updatedBook = {
                title: formData.get("title"),
                subTitle: formData.get("subTitle"),
                description: formData.get("description"),
                author: formData.get("author"),
                publisher: formData.get("publisher"),
                coverImgUrl: formData.get("coverImgUrl"),
              };

              try {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/${bookId}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedBook),
                  }
                );

                if (!response.ok) {
                  throw new Error("Failed to update book");
                }

                const updatedData = await response.json();
                setBook(updatedData);
                setIsModalOpen(false);
              } catch (error) {
                console.error("Error updating book:", error);
              }
            }}
          >
            <div>
              <label htmlFor="title">제목:</label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={book.title}
                required
              />
            </div>
            <div>
              <label htmlFor="subTitle">부제목:</label>
              <input
                type="text"
                id="subTitle"
                name="subTitle"
                defaultValue={book.subTitle}
                required
              />
            </div>
            <div>
              <label htmlFor="description">설명:</label>
              <textarea
                id="description"
                name="description"
                defaultValue={book.description}
                required
              />
            </div>
            <div>
              <label htmlFor="author">저자:</label>
              <input
                type="text"
                id="author"
                name="author"
                defaultValue={book.author}
                required
              />
            </div>
            <div>
              <label htmlFor="publisher">출판사:</label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                defaultValue={book.publisher}
                required
              />
            </div>
            <div>
              <label htmlFor="coverImgUrl">표지 이미지 URL:</label>
              <input
                type="url"
                id="coverImgUrl"
                name="coverImgUrl"
                defaultValue={book.coverImgUrl}
                required
              />
            </div>
            <div className={style.modal_buttons}>
              <button type="submit">저장</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
