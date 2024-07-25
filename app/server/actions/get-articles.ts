"use server";

import { ArticleMetadata } from "@/app/models/article";

const articles = [
  {
    cid: "1",
    title: "Article 1",
    updatedAt: "2021-01-01",
    createdAt: "2021-01-01",
    tags: ["shared sequencing", "scalability"],
  },
];

export async function getArticles(
  searchTerm: string,
): Promise<ArticleMetadata[]> {
  return articles.filter(
    (article) =>
      article.title.includes(searchTerm) || article.tags.includes(searchTerm),
  );
}
