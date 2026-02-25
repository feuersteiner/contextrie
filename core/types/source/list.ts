import { SourceBase, SourceKind } from "./base";

const isAsyncIterable = (value: unknown): value is AsyncIterable<string> =>
  !!value &&
  typeof (value as AsyncIterable<string>)[Symbol.asyncIterator] === "function";

const asAsyncIterable = async function* (
  items: string[],
): AsyncIterable<string> {
  for (const item of items) {
    yield item;
  }
};

export class ListSource extends SourceBase {
  kind = SourceKind.List;

  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    private items: string[] | AsyncIterable<string>,
  ) {
    super(id, metadata);
  }

  get isIterable(): boolean {
    return true;
  }

  getContent = (): AsyncIterable<string> => {
    if (isAsyncIterable(this.items)) {
      return this.items;
    }

    return asAsyncIterable(this.items);
  };
}
