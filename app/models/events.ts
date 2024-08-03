import { z } from "zod";

export const ArticleEventSchema = z.object({
  types: z.enum(["articles-found", "final-article"]),
  data: z.string(),
});
export type ArticleEvent = z.infer<typeof ArticleEventSchema>;
