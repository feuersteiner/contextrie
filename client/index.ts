export * from "./config";
import { Ingester, type Source } from "../core/ingester";
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
    return new Ingester(this.config.ingest, (sources) => {
      this.sources.push(...sources);
    });
  }
}
