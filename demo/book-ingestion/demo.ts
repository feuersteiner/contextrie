/**
 * Map-reduce ingestion demo.
 *
 * Splits a large markdown document into sections, generates metadata
 * bottom-up (map leaves, reduce parents), and produces a
 * ComplexDocumentSource.
 *
 * Runs out-of-the-box with a heuristic indexer (no LLM needed).
 * Swap `heuristicMap` / `heuristicReduce` for LLM-backed variants
 * to get production-quality metadata — see the comments below.
 */

import {
  ComplexDocumentSource,
  type DocumentSection,
  type GeneratedMetadata,
  type MapFn,
  type ReduceFn,
  type RawSection,
  mapReduceSections,
} from "../../core";
import { parseMarkdownSections } from "./parse-sections";

// ---------------------------------------------------------------------------
// Map / Reduce helpers
// ---------------------------------------------------------------------------

/** Heuristic map — extracts metadata from a leaf section without an LLM. */
function heuristicMap(heading: string, content: string): GeneratedMetadata {
  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  return {
    title: heading,
    description: sentences[0] ?? heading,
    keypoints: sentences.slice(0, 3),
  };
}

/** Heuristic reduce — rolls up children metadata into a parent summary. */
function heuristicReduce(
  heading: string,
  _ownContent: string,
  childMeta: GeneratedMetadata[],
): GeneratedMetadata {
  return {
    title: heading,
    description: `Contains ${childMeta.length} subsection(s): ${childMeta.map((m) => m.title).join(", ")}`,
    keypoints: childMeta.flatMap((m) => m.keypoints).slice(0, 5),
  };
}

// ---------------------------------------------------------------------------
// To use an LLM instead, implement MapFn / ReduceFn with your provider.
// Example with Vercel AI SDK + Azure OpenAI:
//
//   import { createAzure } from "@ai-sdk/azure";
//   import { generateObject } from "ai";
//   import { z } from "zod";
//
//   const model = createAzure({ resourceName, apiKey })(deploymentName);
//   const schema = z.object({
//     title: z.string(),
//     description: z.string(),
//     keypoints: z.array(z.string()),
//   });
//
//   const llmMap: MapFn = async (heading, content) => {
//     const { object } = await generateObject({
//       model,
//       schema,
//       prompt: `Generate metadata for this section.\n\n# ${heading}\n${content}`,
//     });
//     return object;
//   };
//
//   const llmReduce: ReduceFn = async (heading, _own, children) => {
//     const { object } = await generateObject({
//       model,
//       schema,
//       prompt:
//         `Summarise these subsection metadata into a single parent entry.\n\n` +
//         `Parent: ${heading}\n` +
//         children.map((c) => `- ${c.title}: ${c.description}`).join("\n"),
//     });
//     return object;
//   };
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function printTree(sections: DocumentSection[], indent = "") {
  for (const s of sections) {
    const tag = s.children.length > 0 ? "reduce" : "map";
    console.log(
      `${indent}${"#".repeat(s.level)} ${s.heading}  [${tag}]  (${s.content.length} chars)`,
    );
    console.log(
      `${indent}   ${s.metadata.description.slice(0, 90)}`,
    );
    if (s.children.length > 0) printTree(s.children, indent + "  ");
  }
}

function countSections(sections: RawSection[]): number {
  return sections.reduce(
    (n, s) => n + 1 + countSections(s.children),
    0,
  );
}

const BOOK_PATH = new URL("./book.md", import.meta.url).pathname;

async function main() {
  // 1. Read the source document.
  const content = await Bun.file(BOOK_PATH).text();
  console.log(`Loaded document: ${content.length.toLocaleString()} characters\n`);

  // 2. Parse into a raw section tree.
  const raw = parseMarkdownSections(content);
  console.log(`Parsed ${countSections(raw)} sections\n`);

  // 3. Map-reduce: generate metadata bottom-up.
  //    Replace heuristicMap/heuristicReduce with LLM-backed variants
  //    for production-quality metadata.
  console.log("Running map-reduce metadata generation…\n");
  const sections = await mapReduceSections(raw, {
    map: heuristicMap,
    reduce: heuristicReduce,
    concurrency: 8,
  });

  // 4. Build the ComplexDocumentSource.
  const topMeta = heuristicReduce(
    "Document",
    "",
    sections.map((s) => s.metadata),
  );

  const source = new ComplexDocumentSource(
    "art-of-war",
    topMeta,
    sections,
    () => content,
  );

  // 5. Inspect the result.
  console.log(`=== ${source.metadata.title} ===`);
  console.log(`Kind:     ${source.kind}`);
  console.log(`ID:       ${source.id}`);
  console.log(`Sections: ${countSections(source.sections)}\n`);
  printTree(source.sections);

  console.log(`\nTop-level keypoints:`);
  for (const kp of source.metadata.keypoints) {
    console.log(`  • ${kp.slice(0, 120)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
