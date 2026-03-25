import path from "node:path";
import {
  parseCsvFileSource,
  parseMarkdownFileSource,
  parseTextFileSource,
} from "@contextrie/parsers";

const main = async (): Promise<void> => {
  const examplesDir = path.resolve(import.meta.dirname);
  const parsedSources = await Promise.all([
    parseCsvFileSource(path.join(examplesDir, "files/example-short.csv")),
    parseCsvFileSource(path.join(examplesDir, "files/example.csv")),
    parseTextFileSource(path.join(examplesDir, "files/example.ts")),
    parseMarkdownFileSource(path.join(examplesDir, "files/example.md")),
    parseTextFileSource(path.join(examplesDir, "files/example.txt")),
  ]);

  const labeledSources = [
    { label: "CSV example (short)", source: parsedSources[0] },
    { label: "CSV example (long)", source: parsedSources[1] },
    { label: "Code text example", source: parsedSources[2] },
    { label: "Markdown example", source: parsedSources[3] },
    { label: "Text example", source: parsedSources[4] },
  ];

  for (const { label, source } of labeledSources) {
    console.log(`Parsed ${label}`);
    console.log(`Kind: ${source.kind}`);
    console.log(`Source ID: ${source.id}`);
    console.log("Content:");
    console.log(source.getContent());
    console.log("");
  }
};

void main();
