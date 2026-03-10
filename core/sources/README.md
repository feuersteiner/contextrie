# sources

Indexed sources implementations built on `IndexedSourceBase`.

## Overview

- `DocumentSource`: in-memory single document (`string`)
- `ListSource`: in-memory list of items (`string[]`)
- `ReferenceDocumentSource`: document resolved on demand
- `ReferenceListSource`: async list resolved on demand (`AsyncIterable<string>`)
- All support draft sources with optional metadata
- All implement `buildIndexInput()` for the indexing agent

## Consumption

- Documents are single-string reads
- `ListSource#getContent()` returns `string[]`
- `ReferenceListSource#getContent()` can be consumed with `for await...of`

## Files

- document.ts `DocumentSource`
- list.ts `ListSource`
- reference-document.ts `ReferenceDocumentSource`
- reference-list.ts `ReferenceListSource`
- index.ts Barrel exports
