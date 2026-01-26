import type { ComposeConfig } from "../../client/config";
import type { RatedSource } from "../assessor/types";
import { compressSource, relevanceToForgetfulness } from "./compress";
import {
  type DensityValue,
  getDensityAdjustments,
  resolveDensity,
} from "./density";
import { formatMarkdown } from "./format";

export type { DensityPreset, DensityValue } from "./density";

/**
 * Composer - Composes context for AI agents from assessed sources
 *
 * Follows the builder pattern for fluent API:
 * ```typescript
 * const markdown = await ctx.compose
 *   .task("Explain authentication flow")
 *   .from(assessment.rated)
 *   .density('sparse')  // optional: 'minimal'|'sparse'|'balanced'|'detailed'|'thorough' or 0-1
 *   .run();
 * ```
 */
export class Composer {
  private config: ComposeConfig;
  private _prompt: string = "";
  private _sources: RatedSource[] = [];
  private _threshold: number;
  private _density: number;

  constructor(config: ComposeConfig) {
    this.config = config;
    this._threshold = config.defaultThreshold;
    this._density = resolveDensity(config.defaultDensity ?? "thorough");
  }

  /**
   * Set the task/prompt for context composition
   * @param prompt - The task or query the context is for
   * @returns this - for method chaining
   */
  task = (prompt: string): this => {
    this._prompt = prompt;
    return this;
  };

  /**
   * Add assessed sources to compose from
   * @param sources - Array of rated sources from assessor
   * @returns this - for method chaining
   */
  from = (sources: RatedSource[]): this => {
    this._sources.push(...sources);
    return this;
  };

  /**
   * Set the relevance threshold for filtering sources
   * Sources below this threshold will be excluded
   * @param value - Threshold value from 0 to 1 (default: 0.65)
   * @returns this - for method chaining
   */
  threshold = (value: number): this => {
    this._threshold = Math.max(0, Math.min(1, value));
    return this;
  };

  /**
   * Set the density level for context output
   * Lower density = more compression and fewer sources
   * Higher density = less compression and more sources
   * @param value - Preset ('minimal'|'sparse'|'balanced'|'detailed'|'thorough') or number 0-1
   * @returns this - for method chaining
   */
  density = (value: DensityValue): this => {
    this._density = resolveDensity(value);
    return this;
  };

  /**
   * Run the composition and return markdown context
   * @returns Promise<string> - Composed markdown context
   * @throws Error if no prompt is set
   */
  run = async (): Promise<string> => {
    if (!this._prompt) {
      throw new Error("No task/prompt set. Call .task() before .run()");
    }

    // Get density-based adjustments
    const { thresholdAdjust, forgetfulnessBoost } = getDensityAdjustments(
      this._density,
    );
    const effectiveThreshold = Math.max(
      0,
      Math.min(1, this._threshold + thresholdAdjust),
    );

    // Filter sources by effective threshold
    const filteredSources = this._sources.filter(
      (s) => s.relevance >= effectiveThreshold,
    );

    if (filteredSources.length === 0) {
      return `# Context for: ${this._prompt}\n\n*No sources met the relevance threshold of ${effectiveThreshold.toFixed(2)}*`;
    }

    // Compress each source based on its relevance and density boost
    const compressedSources = await Promise.all(
      filteredSources.map(async (rated) => {
        const forgetfulness = relevanceToForgetfulness(rated.relevance);
        const content = await compressSource(
          this.config.model,
          rated.source,
          forgetfulness,
          forgetfulnessBoost,
        );

        return {
          id: rated.source.id,
          title: rated.source.title,
          content,
          relevance: rated.relevance,
        };
      }),
    );

    // Format into hierarchical markdown
    return formatMarkdown(this._prompt, compressedSources, effectiveThreshold);
  };
}
