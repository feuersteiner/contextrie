import { IndexedSourceBase, SourceKind, type Metadata } from "../types/source";

/**
 * Source that resolves a document on demand.
 */
export class ReferenceDocumentSource extends IndexedSourceBase {
  readonly kind = SourceKind.ReferenceDocument;

  /**
   * @param id Unique source ID
   * @param metadata Generated metadata for the source
   * @param getContent Resolver for document text, returns the resolved document text.
   */
  constructor(
    id: string,
    metadata: Metadata,
    /** Returns the resolved document text. */
    public getContent: () => Promise<string> | string,
  ) {
    super(id, metadata);
  }

  get isIterable(): false {
    return false;
  }
}
