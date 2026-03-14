import { IndexedSourceBase, type Metadata } from "../types/source";

/**
 * Source that resolves a list on demand.
 */
export class ReferenceListSource extends IndexedSourceBase {
  readonly kind = "reference-list";

  /**
   * @param id Unique source ID
   * @param metadata Generated metadata for the source
   * @param getContent Resolver for list items
   */
  constructor(
    id: string,
    metadata: Metadata | undefined,
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

  async buildIndexInput(): Promise<string> {
    const content = await this.getContent();
    const items: string[] = [];
    for await (const item of content) items.push(item);
    return items.join("\n");
  }

  async buildDeepJudgeInput(): Promise<string> {
    const content = await this.getContent();
    const items: string[] = [];
    for await (const item of content) {
      items.push(item);
      if (items.length >= 10) break;
    }
    return items.join("\n");
  }
}
