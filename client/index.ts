export * from "./config";
import type { Source } from "../core/ingest";
import { DEFAULT_CONFIG, type ContextrieConfig } from "./config";

export class Contextrie {
  private config: ContextrieConfig;

  constructor(
    public sources: Source[] = [],
    config?: Partial<ContextrieConfig>,
  ) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }
}
