# types/source

Source primitives and base abstractions.

## Overview

- `SourceKind` enum defines the supported source shapes
- `SourceBase` provides a common contract for access and metadata
- Concrete sources implement either direct content or resolver-backed access

## Document vs List

- `DocumentSource` represents a single block of text
- `ListSource` represents multiple items and exposes them as an iterable

Each source takes a `getContent` function in its constructor so adapters decide how content is produced (direct value or resolver).

## Complex Documents

`ComplexDocumentSource` represents a document split into sections, each with its
own heading, content, and metadata arranged in a tree via the `DocumentSection`
interface. This lets the assessor and composer score and select individual
sections independently while still providing access to the full document text.

## Consumption

List sources are designed for streaming. Use `for await...of` to read items without loading all content into memory.

## Reference Sources

Reference sources exist for data that should not be loaded eagerly, such as
database rows, large files, or remote objects. Instead of storing content
directly, they provide a resolver that returns content on demand.

If you need to integrate a system (`SQL`, `S3`, vector `DB`), prefer building a small
adapter that returns `Reference[Document|List]Source` instances. This keeps IO out of core and
lets ingestion stay format-agnostic.

Example (DB-backed list):

```ts
const source = new ReferenceListSource("users", metadata, async function* () {
  const rows = await db.query("select email from users limit 100");
  for (const row of rows) {
    yield row.email;
  }
});
```

## Files

- base.ts `GeneratedMetadata`, `SourceKind`, `SourceBase`
- document.ts `DocumentSource` (string content)
- list.ts `ListSource` (iterable content)
- reference-document.ts Document resolver source
- reference-list.ts List resolver source
- complex-document.ts `DocumentSection`, `ComplexDocumentSource` (sectioned document)
- index.ts Barrel exports
