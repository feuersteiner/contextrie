# Book Ingestion Demo

Demonstrates map-reduce ingestion of a large document using `ComplexDocumentSource`. A markdown document is split into sections by heading hierarchy, metadata is generated bottom-up (map leaves, reduce parents), and the result is a single source with independently-scorable sections.

## Prerequisites

- [Bun](https://bun.sh) runtime
- Python 3.9+ (for the conversion step, optional)

## Setup

### 1. Get a markdown document

Either provide your own `book.md` or use the included converter:

```bash
cd demo/book-ingestion
pip install -r requirements.txt
python convert.py
```

This downloads *The Art of War* from Project Gutenberg and converts it to `book.md`.

### 2. Run the demo

```bash
bun demo/book-ingestion/demo.ts
```

No API keys needed — the demo uses a heuristic indexer by default.

## How it works

```
book.md
  │
  ▼
parseMarkdownSections()     ← parse into a heading-based section tree
  │
  ▼
mapReduceSections()          ← walk tree bottom-up
  ├─ leaf sections  → map()    generate metadata independently
  └─ parent sections → reduce() roll up children metadata
  │
  ▼
ComplexDocumentSource        ← single source, sections scored independently
```

### Map phase

Each leaf section (no children) gets its own `GeneratedMetadata` by calling the `map` function. With the built-in heuristic this extracts the first few sentences. Swap in an LLM-backed implementation for production quality — see the commented example in `demo.ts`.

### Reduce phase

Each internal section (has children) gets metadata by calling `reduce` with its children's metadata. This rolls up summaries and keypoints so the assessor can score at any level of the hierarchy.

### Concurrency

The `concurrency` parameter caps how many map/reduce calls run in parallel. Set this to match your LLM provider's rate limit (default: 8 in the demo).

## Using an LLM

See the commented block in `demo.ts` for a Vercel AI SDK + Azure OpenAI example. The only change needed is providing `MapFn` and `ReduceFn` implementations that call your model.
