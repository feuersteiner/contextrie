# types

Core contracts shared by sources and agents.

## Layout

- `source.ts` Metadata and indexed source base contract
- `index.ts` Barrel exports

## Exports

- `Metadata`
- `IndexedSourceBase`

## `Metadata`

Generated indexing metadata used for shallow relevance checks.

- `title`
- `description`
- `keypoints`

## `IndexedSourceBase`

Base class for all source implementations.

- `id` is the stable source identifier
- `metadata` is optional; missing metadata means the source is still draft
- `kind` is the source discriminator implemented by concrete classes
- `isIterable` indicates whether the source behaves like a list/stream
- `getContent()` returns the underlying source payload or lazy resolver output
- `buildIndexInput()` returns the string used by `IndexingAgent`
- `buildDeepJudgeInput()` returns the string used by deep `JudgeAgent` runs

Concrete source classes in `core/sources` decide how content is exposed and how
indexing/deep-judge input strings are constructed.
