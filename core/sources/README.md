# sources

Indexed sources implementations built on `IndexedSourceBase`.

## Overview

- `DocumentSource`: indexed, in-memory single document (string content)
- `ListSource`: indexed, in-memory list of items (string[])
- `ReferenceDocumentSource`: indexed document resolved on demand
- `ReferenceListSource`: indexed list resolved on demand (async iterable)
- All expose metadata + `getContent` for retrieval

## Consumption

- Documents are single-string reads
- Lists can be streamed with `for await...of`

## Files

- document.ts `DocumentSource`
- list.ts `ListSource`
- reference-document.ts `ReferenceDocumentSource`
- reference-list.ts `ReferenceListSource`
- index.ts Barrel exports
