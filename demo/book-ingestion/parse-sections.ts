import type { RawSection } from "../../core";

/**
 * Parse markdown into a heading-based section tree.
 *
 * Each `# … ######` heading starts a new section. Text between headings
 * becomes the section's content. Nesting follows heading depth:
 * a `## Sub` after a `# Top` becomes a child of `Top`.
 */
export function parseMarkdownSections(markdown: string): RawSection[] {
  const lines = markdown.split("\n");
  const root: RawSection[] = [];

  // Stack tracks the current nesting path.
  // Each entry is the most recent section at a given depth.
  const stack: RawSection[] = [];
  let buffer: string[] = [];

  function flush() {
    const parent = stack[stack.length - 1];
    if (parent) {
      parent.content = buffer.join("\n").trim();
    }
    buffer = [];
  }

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) {
      buffer.push(line);
      continue;
    }

    flush();

    const level = match[1]!.length;
    const heading = match[2]!.trim();
    const section: RawSection = { heading, level, content: "", children: [] };

    // Pop until we find a parent with a strictly lower level.
    while (stack.length > 0 && stack[stack.length - 1]!.level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(section);
    } else {
      stack[stack.length - 1]!.children.push(section);
    }

    stack.push(section);
  }

  flush();
  return root;
}
