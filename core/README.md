# @contextrie/core

Dynamic context curation for long-running agent work, packaged as Contextrie's core TypeScript library.

This package is intentionally small. It gives you the building blocks for:

- defining indexed sources
- generating source metadata
- judging source relevance for a task
- composing a tight context from judged sources

It does not handle IO, parsing, crawling, or storage.

## Install

```bash
npm install @contextrie/core ai zod
```

```bash
pnpm add @contextrie/core ai zod
```

```bash
bun add @contextrie/core ai zod
```

## Runtime model

`@contextrie/core` is published as ESM TypeScript source.

Use it with:

- Bun
- a TypeScript-aware bundler/runtime
- applications already built around the Vercel AI SDK

If you need plain precompiled JavaScript output for direct Node consumption, build that in your app layer or add a package build step in this repo.

## What the package includes

- `IndexedSourceBase`: base contract for retrieval-ready sources
- `DocumentSource`, `ListSource`, `ReferenceDocumentSource`, `ReferenceListSource`: source implementations
- `IndexingAgent`: generates metadata from source content
- `JudgeAgent`: scores source relevance for a task
- `ComposerAgent`: condenses judged sources into a single context paragraph

## Quick example

```ts
import { openai } from "@ai-sdk/openai";
import {
  ComposerAgent,
  DocumentSource,
  IndexingAgent,
  JudgeAgent,
} from "@contextrie/core";

const model = openai("gpt-4.1-mini");

const sources = [
  new DocumentSource(
    "architecture",
    undefined,
    "The indexing pipeline adds metadata to a source while preserving the underlying content for deep judgment.",
  ),
  new DocumentSource(
    "roadmap",
    undefined,
    "Q2 focuses on packaging, npm release hygiene, and developer onboarding.",
  ),
];

const indexing = new IndexingAgent(model);
const indexed = await indexing.add(sources).run();

const judge = new JudgeAgent(model);
const judgments = await judge.from(indexed).run({
  objective: "response",
  input: "What matters for the first npm release?",
});

const judgedSources = Object.fromEntries(
  indexed.map((source) => [
    source.id,
    {
      source,
      decision: judgments[source.id],
    },
  ]),
);

const composer = new ComposerAgent(model);
const context = await composer.from(judgedSources).run({
  objective: "response",
  input: "What matters for the first npm release?",
});

console.log(context);
```

## Package boundaries

- no filesystem or network IO abstractions
- no parsing or source discovery
- no storage or persistence layer
- no framework-specific adapters

## API overview

### Sources

Sources inherit from `IndexedSourceBase` and must provide:

- `kind`
- `isIterable`
- `getContent()`
- `buildIndexInput()`
- `buildDeepJudgeInput()`

Metadata is optional at construction time. A source without metadata is treated as a draft source.

### Indexing

`IndexingAgent` turns draft sources into indexed sources by generating:

- `title`
- `description`
- `keypoints`

Indexing mutates the same source object by filling in `source.metadata`.

### Judgment

`JudgeAgent` scores sources against a task and returns:

- `score`: a number from `0` to `1`
- `reason`: a short factual justification

It supports both:

- shallow judgment from source metadata
- deep judgment from full source content

### Composition

`ComposerAgent` takes judged sources and returns one dense markdown paragraph suited for downstream context injection.

## Development

See `CONTRIBUTING.md`.
