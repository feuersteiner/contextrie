import { SourceBase, SourceKind } from "./base";

export class DocumentSource extends SourceBase {
  readonly kind = SourceKind.Document;

  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    getContent: () => string,
  ) {
    super(id, metadata);
    this.getContent = getContent;
  }

  get isIterable(): boolean {
    return false;
  }

  getContent: () => string;
}
