import path from "node:path";
import { readFile } from "node:fs/promises";
import { DocumentSource, ListSource } from "@contextrie/core";
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

export const supportsTextFileSource = (filePath: string): boolean => {
  const extension = path.extname(filePath).toLowerCase();
  return extension === "" || textFileSourceExtensionSet.has(extension);
};

export const parseTextFileSource = async (
  filePath: string,
): Promise<DocumentSource | ListSource> => {
  const content = await readTextFile(filePath);
  const id = generateId();

  if (shouldParseTextAsList(content)) {
    return new ListSource(id, undefined, toLineItems(content));
  }

  return new DocumentSource(id, undefined, content);
};

const readTextFile = async (filePath: string): Promise<string> => {
  const content = await readFile(filePath, "utf8");
  return content.replace(/\r\n?/g, "\n");
};

const shouldParseTextAsList = (content: string): boolean => {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 4) {
    return false;
  }

  const shortLineCount = lines.filter((line) => line.length <= 90).length;
  const bulletCount = lines.filter((line) =>
    /^([-*+]\s+|\d+\.\s+)/.test(line),
  ).length;

  return bulletCount >= 3 || shortLineCount / lines.length >= 0.75;
};

const toLineItems = (content: string): string[] =>
  content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
