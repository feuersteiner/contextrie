import { SourceBase, SourceKind, type GeneratedMetadata } from "./base";

/** A section within a complex document. */
export interface DocumentSection {
  /** Section heading text */
  heading: string;
  /** Heading depth (1 for top-level, 2 for subsection, etc.) */
  level: number;
  /** Section's own text content (excluding children) */
  content: string;
  /** Section-level metadata (generated or rolled up) */
  metadata: GeneratedMetadata;
  /** Nested subsections */
  children: DocumentSection[];
}

/**
 * Source containing a structured document split into sections.
 * Each section carries its own metadata for independent scoring.
 */
export class ComplexDocumentSource extends SourceBase {
  readonly kind = SourceKind.ComplexDocument;

  /**
   * @param id Unique source ID
   * @param metadata Top-level metadata for the entire document
   * @param sections The section tree
   * @param getContent Provider for the full document text
   */
  constructor(
    id: string,
    metadata: SourceBase["metadata"],
    public sections: DocumentSection[],
    getContent: () => string,
  ) {
    super(id, metadata);
    this.getContent = getContent;
  }

  get isIterable(): boolean {
    return false;
  }

  /** Returns the full document text. */
  getContent: () => string;
}
