import { IndexedSourceBase, type Metadata } from "../types/source";

/**
 * Source containing a list of items.
 */
export class ListSource extends IndexedSourceBase {
  readonly kind = "list";

  /**
   * @param id Unique source ID
   * @param metadata Generated metadata for the source
   * @param content List items
   */
  constructor(
    id: string,
    metadata: Metadata | undefined,
    private readonly content: string[],
  ) {
    super(id, metadata);
  }

  get isIterable(): true {
    return true;
  }

  /** Returns list items. */
  getContent: () => string[] = () => this.content;

  buildIndexInput(): string {
    return this.content.join("\n");
  }

  buildDeepJudgeInput(): string {
    return this.content.slice(0, 10).join("\n");
  }
}
