import { generateText, Output, type LanguageModel } from "ai";
import { z } from "zod";
import type { IndexedSourceBase } from "../../types";
import {
  JudgeTaskPromptRecord,
  type JudgeDecision,
  type JudgeResults,
  type JudgeTask,
} from "./types";

const DEFAULT_JUDGE_PROMPT = `Judge source relevance for a task.

Return ONLY valid JSON with this exact shape:
{
  "score": number,
  "reason": string
}

Rules:
- score must be between 0 and 1
- reason must be concise and factual
- use only the provided task and source information
- no markdown, no code fences, no extra keys`;

const judgeDecisionSchema = z.object({
  score: z.number().min(0).max(1),
  reason: z.string(),
});

export class JudgeAgent {
  protected queue: IndexedSourceBase[] = [];
  protected deepQueue: IndexedSourceBase[] = [];

  constructor(
    protected readonly model: LanguageModel,
    readonly prompt: string = DEFAULT_JUDGE_PROMPT,
  ) {}

  from = (source: IndexedSourceBase | IndexedSourceBase[]): this => {
    if (Array.isArray(source)) this.queue.push(...source);
    else this.queue.push(source);
    return this;
  };

  fromDeep = (source: IndexedSourceBase | IndexedSourceBase[]): this => {
    if (Array.isArray(source)) this.deepQueue.push(...source);
    else this.deepQueue.push(source);
    return this;
  };

  deep = (): this => {
    this.deepQueue.push(...this.queue);
    this.queue = [];
    return this;
  };

  clear = (): this => {
    this.queue = [];
    this.deepQueue = [];
    return this;
  };

  protected buildShallowPrompt = (
    task: JudgeTask,
    source: IndexedSourceBase,
  ): string => {
    const metadata = source.metadata;
    if (!metadata) {
      throw new Error(
        `[JudgeAgent] shallow source ${source.id} is missing metadata`,
      );
    }
    return `${this.prompt}

Task objective: ${task.objective}
Task input: ${task.input}
Task guidance: ${JudgeTaskPromptRecord[task.objective]}

Source ID: ${source.id}
Source kind: ${source.kind}
Source title: ${metadata.title}
Source description: ${metadata.description}
Source keypoints:
${metadata.keypoints.map((point) => `- ${point}`).join("\n")}`;
  };

  protected buildDeepPrompt = async (
    task: JudgeTask,
    source: IndexedSourceBase,
  ): Promise<string> => {
    const content = await source.buildDeepJudgeInput();

    return `${this.prompt}

Task objective: ${task.objective}
Task input: ${task.input}
Task guidance: ${JudgeTaskPromptRecord[task.objective]}

Source ID: ${source.id}
Source kind: ${source.kind}

Source content:
${content}`;
  };

  protected async judgeDeepSource(
    task: JudgeTask,
    source: IndexedSourceBase,
  ): Promise<JudgeDecision> {
    console.info(
      `[JudgeAgent] starting deep judgment for source ${source.id} (${source.kind})`,
    );
    try {
      const prompt = await this.buildDeepPrompt(task, source);
      const { output } = await generateText({
        model: this.model,
        output: Output.object({ schema: judgeDecisionSchema }),
        prompt,
      });

      console.info(
        `[JudgeAgent] completed deep judgment for source ${source.id} with score ${output.score}`,
      );
      return output;
    } catch (error) {
      console.error(
        `[JudgeAgent] deep judgment failed for source ${source.id} (${source.kind})`,
        error,
      );
      throw error;
    }
  }

  protected async judgeShallowSource(
    task: JudgeTask,
    source: IndexedSourceBase,
  ): Promise<JudgeDecision> {
    console.info(
      `[JudgeAgent] starting shallow judgment for source ${source.id} (${source.kind})`,
    );
    try {
      const prompt = this.buildShallowPrompt(task, source);
      const { output } = await generateText({
        model: this.model,
        output: Output.object({ schema: judgeDecisionSchema }),
        prompt,
      });

      console.info(
        `[JudgeAgent] completed shallow judgment for source ${source.id} with score ${output.score}`,
      );
      return output;
    } catch (error) {
      console.error(
        `[JudgeAgent] shallow judgment failed for source ${source.id} (${source.kind})`,
        error,
      );
      throw error;
    }
  }

  async run(task: JudgeTask): Promise<JudgeResults> {
    const shallowCount = this.queue.length;
    const deepCount = this.deepQueue.length;
    const totalCount = shallowCount + deepCount;
    const results: JudgeResults = {};
    const failures: IndexedSourceBase[] = [];

    console.info(`[JudgeAgent] judging ${totalCount} source(s)`);
    try {
      const shallowJobs = this.queue.map(async (source) => {
        try {
          results[source.id] = await this.judgeShallowSource(task, source);
        } catch {
          failures.push(source);
        }
      });

      const deepJobs = this.deepQueue.map(async (source) => {
        try {
          results[source.id] = await this.judgeDeepSource(task, source);
        } catch {
          failures.push(source);
        }
      });

      await Promise.all([...shallowJobs, ...deepJobs]);

      if (failures.length > 0) {
        console.error(
          `[JudgeAgent] ${failures.length}/${totalCount} judgment(s) failed for task objective ${task.objective}: ${failures
            .map((source) => `${source.id} (${source.kind})`)
            .join(", ")}`,
        );
        throw new Error(
          `[JudgeAgent] failed ${failures.length} of ${totalCount} judgment(s)`,
        );
      }

      console.info(`[JudgeAgent] completed judging ${totalCount} source(s)`);
      return results;
    } catch (error) {
      console.error(
        `[JudgeAgent] failed while judging sources for task objective ${task.objective}`,
        error,
      );
      throw error;
    } finally {
      this.clear();
    }
  }
}
