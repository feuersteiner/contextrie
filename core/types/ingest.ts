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

/** Hierarchical section before metadata generation. */
export interface RawSection {
  heading: string;
  level: number;
  content: string;
  children: RawSection[];
}

/** Generates metadata for a section. */
export type MapFn = (
  heading: string,
  content: string,
) => GeneratedMetadata | Promise<GeneratedMetadata>;

/** Configuration for flat-map ingestion. */
export interface FlatMapOptions {
  map: MapFn;
  /** Max parallel map calls. Default: Infinity. */
  concurrency?: number;
}

/** Rolls up children/chunk metadata into a parent. */
export type ReduceFn = (
  heading: string,
  ownContent: string,
  childMeta: GeneratedMetadata[],
) => GeneratedMetadata | Promise<GeneratedMetadata>;

/** Configuration for map-reduce ingestion. */
export interface MapReduceOptions {
  map: MapFn;
  reduce: ReduceFn;
  /** Max chars before a leaf section gets chunked. Default: Infinity (no chunking). */
  maxSectionSize?: number;
  /** Max parallel map/reduce calls. Default: Infinity. */
  concurrency?: number;
}
