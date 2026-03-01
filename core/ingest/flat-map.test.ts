import { describe, expect, test } from "bun:test";
import { flatMapSections } from "./flat-map";
import type { RawSection, MapFn } from "../types/ingest";
import type { GeneratedMetadata } from "../types/source/base";

function meta(heading: string): GeneratedMetadata {
  return { title: heading, description: `desc:${heading}`, keypoints: [heading] };
}

const syncMap: MapFn = (heading) => meta(heading);

const asyncMap: MapFn = async (heading) => {
  await new Promise((r) => setTimeout(r, 1));
  return meta(heading);
};

describe("flatMapSections", () => {
  test("flat leaf sections", async () => {
    const sections: RawSection[] = [
      { heading: "A", level: 1, content: "a content", children: [] },
      { heading: "B", level: 1, content: "b content", children: [] },
    ];

    const result = await flatMapSections(sections, { map: syncMap });

    expect(result).toHaveLength(2);
    expect(result[0]!.metadata.title).toBe("A");
    expect(result[1]!.metadata.title).toBe("B");
    expect(result[0]!.children).toHaveLength(0);
  });

  test("nested parent + children mapped independently", async () => {
    const sections: RawSection[] = [
      {
        heading: "Parent",
        level: 1,
        content: "parent content",
        children: [
          { heading: "Child1", level: 2, content: "c1 content", children: [] },
          { heading: "Child2", level: 2, content: "c2 content", children: [] },
        ],
      },
    ];

    const calls: string[] = [];
    const trackingMap: MapFn = (heading) => {
      calls.push(heading);
      return meta(heading);
    };

    const result = await flatMapSections(sections, { map: trackingMap });

    // Parent and both children should all be mapped
    expect(calls).toContain("Parent");
    expect(calls).toContain("Child1");
    expect(calls).toContain("Child2");
    expect(calls).toHaveLength(3);

    // Structure preserved
    expect(result).toHaveLength(1);
    expect(result[0]!.metadata.title).toBe("Parent");
    expect(result[0]!.children).toHaveLength(2);
    expect(result[0]!.children[0]!.metadata.title).toBe("Child1");
    expect(result[0]!.children[1]!.metadata.title).toBe("Child2");
  });

  test("concurrency bound respected", async () => {
    let peak = 0;
    let running = 0;

    const sections: RawSection[] = Array.from({ length: 6 }, (_, i) => ({
      heading: `S${i}`,
      level: 1,
      content: `content ${i}`,
      children: [],
    }));

    const slowMap: MapFn = async (heading) => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, 10));
      running--;
      return meta(heading);
    };

    const result = await flatMapSections(sections, {
      map: slowMap,
      concurrency: 2,
    });

    expect(result).toHaveLength(6);
    expect(peak).toBeLessThanOrEqual(2);
  });

  test("empty content edge case", async () => {
    const sections: RawSection[] = [
      { heading: "", level: 1, content: "", children: [] },
    ];

    const result = await flatMapSections(sections, { map: syncMap });

    expect(result).toHaveLength(1);
    expect(result[0]!.metadata.title).toBe("");
    expect(result[0]!.content).toBe("");
  });

  test("empty sections array", async () => {
    const result = await flatMapSections([], { map: syncMap });
    expect(result).toHaveLength(0);
  });

  test("async map function", async () => {
    const sections: RawSection[] = [
      { heading: "X", level: 1, content: "x content", children: [] },
    ];

    const result = await flatMapSections(sections, { map: asyncMap });

    expect(result).toHaveLength(1);
    expect(result[0]!.metadata.title).toBe("X");
  });
});
