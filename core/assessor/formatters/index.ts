import type { Source } from "../../ingester/types";
import { DocumentFormatter } from "./document";
import { ListFormatter } from "./list";
import { CollectionFormatter } from "./collection";

const formatters = {
  document: new DocumentFormatter(),
  list: new ListFormatter(),
  collection: new CollectionFormatter(),
} as const;

/**
 * Format a source for the scoring prompt using type-specific formatter
 */
export const formatSourceForPrompt = (
  source: Source,
  deep: boolean,
): string => {
  const formatter = formatters[source.type];
  return formatter.format(source as never, deep);
};
