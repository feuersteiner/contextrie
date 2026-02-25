import { SourceBase, SourceKind } from "./base";

export class ReferenceListSource extends SourceBase {
  readonly kind = SourceKind.ReferenceList;

  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    getContent: () => Promise<AsyncIterable<string>> | AsyncIterable<string>,
  ) {
    super(id, metadata);
    this.getContent = getContent;
  }

  get isIterable(): boolean {
    return true;
  }

  getContent: () => Promise<AsyncIterable<string>> | AsyncIterable<string>;
}
