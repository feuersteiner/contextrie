export * from "./config";
import { Ingester, type Source } from "../core/ingester";
import { Assessor } from "../core/assessor";
import { DEFAULT_CONFIG, type ContextrieConfig } from "./config";

export class Contextrie {
  private config: ContextrieConfig;
  public sources: Source[] = [];

  constructor(config?: Partial<ContextrieConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Returns a fresh Ingester builder for adding files.
   * Ingested sources are automatically appended to this.sources.
   */
  get ingest(): Ingester {
    return new Ingester(this.config.ingester, (sources) => {
      this.sources.push(...sources);
    });
  }

  /**
   * Returns a fresh Assessor builder for evaluating source relevance.
   *
   * Usage:
   * ```typescript
   * const result = await ctx.assess
   *   .task("Write a tweet promoting Contextrie")
   *   .from(ctx.sources)
   *   .deep()  // optional: include full content
   *   .run();
   * ```
   */
  get assess(): Assessor {
    return new Assessor(this.config.assessor);
  }
}
