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

  /** Default prompt used by concrete sources while generating metadata. */
  protected get metadataSystemPrompt(): string {
    return `Generate metadata for retrieval.

Return ONLY valid JSON with this exact shape:
{
  "title": string,
  "description": string,
  "keypoints": string[]
}

Rules:
- title: specific and concise (max 80 chars)
- description: 1-2 factual sentences about what this source contains and when to use it
- keypoints: 3-7 short strings with the most relevant facts, constraints, entities, or decisions
- prioritize information that helps relevance filtering
- use only provided content
- no markdown, no code fences, no extra keys`;
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

  /** Index this source in-place when draft, otherwise no-op. */
  abstract index(model: LanguageModel): Promise<this>;
}
