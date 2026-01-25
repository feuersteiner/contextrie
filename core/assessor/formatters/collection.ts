import type { CollectionSource } from "../../ingester/types";
import { SourceFormatter } from "./base";

export class CollectionFormatter extends SourceFormatter<CollectionSource<unknown>> {
  protected formatDeep(source: CollectionSource<unknown>): string[] {
    // TODO: could score each record individually
    const content = JSON.stringify(source.content, null, 2);
    const truncated =
      content.length > 2000 ? content.slice(0, 2000) + "..." : content;
    return [`Content:\n${truncated}`];
  }
}
