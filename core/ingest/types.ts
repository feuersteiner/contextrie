export interface SourceBase {
  id: string;
  title: string;
  description: string;
  keypoints: string[];
}

export interface DocumentSource extends SourceBase {
  type: "document";
  content: string;
}

export interface ListSource extends SourceBase {
  type: "list";
  content: string[];
}

export interface CollectionSource<T> extends SourceBase {
  type: "collection";
  content: Record<string, T>[];
}

export type Source = DocumentSource | ListSource | CollectionSource<any>;
