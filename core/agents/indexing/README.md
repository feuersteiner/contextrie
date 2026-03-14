# Indexing Agent

Indexing turns draft sources into indexed sources by generating retrieval metadata.

## Flow

```mermaid
flowchart LR
  DraftSource --> IndexingAgent[IndexingAgent]
  IndexingAgent --> IndexedSource

  classDef data fill:none,stroke:none,color:#555;
  class DraftSource,IndexedSource data;
```

## Contracts

- `IndexingAgent` queues `IndexedSourceBase` instances via `add()`.
- `run()` generates metadata for each queued source, assigns it to `source.metadata`, and returns only successful results.
- `generateMetadata()` calls `source.buildIndexInput()` and sends the result to the language model.
- `clear()` resets the internal queue.

## Notes

- The default prompt requires JSON with `title`, `description`, and `keypoints`.
- Source implementations own indexing input construction through `buildIndexInput()`.
- `run()` processes the queue concurrently with `Promise.all(...)`.
- Failures are logged and omitted from the returned result set.
- The queue is cleared after `run()`, including failure cases.
