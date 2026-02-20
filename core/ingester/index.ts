import humanId from "human-id";
import type { IngesterConfig } from "../../client/config";
import type {
  Source,
  DocumentSource,
  ListSource,
  CollectionSource,
  QueuedSource,
  SupportedSourceType,
} from "./types";
import { parseMarkdown, parseText, parseCSV, parseJSON } from "./parsers";
import { generateMetadata } from "./metadata";

export type { Source, DocumentSource, ListSource, CollectionSource } from "./types";

export class Ingester {
  private config: IngesterConfig;
  private queue: QueuedSource[] = [];
  private onComplete?: (sources: Source[]) => void;

  constructor(
    config: IngesterConfig,
    onComplete?: (sources: Source[]) => void,
  ) {
    this.config = config;
    this.onComplete = onComplete;
  }

  /**
   * Add a file to be ingested
   * @param filePath - Absolute or relative path to the file
   * @returns this - for method chaining
   */
  file = (filePath: string): this => {
    const extension = this.getFileExtension(filePath);
    const sourceType = this.mapExtensionToType(extension);

    this.queue.push({
      path: filePath,
      type: sourceType,
    });

    return this;
  };

  /**
   * Process all pending files and return Source array
   * @returns Promise<Source[]>
   */
  run = async (): Promise<Source[]> => {
    const sources: Source[] = [];

    await Promise.all(
      this.queue.map(async (queued) => {
        try {
          const source = await this.processQueuedSource(queued);
          sources.push(source);
        } catch (error) {
          console.error(`Error processing file ${queued.path}:`, error);
        }
      }),
    );

    this.queue = [];
    this.onComplete?.(sources);

    return sources;
  };

  private getFileExtension = (filePath: string): string => {
    const parts = filePath.split(".");
    if (parts.length < 2) {
      throw new Error(`Unable to determine file type for: ${filePath}`);
    }
    // Safe: we checked parts.length >= 2 above
    return parts[parts.length - 1]!.toLowerCase();
  };

  private mapExtensionToType = (extension: string): SupportedSourceType => {
    const mapping: Record<string, SupportedSourceType> = {
      md: "md",
      txt: "txt",
      csv: "csv",
      json: "json",
    };

    const sourceType = mapping[extension];
    if (!sourceType) {
      throw new Error(
        `Unsupported file type: .${extension}. Supported types: .md, .txt, .csv, .json`,
      );
    }

    return sourceType;
  };

  private generateId = (): string =>
    `${humanId({
      adjectiveCount: 2,
      capitalize: false,
      separator: "-",
    })}-${Math.random().toString(36).substring(2, 8)}`;

  private processQueuedSource = async (
    queued: QueuedSource,
  ): Promise<Source> => {
    const fileContent = await readFileText(queued.path);

    switch (queued.type) {
      case "md":
        return this.processMarkdown(queued.path, fileContent);
      case "txt":
        return this.processText(queued.path, fileContent);
      case "csv":
        return this.processCSV(queued.path, fileContent);
      case "json":
        return this.processJSON(queued.path, fileContent);
      default:
        throw new Error(`Unknown file type: ${queued.type}`);
    }
  };

  private processMarkdown = async (
    path: string,
    content: string,
  ): Promise<DocumentSource> => {
    const parsedContent = parseMarkdown(content);
    const metadata = await generateMetadata(
      this.config.model,
      parsedContent,
      path,
    );

    return {
      type: "document",
      id: this.generateId(),
      title: metadata.title,
      description: metadata.description,
      keypoints: metadata.keypoints,
      content: parsedContent,
    };
  };

  private processText = async (
    path: string,
    content: string,
  ): Promise<DocumentSource> => {
    const parsedContent = parseText(content);
    const metadata = await generateMetadata(
      this.config.model,
      parsedContent,
      path,
    );

    return {
      type: "document",
      id: this.generateId(),
      title: metadata.title,
      description: metadata.description,
      keypoints: metadata.keypoints,
      content: parsedContent,
    };
  };

  private processCSV = async (
    path: string,
    content: string,
  ): Promise<ListSource> => {
    const rows = parseCSV(content);
    const metadata = await generateMetadata(
      this.config.model,
      rows.join("\n"),
      path,
    );

    return {
      type: "list",
      id: this.generateId(),
      title: metadata.title,
      description: metadata.description,
      keypoints: metadata.keypoints,
      content: rows,
    };
  };

  private processJSON = async (
    path: string,
    content: string,
  ): Promise<CollectionSource<any>> => {
    const parsed = parseJSON(content);
    const stringified = JSON.stringify(parsed, null, 2);
    const metadata = await generateMetadata(
      this.config.model,
      stringified,
      path,
    );

    return {
      type: "collection",
      id: this.generateId(),
      title: metadata.title,
      description: metadata.description,
      keypoints: metadata.keypoints,
      content: parsed,
    };
  };
}

const readFileText = async (filePath: string): Promise<string> => {
  if (typeof Bun !== "undefined" && Bun.file) {
    return Bun.file(filePath).text();
  }

  const { readFile } = await import("node:fs/promises");
  return readFile(filePath, "utf8");
};
