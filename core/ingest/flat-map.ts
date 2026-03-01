import type {
  RawSection,
  FlatMapOptions,
} from "../types/ingest";
import type { DocumentSection } from "../types/source/complex-document";

/**
 * Walk a section tree and generate metadata for every section independently.
 *
 * Each section's metadata comes solely from its own heading + content —
 * parent metadata is never derived from children.
 * All map calls run in parallel, bounded by an optional concurrency limit.
 */
export async function flatMapSections(
  sections: RawSection[],
  options: FlatMapOptions,
): Promise<DocumentSection[]> {
  const { map, concurrency = Infinity } = options;

  // Collect every (section, parent-result-slot) pair into a flat work list
  // so we can run all map calls under a single concurrency bound.
  interface WorkItem {
    raw: RawSection;
    target: DocumentSection[];
    index: number;
  }

  const rootResults: DocumentSection[] = new Array(sections.length);
  const work: WorkItem[] = [];

  function enqueue(raws: RawSection[], target: DocumentSection[]) {
    for (let i = 0; i < raws.length; i++) {
      const raw = raws[i]!;
      work.push({ raw, target, index: i });
      // Pre-allocate children array so nested enqueue works.
      const placeholder: DocumentSection = {
        heading: raw.heading,
        level: raw.level,
        content: raw.content,
        metadata: { title: "", description: "", keypoints: [] },
        children: new Array(raw.children.length),
      };
      target[i] = placeholder;
      if (raw.children.length > 0) {
        enqueue(raw.children, placeholder.children);
      }
    }
  }

  enqueue(sections, rootResults);

  if (concurrency === Infinity || concurrency >= work.length) {
    // Unbounded — fire all at once.
    await Promise.all(
      work.map(async ({ raw, target, index }) => {
        const metadata = await map(raw.heading, raw.content);
        target[index]!.metadata = metadata;
      }),
    );
  } else {
    // Bounded concurrency via a simple semaphore.
    let running = 0;
    let next = 0;
    await new Promise<void>((resolve, reject) => {
      function schedule() {
        while (running < concurrency && next < work.length) {
          const item = work[next++]!;
          running++;
          Promise.resolve(map(item.raw.heading, item.raw.content)).then(
            (metadata) => {
              item.target[item.index]!.metadata = metadata;
              running--;
              if (next >= work.length && running === 0) {
                resolve();
              } else {
                schedule();
              }
            },
            reject,
          );
        }
      }
      if (work.length === 0) {
        resolve();
      } else {
        schedule();
      }
    });
  }

  return rootResults;
}
