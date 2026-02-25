import { SourceBase, SourceKind } from "./base";

export class ListSource extends SourceBase {
  readonly kind = SourceKind.List;

  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    getContent: () => string[],
  ) {
    super(id, metadata);
    this.getContent = getContent;
  }

  get isIterable(): boolean {
    return true;
  }

  getContent: () => string[];
}
