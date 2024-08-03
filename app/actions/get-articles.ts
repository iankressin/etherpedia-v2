"use server";

import { getArticles as getArticlesDb } from "@/app/lib/repository/mongo";

export async function getArticles(searchTerm: string) {
  return getArticlesDb(searchTerm);
}
