import path from "node:path";
import { readFile } from "node:fs/promises";
import { DocumentSource } from "@contextrie/core";
import { generateId } from "../../utils";

export const textFileSourceExtensions = [
  ".txt",
  ".text",
  ".log",
  ".json",
  ".jsonc",
  ".jsonl",
  ".js",
  ".cjs",
  ".mjs",
  ".jsx",
  ".ts",
  ".cts",
  ".mts",
  ".tsx",
  ".css",
  ".scss",
  ".less",
  ".html",
  ".htm",
  ".xml",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".env",
  ".sh",
  ".bash",
  ".zsh",
  ".fish",
  ".py",
  ".rb",
  ".php",
  ".java",
  ".kt",
  ".go",
  ".rs",
  ".c",
  ".h",
  ".cpp",
  ".cc",
  ".hpp",
  ".cs",
  ".swift",
  ".sql",
  ".graphql",
  ".gql",
] as const;

const textFileSourceExtensionSet = new Set<string>(textFileSourceExtensions);

const readNormalizedTextFile = async (filePath: string): Promise<string> => {
  const content = await readFile(filePath, "utf8");
  return content.replace(/\r\n?/g, "\n");
};

export const supportsTextFileSource = (filePath: string): boolean => {
  const extension = path.extname(filePath).toLowerCase();
  return extension === "" || textFileSourceExtensionSet.has(extension);
};

export const parseTextFileSource = async (
  filePath: string,
): Promise<DocumentSource> => {
  const content = await readNormalizedTextFile(filePath);
  const id = generateId();

  return new DocumentSource(id, undefined, content, filePath);
};
