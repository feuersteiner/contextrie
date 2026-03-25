import path from "node:path";
import {
  parseCsvFileSource,
  parseMarkdownFileSource,
  parseReferenceTextFileSource,
  parseTextFileSource,
} from "../index";

const fixturesDirectory = path.resolve(
  import.meta.dirname,
  "../../examples/parsers/files",
);

const fixturePath = (filename: string): string =>
  path.join(fixturesDirectory, filename);

const printSource = async (
  label: string,
  source: Awaited<ReturnType<typeof parseCsvFileSource>>
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

const main = async (): Promise<void> => {
  await printSource(
    "Parsed CSV example (short)",
    await parseCsvFileSource(fixturePath("example-short.csv")),
  );
  await printSource(
    "Parsed CSV example (long)",
    await parseCsvFileSource(fixturePath("example.csv")),
  );
  await printSource(
    "Parsed Markdown example",
    await parseMarkdownFileSource(fixturePath("example.md")),
  );
  await printSource(
    "Parsed text example",
    await parseTextFileSource(fixturePath("example.txt")),
  );
  await printSource(
    "Parsed code text example",
    await parseTextFileSource(fixturePath("example.ts")),
  );
  await printSource(
    "Parsed reference text example",
    await parseReferenceTextFileSource(fixturePath("example.ts")),
  );
};

void main();
