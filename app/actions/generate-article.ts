"use server";

import { Pipeline } from "@/app/lib/agents/Pipeline";
import { research } from "@/app/lib/agents/researcher";
import { edit } from "@/app/lib/agents/editor";
import { write } from "@/app/lib/agents/writer";
import { Repository } from "../lib/repository";

export async function generateArticle(
  userPrompt: string,
): Promise<{ cid: string }> {
  try {
    const result = await new Pipeline()
      .push(research)
      .push(write)
      .push(edit)
      .run(userPrompt);

    return { cid: await Repository.saveFile(result) };
  } catch (error) {
    console.error(error);

    return { cid: "" };
  }
}
