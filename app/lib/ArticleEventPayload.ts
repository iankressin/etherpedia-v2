import { z } from "zod";

export enum AgentStep {
  Init = "init",
  Research = "research",
  Write = "write",
  Edit = "edit",
  Final = "final",
}

const ResearchEventSchema = z.object({
  step: z.literal(AgentStep.Research),
  data: z.string(),
});

const WriterEventSchema = z.object({
  step: z.literal(AgentStep.Write),
  data: z.string(),
});

const EditorEventSchema = z.object({
  step: z.literal(AgentStep.Edit),
  data: z.string(),
});

const FinalArticleEventSchema = z.object({
  step: z.literal(AgentStep.Final),
  data: z.string(),
});

const EventPayloadSchema = z.union([
  ResearchEventSchema,
  WriterEventSchema,
  EditorEventSchema,
  FinalArticleEventSchema,
]);

export type EventPayload = z.infer<typeof EventPayloadSchema>;
export type ResearchEvent = z.infer<typeof ResearchEventSchema>;
export type WriterEvent = z.infer<typeof WriterEventSchema>;
export type EditorEvent = z.infer<typeof EditorEventSchema>;
export type FinalArticleEvent = z.infer<typeof FinalArticleEventSchema>;

export class ArticleEventPayload {
  public static encodePayload(eventPayload: EventPayload) {
    const textEncoder = new TextEncoder();
    const payload = JSON.stringify(eventPayload);
    return textEncoder.encode(`data: ${payload}\n\n`);
  }

  // TODO: refactor
  public static decodePayload(data: string): EventPayload {
    const parsedData = JSON.parse(data);

    console.log(parsedData.type);

    if (parsedData.step === AgentStep.Research) {
      console.log("Inside research step");

      const articleFoundEvent = ResearchEventSchema.safeParse(parsedData);

      if (!articleFoundEvent.success) {
        throw new Error(`Invalid event payload: ${articleFoundEvent.error}`);
      }

      return articleFoundEvent.data;
    }

    if (parsedData.step === AgentStep.Write) {
      const finalArticleEvent = WriterEventSchema.safeParse(parsedData);

      if (!finalArticleEvent.success) {
        throw new Error(`Invalid event payload: ${finalArticleEvent.error}`);
      }

      return finalArticleEvent.data;
    }

    if (parsedData.step === AgentStep.Edit) {
      const finalArticleEvent = EditorEventSchema.safeParse(parsedData);

      if (!finalArticleEvent.success) {
        throw new Error(`Invalid event payload: ${finalArticleEvent.error}`);
      }

      return finalArticleEvent.data;
    }

    if (parsedData.step === AgentStep.Final) {
      const finalArticleEvent = FinalArticleEventSchema.safeParse(parsedData);

      if (!finalArticleEvent.success) {
        throw new Error(`Invalid event payload: ${finalArticleEvent.error}`);
      }

      return finalArticleEvent.data;
    }

    throw new Error(`Invalid event payload: ${parsedData}`);
  }
}
