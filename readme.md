# Contextrie

<p align="center">
  <a href="https://flintworks.dev/blog/engineering/humans-managed-deep-contexts-agents-are-not-different" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Manifesto-Read-blue" alt="Manifesto"></a>
  <a href="https://www.youtube.com/watch?v=G0_LVAIyRWI" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/YouTube-Demo-red?logo=youtube&logoColor=white" alt="YouTube Demo"></a>
  <a href="https://www.npmjs.com/package/@contextrie/core" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/%40contextrie%2Fcore?label=npm&logo=npm" alt="npm package"></a>
  <a href="https://discord.gg/ayX9hm4D" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Discord-Join_Chat-5865F2?logo=discord&logoColor=white" alt="Discord"></a>
</p>

![Contextrie header](./assets/github-header.png)

<p align="center">
  <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

<p align="center"><strong>Dynamic context curation for long-running agent work.</strong></p>

AI agents get worse as irrelevant context piles up. Contextrie helps you select, index, judge, and compose the right context for each task so long-running agent systems stay sharp.

Contextrie is a context-engineering toolkit for agent workflows. Published packages now include `@contextrie/core` and `@contextrie/parsers`.

---

## Start Here

Install the packages:

```bash
npm install @contextrie/core @contextrie/parsers
```

Extremely brief how to:

```ts
import { openai } from "@ai-sdk/openai";
import {
  ComposerAgent,
  DocumentSource,
  IndexingAgent,
  JudgeAgent,
} from "@contextrie/core";

const model = openai("gpt-5.4");
const objective = "response";
const task = "Explain which internal docs matter most when debugging why retrieval is missing indexed metadata.";
const source = new DocumentSource(
  "indexing-architecture",
  undefined,
  "Indexed sources store generated metadata separately from source content, and shallow judgment relies on that metadata for fast relevance scoring.",
);
const indexed = await new IndexingAgent(model).add(source).run();
const judgments = await new JudgeAgent(model).from(indexed).run({
  objective,
  input: task,
});
const context = await new ComposerAgent(model)
  .from(
    Object.fromEntries(
      indexed.map((item) => [item.id, { source: item, decision: judgments[item.id] }]),
    ),
  )
  .run({
    objective,
    input: task,
  });

console.log(context);
```

---

## What This Is

Contextrie is for systems where agents should not see everything all the time.

It gives you primitives to:

- define sources around the content you want to retrieve
- generate metadata for those sources
- score relevance against a task
- compose a tighter working context for the next agent step

---

## Why It Exists

Most agent systems fail gradually, not instantly. They accumulate irrelevant context, lose precision, and waste tokens. Contextrie makes context selection a first-class part of the system instead of an afterthought.

---

## Packages

- `@contextrie/core`: published now, TypeScript contracts and core agents
- `@contextrie/parsers`: published now, file parsers for `.csv`, `.md`, and `.txt`
- `benchmarks`: benchmark definitions and protocol for evaluating agent workflows
- `docs`: documentation site in progress
- `cli`: planned
- `python`: planned

---

## Examples

Runnable examples are available in [`examples/`](./examples/README.md).

Start with [`examples/demo/README.md`](./examples/demo/README.md) for the smallest end-to-end flow:

- index a few sources
- judge them against a task
- compose the final context output

Use [`examples/parsers/README.md`](./examples/parsers/README.md) for a standalone package example that consumes `@contextrie/parsers` and parses local files into Contextrie sources.

Benchmark planning lives in [`benchmarks/README.md`](./benchmarks/README.md).

---

## Roadmap 🚧

- Benchmark harness and eval protocol
- Python support
- Hosted docs site
- CLI binary distribution
- More examples and eval coverage

---

## Call To Action

- Install and try `@contextrie/core`
- Install and try `@contextrie/parsers`
- Read the manifesto
- Watch the demo
- Join the Discord
- Open an issue if you want a parser, adapter, or language target

---

## Repo Layout

```
.
├─ assets/        Visuals and branding
├─ benchmarks/    Benchmark protocol and future harness
├─ cli/           Bun CLI wrapper
├─ core/          TypeScript library (npm)
├─ docs/          SvelteKit documentation site
├─ examples/      Minimal examples
├─ python/        Python package (stub)
└─ README.md      Project overview
```

---

## Concepts

- Sources always carry underlying content
- A source without metadata is still draft
- `IndexingAgent` adds metadata to that source for retrieval and shallow judgment

State flow:

```mermaid
flowchart LR
  Source["Source (content, no metadata)"] --> IndexedSource["Source (content + metadata)"]
```

---

## Getting Started

Each package maintains its own development and contribution instructions. Start in the package README for the area you are working on.

For library usage, start with [`core/README.md`](core/README.md).
For evaluation work, start with [`benchmarks/README.md`](benchmarks/README.md).

---

## Status

Early development; expect breaking changes.
