// Step 3: Implement the API routes and handlers
// File: pages/api/posts/index.ts

import { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";
import { Article } from "../../models/article";
import { v4 as uuidv4 } from "uuid";

const articlesDirectory = path.join(process.cwd(), "articles");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    // List all posts
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
    res.status(200).json(articles);
  } else if (req.method === "POST") {
    // Create a new article
    const { title, content, author } = req.body;
    const newArticle: Article = {
      id: uuidv4(),
      title,
      content,
      author,
      createdAt: new Date().toISOString(),
    };
    const filePath = path.join(articlesDirectory, `${newArticle.id}.md`);
    await fs.writeFile(filePath, JSON.stringify(newArticle, null, 2));
    res.status(201).json(newArticle);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
