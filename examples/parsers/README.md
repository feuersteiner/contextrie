# parsers

Standalone example package for `@contextrie/parsers`.

It parses four local files and prints the resulting source kind, source id, and content:

- `files/example-short.csv`
- `files/example.csv`
- `files/example.md`
- `files/example.txt`

The two CSV fixtures intentionally cover both parser branches:

- short/simple CSV => `document`
- longer CSV => `list`

## Run

```bash
bun install
bun run index.ts
```

## What it demonstrates

- consuming the published `@contextrie/parsers` package
- parsing local `.csv`, `.md`, and `.txt` fixtures
- comparing `DocumentSource` and `ListSource` output shapes
