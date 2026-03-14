# parsers

Standalone example package for `@contextrie/parsers`.

It parses the local fixture files and prints the resulting source kind, source path, and content:

- `files/example-short.csv`
- `files/example.csv`
- `files/example.md`
- `files/example.txt`

The two CSV fixtures both parse to `list` rows in the current parser behavior.

## Run

```bash
bun install
bun run index.ts
```

## What it demonstrates

- consuming the published `@contextrie/parsers` package
- parsing local `.csv`, `.md`, and `.txt` fixtures
- showing `source.path` propagation and the `ReferenceDocumentSource` text parser
