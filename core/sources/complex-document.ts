import { IndexedSourceBase, type Metadata } from "../types/source";

/** A section within a complex document. */
export interface DocumentSection {
  /** Section heading text */
  heading: string;
  /** Heading depth (1 for top-level, 2 for subsection, etc.) */
  level: number;
  /** Section's own text content (excluding children) */
  content: string;
  /** Section-level metadata (generated or rolled up) */
  metadata: Metadata;
  /** Nested subsections */
  children: DocumentSection[];
}

/**
 * Source containing a structured document split into sections.
 * Each section carries its own metadata for independent scoring.
 */
export class ComplexDocumentSource extends IndexedSourceBase {
  readonly kind = "complex-document";

  /**
   * @param id Unique source ID
   * @param metadata Top-level metadata for the entire document
   * @param sections The section tree
   * @param getContent Provider for the full document text
   */
  constructor(
    id: string,
    metadata: Metadata | undefined,
    public sections: DocumentSection[],
    private readonly content: string,
    path?: string,
  ) {
    super(id, metadata, path);
  }

  get isIterable(): false {
    return false;
  }

  /** Returns the full document text. */
  getContent: () => string = () => this.content;

  buildIndexInput(): string {
    return this.content;
  }

  buildDeepJudgeInput(): string {
    return this.content;
  }
}
