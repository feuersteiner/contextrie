export * from "./config";
import { Ingester, type Source } from "../core/ingester";
import { Assessor } from "../core/assessor";
import { Composer } from "../core/compose";
import { SessionManager } from "../core/session";
import { DEFAULT_CONFIG, type ContextrieConfig } from "./config";

export class Contextrie {
  private config: ContextrieConfig;
  public sources: Source[] = [];
  public session: SessionManager;

  constructor(config?: Partial<ContextrieConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
    this.session = new SessionManager();
  }

  /**
   * Returns a fresh Ingester builder for adding files.
   * Ingested sources are automatically appended to this.sources.
   *
   * Deprecation notice: this client surface will change during the issue #39 refactor.
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
   *
   * Deprecation notice: this client surface will change during the issue #39 refactor.
   */
  get assess(): Assessor {
    return new Assessor(this.config.assessor);
  }

  /**
   * Returns a fresh Composer builder for composing context.
   *
   * Usage:
   * ```typescript
   * const markdown = await ctx.compose
   *   .task("Explain authentication flow")
   *   .from(assessment.rated)
   *   .threshold(0.5)  // optional
   *   .run();
   * ```
   *
   * Deprecation notice: this client surface will change during the issue #39 refactor.
   */
  get compose(): Composer {
    return new Composer(this.config.compose);
  }
}
