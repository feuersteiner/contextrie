import { SourceBase, SourceKind } from "./base";

export class ReferenceDocumentSource extends SourceBase {
  readonly kind = SourceKind.ReferenceDocument;

  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    getContent: () => Promise<string> | string,
  ) {
    super(id, metadata);
    this.getContent = getContent;
  }

  get isIterable(): boolean {
    return false;
  }

  getContent: () => string | Promise<string>;
}
