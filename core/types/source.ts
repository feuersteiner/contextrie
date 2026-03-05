/**
 * Source type contracts and pipeline stages for content ingestion.
 *
 * Workflow overview:
 * - Raw: unstructured input (strings, arrays, or lazy/async providers) supplied by
 *   callers and connectors before any normalization.
 * - Draft: normalized envelope that tags raw payloads with a kind and origin;
 *   produced by ingestion/collection code and consumed by processing pipelines.
 * - Indexed: finalized, metadata-enriched sources ready for retrieval and serving;
 *   produced by indexing and consumed by query/runtime systems.
 */
/**
 * Supported source kinds.
 */
export enum SourceKind {
  /** A single document-style source. */
  Document = "document",
  /** A list/collection-style source. */
  List = "list",
  /** A document sourced from a reference provider. */
  ReferenceDocument = "reference-document",
  /** A list sourced from a reference provider. */
  ReferenceList = "reference-list",
}

/** Metadata extracted or generated during indexing. */
export interface Metadata {
  /** Human-readable title for the source. */
  title: string;
  /** Short description or summary. */
  description: string;
  /** Keypoints derived from the content. */
  keypoints: string[];
}

/** Identifier for where a source originated. */
export interface Origin {
  /** Origin system or connector type. */
  type: string;
  /** Optional origin-specific identifier. */
  id?: string;
}

/**
 * Raw (pre-normalization) source input accepted by ingestion.
 * Used by collection/connectors before draft creation.
 */
export type RawSource =
  | string
  | string[]
  | (() => Promise<string> | string)
  | (() => Promise<AsyncIterable<string>> | AsyncIterable<string>);

/**
 * Draft (normalized) source envelope used by processing pipelines.
 * Produced after ingestion, before indexing.
 */
export interface DraftSource {
  id: string;
  /** Source kind discriminator. */
  kind: SourceKind;
  /** Raw content payload or provider. */
  payload: RawSource;
  /** Origin information for traceability. */
  origin: Origin;
}

/**
 * Base class for all indexed sources.
 */
export abstract class IndexedSourceBase {
  /**
   * @param id Unique source ID
   * @param metadata Generated metadata for the source
   */
  constructor(
    public id: string,
    public metadata: Metadata,
  ) {}

  /** Source kind discriminator for indexed sources. */
  abstract readonly kind: SourceKind;
  /** True when content should be consumed as a list/stream. */
  abstract get isIterable(): boolean;
  /** Returns content or a lazy/async provider. */
  abstract getContent: () =>
    | string
    | string[]
    | AsyncIterable<string>
    | Promise<string | string[] | AsyncIterable<string>>;
}
