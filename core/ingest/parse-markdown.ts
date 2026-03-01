import { fromMarkdown } from "mdast-util-from-markdown";
import type { Heading } from "mdast";
import type { RawSection } from "../types/ingest";

/**
 * Extract the plain-text content of an mdast node's children.
 */
function headingText(node: Heading): string {
  return node.children
    .map((c) => ("value" in c ? c.value : ""))
    .join("");
}

/**
 * Parse markdown text into a `RawSection[]` tree based on ATX headings.
 *
 * Uses mdast-util-from-markdown for correct heading detection (headings
 * inside fenced code blocks, HTML blocks, etc. are properly ignored).
 *
 * - Content before the first heading becomes a level-0 section with `heading: ""`.
 * - Level skips (e.g. H1 → H3) nest the deeper heading directly under the shallower one.
 * - An empty or whitespace-only string returns `[]`.
 */
export function parseMarkdownSections(markdown: string): RawSection[] {
  if (!markdown || !markdown.trim()) return [];

  const tree = fromMarkdown(markdown);
  const nodes = tree.children;

  // Collect heading positions from the AST.
  interface HeadingInfo {
    level: number;
    heading: string;
    /** Index of this heading in the flat node list. */
    nodeIndex: number;
  }

  const headings: HeadingInfo[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    if (node.type === "heading") {
      headings.push({
        level: node.depth,
        heading: headingText(node),
        nodeIndex: i,
      });
    }
  }

  // No headings → single level-0 section with the whole text.
  if (headings.length === 0) {
    return [{ heading: "", level: 0, content: markdown.trim(), children: [] }];
  }

  /**
   * Extract raw markdown between two offsets, trimmed.
   */
  function sliceContent(fromOffset: number, toOffset: number): string {
    return markdown.slice(fromOffset, toOffset).trim();
  }

  /**
   * Get the content for a heading: raw markdown from end of the heading node
   * to start of the next heading node (or EOF).
   */
  function contentForHeading(hIdx: number): string {
    const hNode = nodes[headings[hIdx]!.nodeIndex]!;
    const endOfHeading = hNode.position!.end.offset!;
    const nextStart =
      hIdx + 1 < headings.length
        ? nodes[headings[hIdx + 1]!.nodeIndex]!.position!.start.offset!
        : markdown.length;
    return sliceContent(endOfHeading, nextStart);
  }

  const roots: RawSection[] = [];

  // Preamble: content before the first heading.
  const firstHeadingOffset =
    nodes[headings[0]!.nodeIndex]!.position!.start.offset!;
  const preamble = sliceContent(0, firstHeadingOffset);
  if (preamble) {
    roots.push({ heading: "", level: 0, content: preamble, children: [] });
  }

  // Stack-based tree construction.
  const stack: RawSection[] = [];

  for (let i = 0; i < headings.length; i++) {
    const { level, heading } = headings[i]!;
    const content = contentForHeading(i);

    const section: RawSection = { heading, level, content, children: [] };

    // Pop stack until we find a parent with a strictly lower level.
    while (stack.length > 0 && stack[stack.length - 1]!.level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(section);
    } else {
      stack[stack.length - 1]!.children.push(section);
    }

    stack.push(section);
  }

  return roots;
}
