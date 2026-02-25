import { SourceBase, SourceKind } from "./base";

export class ReferenceDocumentSource extends SourceBase {
  kind = SourceKind.ReferenceDocument;

  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    private resolve: () => Promise<string> | string,
  ) {
    super(id, metadata);
  }

  get isIterable(): boolean {
    return false;
  }

  getContent = (): string | Promise<string> => this.resolve();
}
