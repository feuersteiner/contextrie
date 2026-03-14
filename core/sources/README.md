# sources

Concrete `IndexedSourceBase` implementations.

## Available Sources

- `DocumentSource` with `kind: "document"` for in-memory text
- `ListSource` with `kind: "list"` for in-memory string arrays
- `ReferenceDocumentSource` with `kind: "reference-document"` for lazily resolved text
- `ReferenceListSource` with `kind: "reference-list"` for lazily resolved async lists

## Common Behavior

- All sources extend `IndexedSourceBase`
- All sources can exist in draft form when `metadata` is missing
- All sources implement `buildIndexInput()` for metadata generation
- All sources implement `buildDeepJudgeInput()` for deep relevance checks

## Content Access

- `DocumentSource#getContent()` returns `string`
- `ListSource#getContent()` returns `string[]`
- `ReferenceDocumentSource#getContent()` returns `string | Promise<string>`
- `ReferenceListSource#getContent()` returns `AsyncIterable<string> | Promise<AsyncIterable<string>>`

## Indexing And Deep Judge Input

- `DocumentSource` uses the full document for both operations
- `ListSource` joins items with newlines for indexing and only uses the first 10 items for deep judging
- `ReferenceDocumentSource` resolves the full document for both operations
- `ReferenceListSource` resolves and joins the full list for indexing and only consumes the first 10 items for deep judging

## Files

- `document.ts`
- `list.ts`
- `reference-document.ts`
- `reference-list.ts`
- `index.ts`
