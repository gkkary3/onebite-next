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
