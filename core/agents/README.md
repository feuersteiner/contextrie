# agents

Core language-model agents built on top of sources and types.

## Available Agents

- `indexing/` generates `Metadata` for sources that do not have it yet
- `judge/` scores source relevance for a task
- `composer/` exists in the module surface but currently has no implementation

## Shared Patterns

- Agents operate on `IndexedSourceBase`
- Agents keep internal queues and expose fluent methods
- Agent prompts default to strict JSON output contracts
- Source classes control their own indexing and deep-judge input strings

## Exports

- `index.ts` re-exports `judge` and `indexing`

## Notes

- `indexing/README.md` documents metadata generation
- `judge/README.md` documents shallow and deep relevance scoring
- `composer/index.ts` is currently empty and has no runtime behavior to document
