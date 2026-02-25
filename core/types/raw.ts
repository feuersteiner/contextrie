import type { SourceKind } from "./source";

export interface Origin {
  type: string;
  id?: string;
}

export type RawPayload =
  | string
  | string[]
  | (() => Promise<string> | string)
  | (() =>
      | Promise<string[] | AsyncIterable<string>>
      | string[]
      | AsyncIterable<string>);

export interface RawSource {
  kind: SourceKind;
  payload: RawPayload;
  origin: Origin;
}
