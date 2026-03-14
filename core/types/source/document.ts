import { SourceBase, SourceKind } from "./base";

/**
 * Source containing a single text document.
 */
export class DocumentSource extends SourceBase {
  readonly kind = SourceKind.Document;

  /**
   * @param id Unique source ID
   * @param metadata Generated metadata for the source
   * @param getContent Provider for document text
   */
  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    getContent: () => string,
  ) {
    super(id, metadata);
    this.getContent = getContent;
  }

  get isIterable(): boolean {
    return false;
  }

  /** Returns the document text. */
  getContent: () => string;
}
