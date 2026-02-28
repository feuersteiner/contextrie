import type {
  DocumentSection,
  GeneratedMetadata,
} from "../types/source";
import type { MapReduceOptions, RawSection } from "../types/ingest";

/**
 * Split text into chunks on paragraph boundaries (`\n\n`).
 * Each chunk stays at or under `maxSize` characters when possible.
 * A single paragraph larger than `maxSize` becomes its own chunk.
 */
function chunkContent(text: string, maxSize: number): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (current.length === 0) {
      current = para;
      continue;
    }
    if (current.length + 2 + para.length <= maxSize) {
      current += "\n\n" + para;
    } else {
      chunks.push(current);
      current = para;
    }
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

/**
 * Walk a section tree bottom-up with map/reduce:
 *
 * | Condition | Action |
 * |-----------|--------|
 * | Leaf, content <= maxSectionSize | `map(heading, content)` |
 * | Leaf, content > maxSectionSize | chunk → map each → reduce results |
 * | Has children | recurse children → `reduce(heading, ownContent, childMeta)` |
 *
 * Each `map`/`reduce` call individually acquires a semaphore slot so that
 * concurrency=1 doesn't deadlock (no outer acquire wrapping the whole section).
 */
export async function mapReduceSections(
  sections: RawSection[],
  options: MapReduceOptions,
): Promise<DocumentSection[]> {
  const {
    map,
    reduce,
    maxSectionSize = Infinity,
    concurrency = Infinity,
  } = options;

  // Lightweight semaphore
  let running = 0;
  const queue: (() => void)[] = [];
  async function acquire() {
    if (running < concurrency) {
      running++;
      return;
    }
    await new Promise<void>((resolve) => queue.push(resolve));
    running++;
  }
  function release() {
    running--;
    queue.shift()?.();
  }

  async function guardedMap(
    heading: string,
    content: string,
  ): Promise<GeneratedMetadata> {
    await acquire();
    try {
      return await map(heading, content);
    } finally {
      release();
    }
  }

  async function guardedReduce(
    heading: string,
    ownContent: string,
    childMeta: GeneratedMetadata[],
  ): Promise<GeneratedMetadata> {
    await acquire();
    try {
      return await reduce(heading, ownContent, childMeta);
    } finally {
      release();
    }
  }

  async function walk(raw: RawSection[]): Promise<DocumentSection[]> {
    return Promise.all(
      raw.map(async (section): Promise<DocumentSection> => {
        // Recurse children first (bottom-up).
        const children = await walk(section.children);

        let metadata: GeneratedMetadata;

        if (children.length > 0) {
          // Parent: reduce over child metadata
          metadata = await guardedReduce(
            section.heading,
            section.content,
            children.map((c) => c.metadata),
          );
        } else if (section.content.length > maxSectionSize) {
          // Leaf too large: chunk → map each → reduce chunk results
          const chunks = chunkContent(section.content, maxSectionSize);
          const chunkMeta = await Promise.all(
            chunks.map((chunk, i) =>
              guardedMap(`${section.heading} [chunk ${i + 1}]`, chunk),
            ),
          );
          metadata = await guardedReduce(
            section.heading,
            section.content,
            chunkMeta,
          );
        } else {
          // Leaf within size limit: map directly
          metadata = await guardedMap(section.heading, section.content);
        }

        return {
          heading: section.heading,
          level: section.level,
          content: section.content,
          metadata,
          children,
        };
      }),
    );
  }

  return walk(sections);
}
