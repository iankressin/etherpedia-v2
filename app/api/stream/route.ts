import { edit } from "@/app/lib/agents/editor";
import { Pipeline } from "@/app/lib/agents/Pipeline";
import { research } from "@/app/lib/agents/researcher";
import { write } from "@/app/lib/agents/writer";
import { ArticleEventPayload, AgentStep } from "@/app/lib/ArticleEventPayload";
import { Repository } from "@/app/lib/repository";
import matter from "gray-matter";
import { NextRequest } from "next/server";

export const maxDuration = 300;

// TODO: if ever deployed to Vercel, should uncomment this variable
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchTerm = request.nextUrl.searchParams.get("search");

  if (!searchTerm) {
    return new Response("Missing search term", { status: 400 });
  }

  return new Response(getArticleStream(searchTerm).readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function getArticleStream(searchTerm: string) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();

  new Pipeline()
    .push(research, async (researchOutput) => {
      return writer.write(
        ArticleEventPayload.encodePayload({
          step: AgentStep.Research,
          data: matter(researchOutput).content,
        }),
      );
    })
    .push(write, async (writeOutput) => {
      return writer.write(
        ArticleEventPayload.encodePayload({
          step: AgentStep.Write,
          data: writeOutput,
        }),
      );
    })
    .push(edit, async (editOutput) => {
      await writer.write(
        ArticleEventPayload.encodePayload({
          step: AgentStep.Edit,
          data: editOutput,
        }),
      );
    })
    .run(searchTerm)
    .then((result) => {
      Repository.saveFile(result).then((cid) => {
        return writer.write(
          ArticleEventPayload.encodePayload({
            data: cid,
            step: AgentStep.Final,
          }),
        );
      });
    })
    .catch((e) => {
      console.log("NOT GOOD", e);
    })
    .finally(() => {
      writer.close();
    });

  return responseStream;
}
