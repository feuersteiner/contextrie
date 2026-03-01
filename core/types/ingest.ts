import type { Metadata } from "./source";

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
) => Metadata | Promise<Metadata>;

/** Configuration for flat-map ingestion. */
export interface FlatMapOptions {
  map: MapFn;
  /** Max parallel map calls. Default: Infinity. */
  concurrency?: number;
}
