import type { DocumentSource } from "../../ingester/types";
import { SourceFormatter } from "./base";

export class DocumentFormatter extends SourceFormatter<DocumentSource> {
  protected formatDeep(source: DocumentSource): string[] {
    const content = source.content;
    const truncated =
      content.length > 2000 ? content.slice(0, 2000) + "..." : content;
    return [`Content: ${truncated}`];
  }
}
