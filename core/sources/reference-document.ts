import { IndexedSourceBase, type Metadata } from "../types/source";

/**
 * Source that resolves a document on demand.
 */
export class ReferenceDocumentSource extends IndexedSourceBase {
  readonly kind = "reference-document";

  /**
   * @param id Unique source ID
   * @param metadata Generated metadata for the source
   * @param getContent Resolver for document text, returns the resolved document text.
   */
  constructor(
    id: string,
    metadata: Metadata | undefined,
    /** Returns the resolved document text. */
    public getContent: () => Promise<string> | string,
  ) {
    super(id, metadata);
  }

  get isIterable(): false {
    return false;
  }

  async buildIndexInput(): Promise<string> {
    return await this.getContent();
  }

  async buildDeepJudgeInput(): Promise<string> {
    return await this.getContent();
  }
}
