"use server";

import { revalidatePath } from "next/cache";

export async function createReviewAction(formData: FormData) {
  // server action
  const bookId = formData.get("bookId")?.toString();
  const content = formData.get("content")?.toString();
  const author = formData.get("author")?.toString();

  if (!bookId || !content || !author) {
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/review/`,
      {
        method: "POST",
        body: JSON.stringify({ bookId, content, author }),
      }
    );
    console.log(response.status);
    revalidatePath(`/book/${bookId}`); // 재검증 해 캐시된 데이터를 제거하여 재랜더링
  } catch (err) {
    console.error(err);
    return;
  }
}
