// File: pages/api/posts/search.ts

import { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";

const articlesDirectory = path.join(process.cwd(), "articles-static");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { query } = req.query;
  const filenames = await fs.readdir(articlesDirectory);
  const articles = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(articlesDirectory, filename);
      const fileContents = await fs.readFile(filePath, "utf8");
      const id = path.parse(filename).name;
      const { title, content, author, createdAt, updatedAt } =
        JSON.parse(fileContents);
      return { id, title, content, author, createdAt, updatedAt };
    }),
  );
  const results = articles.filter(
    (article) =>
      article.title.includes(query as string) ||
      article.content.includes(query as string),
  );
  res.status(200).json(results);
}
