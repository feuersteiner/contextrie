export interface GeneratedMetadata {
  title: string;
  description: string;
  keypoints: string[];
}
export interface SourceBase extends GeneratedMetadata {
  id: string;
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

export type SupportedFileType = "md" | "txt" | "csv";

export interface PendingFile {
  path: string;
  type: SupportedFileType;
}
