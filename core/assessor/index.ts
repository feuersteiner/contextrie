import type { AssessorConfig } from "../../client/config";
import type { Source } from "../ingester/types";
import type { AssessmentResult, RatedSource } from "./types";
import { scoreSources } from "./score";

/**
 * Assessor - Evaluates source relevance against a task/prompt
 *
 * Follows the builder pattern for fluent API:
 * ```typescript
 * const result = await ctx.assess
 *   .task("Write a tweet promoting Contextrie")
 *   .from(ctx.sources)
 *   .deep()  // optional: include full content
 *   .run();
 * ```
 */
export class Assessor {
  private config: AssessorConfig;
  private _prompt: string = "";
  private _sources: Source[] = [];
  private _deep: boolean = false;

  constructor(config: AssessorConfig) {
    this.config = config;
  }

  /**
   * Set the task/prompt to assess sources against
   * @param prompt - The task or query describing what you're looking for
   * @returns this - for method chaining
   */
  task = (prompt: string): this => {
    this._prompt = prompt;
    return this;
  };

  /**
   * Add a single source to be assessed
   * @param source - A source to evaluate
   * @returns this - for method chaining
   */
  source = (source: Source): this => {
    this._sources.push(source);
    return this;
  };

  /**
   * Add multiple sources to be assessed
   * @param sources - Array of sources to evaluate
   * @returns this - for method chaining
   */
  from = (sources: Source[]): this => {
    this._sources.push(...sources);
    return this;
  };

  /**
   * Enable deep scoring mode
   *
   * By default, assessment uses only metadata (title, description, keypoints)
   * for fast scoring. Deep mode includes full content for more accurate
   * relevance scoring at the cost of speed and tokens.
   *
   * @returns this - for method chaining
   */
  deep = (): this => {
    this._deep = true;
    return this;
  };

  /**
   * Run the assessment and return rated sources
   * @returns Promise<AssessmentResult> - Sources sorted by relevance (highest first)
   * @throws Error if no prompt is set
   */
  run = async (): Promise<AssessmentResult> => {
    if (!this._prompt) {
      throw new Error("No task/prompt set. Call .task() before .run()");
    }

    const rated: RatedSource[] = await scoreSources(
      this.config.model,
      this._prompt,
      this._sources,
      this._deep,
    );

    return {
      prompt: this._prompt,
      rated,
    };
  };
}
