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

export class ReferenceListSource extends SourceBase {
  kind = SourceKind.ReferenceList;

  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    private resolve: () =>
      | Promise<string[] | AsyncIterable<string>>
      | string[]
      | AsyncIterable<string>,
  ) {
    super(id, metadata);
  }

  get isIterable(): boolean {
    return true;
  }

  getContent = async (): Promise<AsyncIterable<string>> => {
    const resolved = await this.resolve();
    if (isAsyncIterable(resolved)) {
      return resolved;
    }

    return asAsyncIterable(resolved);
  };
}
