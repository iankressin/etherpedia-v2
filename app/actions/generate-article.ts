"use server";

import { Pipeline } from "@/app/agents/Pipeline";
import { research } from "@/app/agents/researcher";
import { edit } from "@/app/agents/editor";
import { write } from "@/app/agents/writer";
import { MetadataSchema } from "@/app/models/article";
import matter from "gray-matter";
import { saveArticleMetadata } from "@/app/lib/mongo";
import { uploadFile } from "@/app/lib/ipfs";

export async function generateArticle(
  userPrompt: string,
): Promise<{ cid: string }> {
  try {
    const result = await new Pipeline()
      .push(research)
      .push(write)
      .push(edit)
      .run(userPrompt);

    const frontMatter = matter(result).data;
    console.log(frontMatter);
    const cid = await uploadFile(result, frontMatter.title);
    const metadata = MetadataSchema.parse({
      ...frontMatter,
      cid,
      createdAt: new Date(),
    });

    await saveArticleMetadata(metadata);

    return { cid };
  } catch (error) {
    console.error(error);

    return { cid: "" };
  }
}
