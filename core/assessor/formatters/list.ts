import type { ListSource } from "../../ingester/types";
import { SourceFormatter } from "./base";

export class ListFormatter extends SourceFormatter<ListSource> {
  protected formatDeep(source: ListSource): string[] {
    // Future: could score each item individually and return high scores
    const content = source.content.join("\n");
    const truncated =
      content.length > 2000 ? content.slice(0, 2000) + "..." : content;
    return [`Content:\n${truncated}`];
  }
}
