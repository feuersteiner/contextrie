import { describe, expect, test } from "bun:test";
import { mapReduceSections } from "./map-reduce";
import type { RawSection, MapFn, ReduceFn } from "../types/ingest";

const mockMap: MapFn = (heading, content) => ({
  title: heading,
  description: content.slice(0, 40),
  keypoints: [heading],
});

const mockReduce: ReduceFn = (heading, _own, childMeta) => ({
  title: heading,
  description: `Rolled up ${childMeta.length} children`,
  keypoints: childMeta.flatMap((m) => m.keypoints),
});

describe("mapReduceSections", () => {
  test("maps flat leaf sections", async () => {
    const sections: RawSection[] = [
      { heading: "A", level: 1, content: "Alpha content", children: [] },
      { heading: "B", level: 1, content: "Beta content", children: [] },
    ];

    const result = await mapReduceSections(sections, {
      map: mockMap,
      reduce: mockReduce,
    });

    expect(result).toHaveLength(2);
    expect(result[0]!.metadata.title).toBe("A");
    expect(result[1]!.metadata.title).toBe("B");
    expect(result[0]!.children).toHaveLength(0);
  });

  test("reduces parent with children bottom-up", async () => {
    const sections: RawSection[] = [
      {
        heading: "Parent",
        level: 1,
        content: "Intro",
        children: [
          { heading: "Child1", level: 2, content: "C1", children: [] },
          { heading: "Child2", level: 2, content: "C2", children: [] },
        ],
      },
    ];

    const result = await mapReduceSections(sections, {
      map: mockMap,
      reduce: mockReduce,
    });

    expect(result).toHaveLength(1);
    const parent = result[0]!;
    expect(parent.metadata.description).toBe("Rolled up 2 children");
    expect(parent.metadata.keypoints).toEqual(["Child1", "Child2"]);
    expect(parent.children).toHaveLength(2);
    expect(parent.children[0]!.metadata.title).toBe("Child1");
    expect(parent.children[1]!.metadata.title).toBe("Child2");
  });

  test("chunks large leaf sections and reduces chunk results", async () => {
    const largeParagraphs = Array.from(
      { length: 5 },
      (_, i) => `Paragraph ${i}: ${"x".repeat(50)}`,
    ).join("\n\n");

    const sections: RawSection[] = [
      { heading: "Big", level: 1, content: largeParagraphs, children: [] },
    ];

    const mapCalls: string[] = [];
    const trackingMap: MapFn = (heading, content) => {
      mapCalls.push(heading);
      return mockMap(heading, content);
    };

    const result = await mapReduceSections(sections, {
      map: trackingMap,
      reduce: mockReduce,
      maxSectionSize: 100,
    });

    expect(mapCalls.length).toBeGreaterThan(1);
    expect(mapCalls[0]).toContain("[chunk ");
    expect(result[0]!.metadata.description).toContain("Rolled up");
  });

  test("respects concurrency bound", async () => {
    let peak = 0;
    let running = 0;

    const slowMap: MapFn = async (heading) => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, 10));
      running--;
      return { title: heading, description: "", keypoints: [] };
    };

    const sections: RawSection[] = Array.from({ length: 6 }, (_, i) => ({
      heading: `S${i}`,
      level: 1,
      content: `Content ${i}`,
      children: [],
    }));

    await mapReduceSections(sections, {
      map: slowMap,
      reduce: mockReduce,
      concurrency: 2,
    });

    expect(peak).toBeLessThanOrEqual(2);
  });

  test("handles empty content", async () => {
    const sections: RawSection[] = [
      { heading: "Empty", level: 1, content: "", children: [] },
    ];

    const result = await mapReduceSections(sections, {
      map: mockMap,
      reduce: mockReduce,
    });

    expect(result).toHaveLength(1);
    expect(result[0]!.metadata.title).toBe("Empty");
  });

  test("empty sections array", async () => {
    const result = await mapReduceSections([], {
      map: mockMap,
      reduce: mockReduce,
    });
    expect(result).toHaveLength(0);
  });
});
