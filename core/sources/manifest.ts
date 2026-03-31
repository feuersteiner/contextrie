import { IndexedSourceBase, type Metadata } from "../types/source";

/**
 * Lightweight source reconstructed from manifest metadata only.
 */
export class ManifestSource extends IndexedSourceBase {
  constructor(
    id: string,
    readonly kind: string,
    metadata: Metadata,
    path?: string,
  ) {
    super(id, metadata, path);
  }

  get isIterable(): false {
    return false;
  }

  getContent = (): string => "";

  buildIndexInput(): string {
    return "";
  }

  buildDeepJudgeInput(): string {
    return "";
  }
}
