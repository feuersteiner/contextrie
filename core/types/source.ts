import type { LanguageModel } from "ai";

/**
 * Source type contracts for content ingestion and indexing lifecycle.
 */
/** Metadata extracted or generated during indexing. */
export interface Metadata {
  /** Human-readable title for the source. */
  title: string;
  /** Short description or summary. */
  description: string;
  /** Keypoints derived from the content. */
  keypoints: string[];
}

/**
 * Base class for all indexed sources.
 */
export abstract class IndexedSourceBase {
  /**
   * @param id Unique source ID
   * @param metadata Optional metadata; missing metadata means source is draft.
   */
  constructor(
    public id: string,
    public metadata?: Metadata,
  ) {}

  /** True when source has not been indexed yet. */
  get isDraft(): boolean {
    return !this.metadata;
  }

  /** Source kind discriminator for indexed sources. */
  abstract readonly kind: string;
  /** True when content should be consumed as a list/stream. */
  abstract get isIterable(): boolean;
  /** Returns content or a lazy/async provider. */
  abstract getContent: () =>
    | string
    | string[]
    | AsyncIterable<string>
    | Promise<string | string[] | AsyncIterable<string>>;

  /** Build the input string used for indexing. */
  abstract buildIndexInput(): string | Promise<string>;
  /** Build the input string used for deep judging. */
  abstract buildDeepJudgeInput(): string | Promise<string>;
}
