import { SourceBase, SourceKind } from "./base";

/**
 * Source containing a list of items.
 */
export class ListSource extends SourceBase {
  readonly kind = SourceKind.List;

  /**
   * @param id Unique source ID
   * @param metadata Generated metadata for the source
   * @param getContent Provider for list items
   */
  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    getContent: () => string[],
  ) {
    super(id, metadata);
    this.getContent = getContent;
  }

  get isIterable(): boolean {
    return true;
  }

  /** Returns list items. */
  getContent: () => string[];
}
