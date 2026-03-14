import path from "node:path";
import {
  parseCsvFileSource,
  parseMarkdownFileSource,
  parseReferenceTextFileSource,
  parseTextFileSource,
} from "@contextrie/parsers";

const main = async (): Promise<void> => {
  const examplesDir = path.resolve(import.meta.dirname);
  await printSource(
    "Parsed CSV example (short)",
    await parseCsvFileSource(path.join(examplesDir, "files/example-short.csv")),
  );
  await printSource(
    "Parsed CSV example (long)",
    await parseCsvFileSource(path.join(examplesDir, "files/example.csv")),
  );
  await printSource(
    "Parsed Markdown example",
    await parseMarkdownFileSource(path.join(examplesDir, "files/example.md")),
  );
  await printSource(
    "Parsed text example",
    await parseTextFileSource(path.join(examplesDir, "files/example.txt")),
  );
  await printSource(
    "Parsed code text example",
    await parseTextFileSource(path.join(examplesDir, "files/example.ts")),
  );
  await printSource(
    "Parsed reference text example",
    await parseReferenceTextFileSource(path.join(examplesDir, "files/example.ts")),
  );
};

const printSource = async (
  label: string,
  source:
    | Awaited<ReturnType<typeof parseCsvFileSource>>
    | Awaited<ReturnType<typeof parseMarkdownFileSource>>
    | Awaited<ReturnType<typeof parseTextFileSource>>
    | Awaited<ReturnType<typeof parseReferenceTextFileSource>>,
): Promise<void> => {
  console.log(label);
  console.log(`Kind: ${source.kind}`);
  console.log(`Path: ${source.path ?? "(none)"}`);
  console.log("Content:");
  console.log(await source.getContent());
  console.log("");
};

void main();
