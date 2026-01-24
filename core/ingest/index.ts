interface SourceBase {
  id: string;
  title: string;
  description: string;
  keypoints: string[];
}

interface DocumentSource extends SourceBase {
  type: "document";
  content: string;
}

interface ListSource extends SourceBase {
  type: "list";
  content: string[];
}

interface CollectionSource<T> extends SourceBase {
  type: "collection";
  content: Record<string, T>[];
}

type Source = DocumentSource | ListSource | CollectionSource<any>;

export type {
  Source,
  DocumentSource,
  ListSource,
  CollectionSource,
  SourceBase,
};
