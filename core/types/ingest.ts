import type { GeneratedMetadata, SourceBase } from "./source";
import type { RawSource } from "./raw";

export interface Parser {
  parse(input: unknown): RawSource[];
}

export interface Indexer {
  index(raw: RawSource): Promise<GeneratedMetadata>;
}

export interface Ingester {
  raw(raw: RawSource | RawSource[]): this;
  run(): Promise<SourceBase[]>;
}
