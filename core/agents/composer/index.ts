import { generateText, Output, type LanguageModel } from "ai";
import { z } from "zod";
import type { JudgeTask } from "../judge/types";
import type { ComposerSourceRecord, JudgedSource } from "./types";

const DEFAULT_COMPOSER_PROMPT = `Compose a tight retrieval context for a task.

Return ONLY valid JSON with this exact shape:
{
  "sourceIds": string[],
  "context": string
}

Rules:
- sourceIds must list only source IDs from the provided candidates
- sourceIds should include only the sources needed for the context
- context must be exactly one short markdown paragraph
- no heading
- no bullet list
- no code fences
- use only facts supported by the selected sources
- synthesize instead of enumerating
- mention source titles only when needed for clarity
- keep the paragraph dense and relevant to the task`;

const DEFAULT_TIGHTNESS_BY_OBJECTIVE: Record<JudgeTask["objective"], number> = {
  proof: 0.85,
  response: 0.65,
  other: 0.5,
};

const composerOutputSchema = z.object({
  sourceIds: z.array(z.string()),
  context: z.string(),
});

export class ComposerAgent {
  protected queue: ComposerSourceRecord = {};
  protected tightness?: number;

  constructor(
    protected readonly model: LanguageModel,
    readonly prompt: string = DEFAULT_COMPOSER_PROMPT,
  ) {}

  from = (sources: ComposerSourceRecord | ComposerSourceRecord[]): this => {
    if (Array.isArray(sources)) {
      for (const record of sources) Object.assign(this.queue, record);
      return this;
    }

    Object.assign(this.queue, sources);
    return this;
  };

  withTightness = (tightness: number): this => {
    this.tightness = tightness;
    return this;
  };

  clear = (): this => {
    this.queue = {};
    this.tightness = undefined;
    return this;
  };

  protected getEffectiveTightness(task: JudgeTask): number {
    const candidate = this.tightness ?? DEFAULT_TIGHTNESS_BY_OBJECTIVE[task.objective];
    return Math.min(1, Math.max(0, candidate));
  }

  protected rankSources(): [string, JudgedSource][] {
    return Object.entries(this.queue).sort((left, right) => {
      const scoreDelta = right[1].decision.score - left[1].decision.score;
      if (scoreDelta !== 0) return scoreDelta;
      return left[0].localeCompare(right[0]);
    });
  }

  protected async buildSourceSection(
    sourceId: string,
    judgedSource: JudgedSource,
  ): Promise<string | null> {
    const { source, decision } = judgedSource;
    const lines = [
      `Source ID: ${sourceId}`,
      `Declared source ID: ${source.id}`,
      `Source kind: ${source.kind}`,
      `Judge score: ${decision.score}`,
      `Judge reason: ${decision.reason}`,
    ];

    if (source.metadata) {
      lines.push(`Source title: ${source.metadata.title}`);
      lines.push(`Source description: ${source.metadata.description}`);
      lines.push("Source keypoints:");
      lines.push(...source.metadata.keypoints.map((point) => `- ${point}`));
      return lines.join("\n");
    }

    const content = await source.buildDeepJudgeInput();
    if (!content.trim()) return null;

    lines.push("Source content:");
    lines.push(content);
    return lines.join("\n");
  }

  protected async buildPrompt(
    task: JudgeTask,
    tightness: number,
    selectedSources: [string, JudgedSource][],
  ): Promise<string> {
    const sourceSections = await Promise.all(
      selectedSources.map(([sourceId, judgedSource]) =>
        this.buildSourceSection(sourceId, judgedSource),
      ),
    );
    const resolvedSections = sourceSections.filter(
      (section): section is string => section !== null,
    );

    if (resolvedSections.length === 0) {
      throw new Error("[ComposerAgent] no source material available to compose");
    }

    return `${this.prompt}

Task objective: ${task.objective}
Task input: ${task.input}
Context tightness: ${tightness}

Candidate sources:

${resolvedSections.join("\n\n")}`;
  }

  async run(task: JudgeTask): Promise<string> {
    const queuedSources = Object.keys(this.queue).length;
    if (queuedSources === 0) {
      throw new Error("[ComposerAgent] cannot compose without judged sources");
    }

    console.info(`[ComposerAgent] composing context from ${queuedSources} source(s)`);

    try {
      const tightness = this.getEffectiveTightness(task);
      const rankedSources = this.rankSources();
      const prompt = await this.buildPrompt(task, tightness, rankedSources);

      const { output } = await generateText({
        model: this.model,
        output: Output.object({ schema: composerOutputSchema }),
        prompt,
      });

      const availableSourceIds = new Set(rankedSources.map(([sourceId]) => sourceId));
      const selectedSourceIds = output.sourceIds.filter((sourceId) =>
        availableSourceIds.has(sourceId),
      );

      if (selectedSourceIds.length === 0) {
        throw new Error("[ComposerAgent] composer did not select any valid source IDs");
      }

      return output.context.trim();
    } finally {
      this.clear();
    }
  }
}
