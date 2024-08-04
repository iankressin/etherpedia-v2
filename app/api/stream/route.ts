import { edit } from "@/app/lib/agents/editor";
import { Pipeline } from "@/app/lib/agents/Pipeline";
import { research } from "@/app/lib/agents/researcher";
import { write } from "@/app/lib/agents/writer";
import { ArticleEventPayload, AgentStep } from "@/app/lib/ArticleEventPayload";
import { Repository } from "@/app/lib/repository";
import matter from "gray-matter";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchTerm = request.nextUrl.searchParams.get("search");

  if (!searchTerm) {
    return new Response("Missing search term", { status: 400 });
  }

  const articleStream = getArticleStream(searchTerm);

  return new Response(articleStream, {
    headers: {
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}

function getArticleStream(searchTerm: string) {
  return new ReadableStream({
    async start(controller) {
      try {
        const result = await new Pipeline()
          .push(research, (researchOutput) => {
            controller.enqueue(
              ArticleEventPayload.encodePayload({
                step: AgentStep.Research,
                data: matter(researchOutput).content,
              }),
            );
          })
          .push(write, (writeOutput) => {
            controller.enqueue(
              ArticleEventPayload.encodePayload({
                step: AgentStep.Write,
                data: writeOutput,
              }),
            );
          })
          .push(edit, (editOutput) => {
            controller.enqueue(
              ArticleEventPayload.encodePayload({
                step: AgentStep.Edit,
                data: editOutput,
              }),
            );
          })
          .run(searchTerm);

        const cid = await Repository.saveFile(result);

        controller.enqueue(
          ArticleEventPayload.encodePayload({
            data: cid,
            step: AgentStep.Final,
          }),
        );
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });
}
