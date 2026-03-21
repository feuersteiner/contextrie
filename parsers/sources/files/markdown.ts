import { readFile } from "node:fs/promises";
import { DocumentSource, ListSource } from "@contextrie/core";
import { generateId } from "../../utils";

export const parseMarkdownFileSource = async (
  filePath: string,
): Promise<DocumentSource | ListSource> => {
  const content = await readTextFile(filePath);
  const id = generateId();

  if (shouldParseMarkdownAsList(content)) {
    return new ListSource(id, undefined, toMarkdownItems(content));
  }

  return new DocumentSource(id, undefined, content);
};

const readTextFile = async (filePath: string): Promise<string> => {
  const content = await readFile(filePath, "utf8");
  return content.replace(/\r\n?/g, "\n");
};

const shouldParseMarkdownAsList = (content: string): boolean => {
  const headingCount = content.match(/^#{1,6}\s+/gm)?.length ?? 0;
  const bulletCount =
    content.match(/^(?:\s*[-*+]\s+|\s*\d+\.\s+)/gm)?.length ?? 0;
  const paragraphCount = content
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean).length;

  if (headingCount >= 3) {
    return true;
  }

  if (bulletCount >= 6) {
    return true;
  }

  return headingCount >= 2 && paragraphCount >= 4;
};

const toMarkdownItems = (content: string): string[] => {
  const headingSections = splitMarkdownSections(content);
  if (headingSections.length >= 2) {
    return headingSections;
  }

  const bulletItems = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^([-*+]\s+|\d+\.\s+)/.test(line))
    .map((line) => line.replace(/^([-*+]\s+|\d+\.\s+)/, "").trim());

  if (bulletItems.length > 0) {
    return bulletItems;
  }

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

const splitMarkdownSections = (content: string): string[] => {
  const lines = content.split("\n");
  const sections: string[] = [];
  let currentSection: string[] = [];

  for (const line of lines) {
    if (/^#{1,6}\s+/.test(line) && currentSection.length > 0) {
      sections.push(currentSection.join("\n").trim());
      currentSection = [line];
      continue;
    }

    currentSection.push(line);
  }

  const finalSection = currentSection.join("\n").trim();
  if (finalSection) {
    sections.push(finalSection);
  }

  return sections.filter(Boolean);
};
