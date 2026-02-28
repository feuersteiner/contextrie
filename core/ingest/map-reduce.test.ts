import { describe, expect, it } from "bun:test";
import { mapReduceSections } from "./map-reduce";
import type { RawSection, MapFn, ReduceFn } from "../types/ingest";
import type { GeneratedMetadata } from "../types/source";

// ---------------------------------------------------------------------------
// Mock map / reduce
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("mapReduceSections", () => {
  it("maps flat leaf sections", async () => {
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

  it("reduces parent with children", async () => {
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
    expect(parent.children).toHaveLength(2);
    // Children were mapped
    expect(parent.children[0]!.metadata.title).toBe("Child1");
    expect(parent.children[1]!.metadata.title).toBe("Child2");
  });

  it("chunks large leaf sections and reduces chunk results", async () => {
    const largeParagraphs = Array.from(
      { length: 5 },
      (_, i) => `Paragraph ${i}: ${"x".repeat(50)}`,
    ).join("\n\n");

    const sections: RawSection[] = [
      {
        heading: "Big",
        level: 1,
        content: largeParagraphs,
        children: [],
      },
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

    // Should have chunked and called map multiple times
    expect(mapCalls.length).toBeGreaterThan(1);
    expect(mapCalls[0]).toContain("[chunk ");
    // Final result is a reduce over those chunks
    expect(result[0]!.metadata.description).toContain("Rolled up");
  });

  it("respects concurrency bound", async () => {
    let peak = 0;
    let running = 0;

    const slowMap: MapFn = async (heading) => {
      running++;
      if (running > peak) peak = running;
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

  it("handles empty content without crashing", async () => {
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
});
