import {
  ArticleEventPayload,
  EditorEvent,
  WriterEvent,
  ResearchEvent,
  FinalArticleEvent,
  AgentStep,
} from "@/app/lib/ArticleEventPayload";

export class AgentEventSource {
  private STREAM_API_URL = "/api/stream";
  private researchStepCallback?: (event: ResearchEvent) => void;
  private writerStepCallback?: (event: WriterEvent) => void;
  private editorStepCallback?: (event: EditorEvent) => void;
  private finalArticleCallback?: (event: FinalArticleEvent) => void;

  constructor(searchTerm: string) {
    const eventSource = new EventSource(
      `${this.STREAM_API_URL}?search=${searchTerm}`,
    );

    eventSource.onmessage = (event) => {
      const articleEvent = ArticleEventPayload.decodePayload(event.data);

      if (articleEvent.step === AgentStep.Research) {
        this.researchStepCallback?.(articleEvent);
      } else if (articleEvent.step === AgentStep.Write) {
        this.writerStepCallback?.(articleEvent);
      } else if (articleEvent.step === AgentStep.Edit) {
        this.editorStepCallback?.(articleEvent);
      } else if (articleEvent.step === AgentStep.Final) {
        console.log({
          articleEvent,
        });

        eventSource.close();
        this.finalArticleCallback?.(articleEvent);
      }
    };
  }

  public onResearch(callback: (event: ResearchEvent) => void) {
    this.researchStepCallback = callback;
  }

  public onWrite(callback: (event: WriterEvent) => void) {
    this.writerStepCallback = callback;
  }

  public onEdit(callback: (event: EditorEvent) => void) {
    this.editorStepCallback = callback;
  }

  public onFinalArticle(callback: (event: FinalArticleEvent) => void) {
    this.finalArticleCallback = callback;
  }
}
