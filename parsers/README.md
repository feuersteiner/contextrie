# @contextrie/parsers

Node-based file parsers for turning local `.txt`, code/text files, `.md`, and `.csv` files into `@contextrie/core` source instances.

## Install

```bash
npm install @contextrie/parsers @contextrie/core
```

## Usage

```ts
import {
  parseCsvFileSource,
  parseMarkdownFileSource,
  parseReferenceTextFileSource,
  parseTextFileSource,
} from "@contextrie/parsers";

const csvSource = await parseCsvFileSource("./examples/example.csv");
const codeSource = await parseTextFileSource("./examples/example.ts");
const markdownSource = await parseMarkdownFileSource("./examples/example.md");
const textSource = await parseTextFileSource("./examples/example.txt");
const referenceSource = await parseReferenceTextFileSource("./examples/example.ts");

console.log(csvSource.kind, csvSource.path, csvSource.getContent());
console.log(codeSource.kind, codeSource.path, codeSource.getContent());
console.log(markdownSource.kind, markdownSource.path, markdownSource.getContent());
console.log(textSource.kind, textSource.path, textSource.getContent());
console.log(referenceSource.kind, referenceSource.path);
```

## API

- `parseTextFileSource(path): Promise<DocumentSource>`
- `parseReferenceTextFileSource(path, options?): Promise<ReferenceDocumentSource>`
- `supportsTextFileSource(path): boolean`
- `parseMarkdownFileSource(path): Promise<DocumentSource | ListSource>`
- `parseCsvFileSource(path): Promise<ListSource>`

Parsers return:

- `parseTextFileSource`: `DocumentSource`
- `parseReferenceTextFileSource`: `ReferenceDocumentSource`
- `parseMarkdownFileSource`: `DocumentSource | ListSource`
- `parseCsvFileSource`: `ListSource`

All file-based sources set `source.path` to the input file path.

`parseReferenceTextFileSource` returns a lazy file-backed source and also sets `source.path`.

## Parsing behavior

- `parseTextFileSource` supports `.txt` plus common code/text extensions such as `.ts`, `.js`, `.json`, `.yaml`, `.xml`, `.html`, `.css`, `.sh`, and more
- text/code files stay as `DocumentSource`
- `.md`: prose-like content becomes `DocumentSource`; heading-heavy or list-heavy content becomes `ListSource`
- `.csv`: rows are returned as `ListSource` items

## Notes

- File reading uses `node:fs/promises` and `node:path`
- Source IDs are generated per parsed source
- An executable example lives in `parsers/example/index.ts`
