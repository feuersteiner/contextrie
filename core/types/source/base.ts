export interface GeneratedMetadata {
  title: string;
  description: string;
  keypoints: string[];
}

export enum SourceKind {
  Document = "document",
  List = "list",
  ReferenceDocument = "reference-document",
  ReferenceList = "reference-list",
}

export abstract class SourceBase {
  constructor(
    public id: string,
    public metadata: GeneratedMetadata,
  ) {}

  abstract kind: SourceKind;
  abstract get isIterable(): boolean;
  abstract getContent():
    | string
    | AsyncIterable<string>
    | Promise<string | AsyncIterable<string>>;
}
