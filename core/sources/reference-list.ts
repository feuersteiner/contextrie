import { IndexedSourceBase, SourceKind, type Metadata } from "../types/source";

/**
 * Source that resolves a list on demand.
 */
export class ReferenceListSource extends IndexedSourceBase {
  readonly kind = SourceKind.ReferenceList;

  /**
   * @param id Unique source ID
   * @param metadata Generated metadata for the source
   * @param getContent Resolver for list items
   */
  constructor(
    id: string,
    metadata: Metadata,
    /** Returns the resolved list items. */
    public getContent: () =>
      | Promise<AsyncIterable<string>>
      | AsyncIterable<string>,
  ) {
    super(id, metadata);
    this.getContent = getContent;
  }

  get isIterable(): true {
    return true;
  }
}
