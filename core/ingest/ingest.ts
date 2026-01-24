import { humanId } from "human-id";
import type { IngestConfig } from "../../client/config";
import type {
  Source,
  DocumentSource,
  ListSource,
  PendingFile,
  SupportedFileType,
} from "./types";
import { parseMarkdown, parseText, parseCSV } from "./parsers";
import { generateMetadata } from "./metadata";

export class ContextrieIngest {
  private config: IngestConfig;
  private pendingFiles: PendingFile[] = [];

  constructor(config: IngestConfig) {
    this.config = config;
  }

  /**
   * Add a file to be ingested
   * @param filePath - Absolute or relative path to the file
   * @returns this - for method chaining
   */
  file = (filePath: string): this => {
    const extension = this.getFileExtension(filePath);
    const fileType = this.mapExtensionToType(extension);

    this.pendingFiles.push({
      path: filePath,
      type: fileType,
    });

    return this;
  };

  /**
   * Process all pending files and return Source array
   * @returns Promise<Source[]>
   */
  ingest = async (): Promise<Source[]> => {
    const sources: Source[] = [];

    await Promise.all(
      this.pendingFiles.map(async (file) => {
        try {
          const source = await this.processFile(file);
          sources.push(source);
        } catch (error) {
          console.error(`Error processing file ${file.path}:`, error);
        }
      }),
    );

    this.pendingFiles = [];

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

  private mapExtensionToType = (extension: string): SupportedFileType => {
    const mapping: Record<string, SupportedFileType> = {
      md: "md",
      txt: "txt",
      csv: "csv",
    };

    const fileType = mapping[extension];
    if (!fileType) {
      throw new Error(
        `Unsupported file type: .${extension}. Supported types: .md, .txt, .csv`,
      );
    }

    return fileType;
  };

  private generateId = (): string => {
    return humanId({
      adjectiveCount: 1,
      capitalize: false,
      separator: "-",
    });
  };

  private processFile = async (file: PendingFile): Promise<Source> => {
    const fileContent = await Bun.file(file.path).text();

    switch (file.type) {
      case "md":
        return this.processMarkdown(file.path, fileContent);
      case "txt":
        return this.processText(file.path, fileContent);
      case "csv":
        return this.processCSV(file.path, fileContent);
      default:
        throw new Error(`Unknown file type: ${file.type}`);
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
}
