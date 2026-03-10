# types

Core contracts for Contextrie.

## Layout

- source.ts Source kinds and ingestion/indexing contracts
- index.ts Barrel exports

## Source Pipeline (source.ts)

```mermaid
flowchart LR
  RawSource --> DraftSource --> IndexedSource
```

- RawSource: strings, arrays, or lazy/async providers
- DraftSource: normalized envelope (kind + payload + origin)
- IndexedSourceBase: metadata + content accessor for retrieval

## Indexed Sources (`source.ts`)

- `IndexedSourceBase` is draft when `metadata` is missing
- `getContent()` returns the retrieval payload or lazy provider
- `buildIndexInput()` returns the string fed into the indexing agent
- Concrete source classes define their own string `kind`
