/**
 * Metadata generated during indexing.
 */
export interface GeneratedMetadata {
  title: string;
  description: string;
  keypoints: string[];
}

/**
 * Supported source kinds.
 */
export enum SourceKind {
  Document = "document",
  List = "list",
  ReferenceDocument = "reference-document",
  ReferenceList = "reference-list",
}

/**
 * Base class for all sources.
 */
export abstract class SourceBase {
  /**
   * @param id Unique source ID
   * @param metadata Generated metadata for the source
   */
  constructor(
    public id: string,
    public metadata: GeneratedMetadata,
  ) {}

  /** Source kind discriminator. */
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
