import { IndexedSourceBase, type Metadata } from "../types/source";

/**
 * Source containing a single text document.
 */
export class DocumentSource extends IndexedSourceBase {
  readonly kind = "document";

  /**
   * @param id Unique source ID
   * @param metadata Generated metadata for the source
   * @param content Document text
   */
  constructor(
    id: string,
    metadata: Metadata | undefined,
    private readonly content: string,
  ) {
    super(id, metadata);
  }

  get isIterable(): false {
    return false;
  }

  /** Returns the document text. */
  getContent: () => string = () => this.content;

  buildIndexInput(): string {
    return this.content;
  }

  buildDeepJudgeInput(): string {
    return this.content;
  }
}
