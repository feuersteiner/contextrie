import { readFile } from "node:fs/promises";
import { ReferenceDocumentSource, type Metadata } from "@contextrie/core";
import { generateId } from "../../utils";
import { supportsTextFileSource } from "./text";

interface ReferenceTextFileSourceOptions {
  id?: string;
  metadata?: Metadata;
  path?: string;
}

const readNormalizedTextFile = async (filePath: string): Promise<string> => {
  const content = await readFile(filePath, "utf8");
  return content.replace(/\r\n?/g, "\n");
};

export const parseReferenceTextFileSource = async (
  filePath: string,
  options: ReferenceTextFileSourceOptions = {},
): Promise<ReferenceDocumentSource> => {
  if (!supportsTextFileSource(filePath)) {
    throw new Error(`Unsupported text file source: ${filePath}`);
  }

  const id = options.id ?? generateId();
  const sourcePath = options.path ?? filePath;

  return new ReferenceDocumentSource(
    id,
    options.metadata,
    () => readNormalizedTextFile(filePath),
    sourcePath,
  );
};
