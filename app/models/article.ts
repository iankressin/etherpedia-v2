import { z } from "zod";

export const MetadataSchema = z.object({
  title: z.string(),
  cid: z.string(),
  createdAt: z.date(),
  tags: z.array(z.string()),
  description: z.string(),
});

export interface ArticleMetadata {
  cid: string;
  title: string;
  createdAt: Date;
  tags: string[];
  description: string;
}

export interface Article extends ArticleMetadata {
  content: string;
}
