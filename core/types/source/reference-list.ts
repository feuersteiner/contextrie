import { SourceBase, SourceKind } from "./base";

/**
 * Source that resolves a list on demand.
 */
export class ReferenceListSource extends SourceBase {
  readonly kind = SourceKind.ReferenceList;

  /**
   * @param id Unique source ID
   * @param metadata Generated metadata for the source
   * @param getContent Resolver for list items
   */
  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    getContent: () => Promise<AsyncIterable<string>> | AsyncIterable<string>,
  ) {
    super(id, metadata);
    this.getContent = getContent;
  }

  get isIterable(): boolean {
    return true;
  }

  /** Returns the resolved list items. */
  getContent: () => Promise<AsyncIterable<string>> | AsyncIterable<string>;
}
