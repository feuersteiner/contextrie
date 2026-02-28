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

// ---------------------------------------------------------------------------
// Map-reduce ingestion types
// ---------------------------------------------------------------------------

/** Hierarchical section before metadata generation. */
export interface RawSection {
  heading: string;
  level: number;
  content: string;
  children: RawSection[];
}

/** Generates metadata for a leaf section or chunk. */
export type MapFn = (
  heading: string,
  content: string,
) => GeneratedMetadata | Promise<GeneratedMetadata>;

/** Rolls up children/chunk metadata into a parent. */
export type ReduceFn = (
  heading: string,
  ownContent: string,
  childMeta: GeneratedMetadata[],
) => GeneratedMetadata | Promise<GeneratedMetadata>;

/** Configuration for the map-reduce engine. */
export interface MapReduceOptions {
  map: MapFn;
  reduce: ReduceFn;
  /** Max chars before a section gets chunked. Default: Infinity (no chunking). */
  maxSectionSize?: number;
  /** Max parallel map/reduce calls. Default: Infinity. */
  concurrency?: number;
}
