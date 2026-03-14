import { describe, expect, test } from "bun:test";
import { parseMarkdownSections } from "./parse-markdown";

describe("parseMarkdownSections", () => {
  test("empty string returns []", () => {
    expect(parseMarkdownSections("")).toEqual([]);
  });

  test("whitespace-only returns []", () => {
    expect(parseMarkdownSections("   \n\n  \t  ")).toEqual([]);
  });

  test("no headings → single level-0 section", () => {
    const result = parseMarkdownSections("Just plain text.\n\nAnother paragraph.");
    expect(result).toEqual([
      {
        heading: "",
        level: 0,
        content: "Just plain text.\n\nAnother paragraph.",
        children: [],
      },
    ]);
  });

  test("flat same-level headings", () => {
    const md = "# A\nalpha\n# B\nbeta\n# C\ngamma";
    const result = parseMarkdownSections(md);

    expect(result).toHaveLength(3);
    expect(result[0]!.heading).toBe("A");
    expect(result[0]!.content).toBe("alpha");
    expect(result[1]!.heading).toBe("B");
    expect(result[1]!.content).toBe("beta");
    expect(result[2]!.heading).toBe("C");
    expect(result[2]!.content).toBe("gamma");
    // All are roots, no children.
    expect(result.every((s) => s.children.length === 0)).toBe(true);
  });

  test("nested H1 > H2 > H3", () => {
    const md = "# Top\ntop text\n## Mid\nmid text\n### Deep\ndeep text";
    const result = parseMarkdownSections(md);

    expect(result).toHaveLength(1);
    const top = result[0]!;
    expect(top.heading).toBe("Top");
    expect(top.level).toBe(1);
    expect(top.content).toBe("top text");

    expect(top.children).toHaveLength(1);
    const mid = top.children[0]!;
    expect(mid.heading).toBe("Mid");
    expect(mid.level).toBe(2);
    expect(mid.content).toBe("mid text");

    expect(mid.children).toHaveLength(1);
    const deep = mid.children[0]!;
    expect(deep.heading).toBe("Deep");
    expect(deep.level).toBe(3);
    expect(deep.content).toBe("deep text");
    expect(deep.children).toHaveLength(0);
  });

  test("content before first heading (preamble)", () => {
    const md = "Preamble here.\n\n# First\ncontent";
    const result = parseMarkdownSections(md);

    expect(result).toHaveLength(2);
    expect(result[0]!.heading).toBe("");
    expect(result[0]!.level).toBe(0);
    expect(result[0]!.content).toBe("Preamble here.");

    expect(result[1]!.heading).toBe("First");
    expect(result[1]!.content).toBe("content");
  });

  test("consecutive headings with no content", () => {
    const md = "# A\n## B\n### C\nfinally some text";
    const result = parseMarkdownSections(md);

    expect(result).toHaveLength(1);
    const a = result[0]!;
    expect(a.heading).toBe("A");
    expect(a.content).toBe("");

    expect(a.children).toHaveLength(1);
    const b = a.children[0]!;
    expect(b.heading).toBe("B");
    expect(b.content).toBe("");

    expect(b.children).toHaveLength(1);
    const c = b.children[0]!;
    expect(c.heading).toBe("C");
    expect(c.content).toBe("finally some text");
  });

  test("level skip (H1 then H3)", () => {
    const md = "# Top\ntop text\n### Skipped\nskipped text";
    const result = parseMarkdownSections(md);

    expect(result).toHaveLength(1);
    const top = result[0]!;
    expect(top.heading).toBe("Top");
    // H3 nests directly under H1, no synthetic H2.
    expect(top.children).toHaveLength(1);
    expect(top.children[0]!.heading).toBe("Skipped");
    expect(top.children[0]!.level).toBe(3);
  });

  test("sibling sections at mixed levels", () => {
    const md = "# A\na text\n## A1\na1 text\n## A2\na2 text\n# B\nb text";
    const result = parseMarkdownSections(md);

    expect(result).toHaveLength(2);
    expect(result[0]!.heading).toBe("A");
    expect(result[0]!.children).toHaveLength(2);
    expect(result[0]!.children[0]!.heading).toBe("A1");
    expect(result[0]!.children[1]!.heading).toBe("A2");

    expect(result[1]!.heading).toBe("B");
    expect(result[1]!.content).toBe("b text");
    expect(result[1]!.children).toHaveLength(0);
  });

  test("level reset (H3 back to H2)", () => {
    const md =
      "# Root\nroot\n## Sub\nsub\n### Deep\ndeep\n## Back\nback to sub level";
    const result = parseMarkdownSections(md);

    expect(result).toHaveLength(1);
    const root = result[0]!;
    expect(root.children).toHaveLength(2);

    const sub = root.children[0]!;
    expect(sub.heading).toBe("Sub");
    expect(sub.children).toHaveLength(1);
    expect(sub.children[0]!.heading).toBe("Deep");

    const back = root.children[1]!;
    expect(back.heading).toBe("Back");
    expect(back.content).toBe("back to sub level");
    expect(back.children).toHaveLength(0);
  });

  test("headings inside fenced code blocks are ignored", () => {
    const md = "# Real\ntext\n\n```\n# Not a heading\n```\n\nmore text";
    const result = parseMarkdownSections(md);

    expect(result).toHaveLength(1);
    expect(result[0]!.heading).toBe("Real");
    expect(result[0]!.content).toContain("# Not a heading");
    expect(result[0]!.children).toHaveLength(0);
  });
});
