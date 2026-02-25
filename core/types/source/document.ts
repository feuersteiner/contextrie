import { SourceBase, SourceKind } from "./base";

export class DocumentSource extends SourceBase {
  kind = SourceKind.Document;

  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    private content: string,
  ) {
    super(id, metadata);
  }

  get isIterable(): boolean {
    return false;
  }

  getContent = (): string => this.content;
}
