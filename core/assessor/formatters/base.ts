import type { Source } from "../../ingester/types";

/**
 * Base formatter with shared shallow formatting logic.
 * Subclasses implement type-specific deep formatting.
 */
export abstract class SourceFormatter<T extends Source = Source> {
  protected formatShallow(source: T): string[] {
    return [
      `ID: ${source.id}`,
      `Title: ${source.title}`,
      `Description: ${source.description}`,
      `Keypoints: ${source.keypoints.join("; ")}`,
    ];
  }

  protected abstract formatDeep(source: T): string[];

  format(source: T, deep: boolean): string {
    const lines = this.formatShallow(source);
    if (deep) {
      lines.push(...this.formatDeep(source));
    }
    return lines.join("\n");
  }
}
