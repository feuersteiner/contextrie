import { SourceBase, SourceKind } from "./base";

/**
 * Source that resolves a document on demand.
 */
export class ReferenceDocumentSource extends SourceBase {
  readonly kind = SourceKind.ReferenceDocument;

  /**
   * @param id Unique source ID
   * @param metadata Generated metadata for the source
   * @param getContent Resolver for document text
   */
  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    getContent: () => Promise<string> | string,
  ) {
    super(id, metadata);
    this.getContent = getContent;
  }

  get isIterable(): boolean {
    return false;
  }

  /** Returns the resolved document text. */
  getContent: () => string | Promise<string>;
}
