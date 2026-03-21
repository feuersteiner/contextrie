# @contextrie/parsers

Node-based file parsers for turning local `.txt`, `.md`, and `.csv` files into `@contextrie/core` source instances.

## Install

```bash
npm install @contextrie/parsers @contextrie/core
```

## Usage

```ts
import {
  parseCsvFileSource,
  parseMarkdownFileSource,
  parseTextFileSource,
} from "@contextrie/parsers";

const csvSource = await parseCsvFileSource("./examples/example.csv");
const markdownSource = await parseMarkdownFileSource("./examples/example.md");
const textSource = await parseTextFileSource("./examples/example.txt");

console.log(csvSource.kind, csvSource.getContent());
console.log(markdownSource.kind, markdownSource.getContent());
console.log(textSource.kind, textSource.getContent());
```

## API

- `parseTextFileSource(path): Promise<DocumentSource | ListSource>`
- `parseMarkdownFileSource(path): Promise<DocumentSource | ListSource>`
- `parseCsvFileSource(path): Promise<DocumentSource | ListSource>`

Each parser reads a file from disk and returns either:

- `DocumentSource` for content that should stay as one document
- `ListSource` for content that is better represented as a list of items

## Parsing behavior

- `.txt`: prose-like content becomes `DocumentSource`; many short lines or checklist-style content becomes `ListSource`
- `.md`: prose-like content becomes `DocumentSource`; heading-heavy or list-heavy content becomes `ListSource`
- `.csv`: small/simple tables become `DocumentSource`; larger tables become `ListSource`

## Notes

- File reading uses `node:fs/promises` and `node:path`
- Source IDs are derived from the input file path
- An executable example lives in `examples/parsers.ts`
