# types

Core contracts for Contextrie.

## Layout

- source/ Source kinds and base abstractions
- raw.ts Raw ingestion payloads and origin
- ingest.ts Parser/Indexer/Ingester interfaces
- index.ts Barrel exports

## Raw Inputs (raw.ts)

Raw sources are the output of parsers. They preserve origin and the minimal payload needed to build a source. Raw inputs stay format-agnostic so ingest can be reused across adapters.

## Ingest Interfaces (ingest.ts)

- Parser: converts arbitrary input into RawSource[]
- Indexer: turns RawSource into metadata (title/description/keypoints)
- Ingester: queues raw inputs and produces Sources

These interfaces keep ingest composable and allow pluggable adapters without coupling to formats or IO.

## Source Primitives (source/)

Source types define how content is accessed. They may be direct (in-memory) or reference-backed (resolver).
