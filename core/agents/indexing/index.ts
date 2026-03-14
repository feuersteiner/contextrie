import { generateText, Output, type LanguageModel } from "ai";
import { z } from "zod";
import type { IndexedSourceBase, Metadata } from "../../types";

const DEFAULT_INDEXING_PROMPT = `Generate metadata for retrieval.

Return ONLY valid JSON with this exact shape:
{
  "title": string,
  "description": string,
  "keypoints": string[]
}

Rules:
- title: specific and concise (max 80 chars)
- description: 1-2 factual sentences about what this source contains and when to use it
- keypoints: 3-7 short strings with the most relevant facts, constraints, entities, or decisions
- prioritize information that helps relevance filtering
- use only provided content
- no markdown, no code fences, no extra keys`;

const metadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  keypoints: z.array(z.string()),
});

export class IndexingAgent {
  protected queue: IndexedSourceBase[] = [];

  constructor(
    protected readonly model: LanguageModel,
    readonly prompt: string = DEFAULT_INDEXING_PROMPT,
  ) {}

  add = (source: IndexedSourceBase | IndexedSourceBase[]): this => {
    if (Array.isArray(source)) this.queue.push(...source);
    else this.queue.push(source);
    return this;
  };

  clear = (): this => {
    this.queue = [];
    return this;
  };

  generateMetadata = async (source: IndexedSourceBase): Promise<Metadata> => {
    const input = await source.buildIndexInput();
    const { output } = await generateText({
      model: this.model,
      output: Output.object({ schema: metadataSchema }),
      prompt: `${this.prompt}\n\nSource ID: ${source.id}\nSource kind: ${source.kind}\n\nSource content:\n${input}`,
    });
    return output;
  };

  async run(): Promise<IndexedSourceBase[]> {
    console.info(`[IndexingAgent] indexing ${this.queue.length} source(s)`);
    const failedSources: IndexedSourceBase[] = [];
    const successfulResults: IndexedSourceBase[] = [];
    await Promise.all(
      this.queue.map(async (source) => {
        try {
          console.info(`[IndexingAgent] indexing source ${source.id} (${source.kind})`);
          const metadata = await this.generateMetadata(source);
          source.metadata = metadata;
          successfulResults.push(source);
          console.info(`[IndexingAgent] indexed source ${source.id}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`[IndexingAgent] failed to index source ${source.id}: ${message}`);
          failedSources.push(source);
        }
      }),
    );
    console.info(
      `[IndexingAgent] completed indexing ${successfulResults.length}/${this.queue.length} source(s), failed: ${failedSources.length}`,
    );
    this.clear();
    return successfulResults;
  }
}
