// File: pages/api/posts/[id].ts

import { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";

const articlesDirectory = path.join(process.cwd(), "articles");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  const filePath = path.join(articlesDirectory, `${id}.md`);

  try {
    const fileContents = await fs.readFile(filePath, "utf8");
    const article = JSON.parse(fileContents);

    if (req.method === "GET") {
      // Return full content of an article
      res.status(200).json(article);
    } else if (req.method === "PUT") {
      // Edit an article
      const { title, content, author } = req.body;
      article.title = title;
      article.content = content;
      article.author = author;
      article.updatedAt = new Date().toISOString();
      await fs.writeFile(filePath, JSON.stringify(article, null, 2));
      res.status(200).json(article);
    } else {
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(404).json({ message: "Article not found" });
  }
}
