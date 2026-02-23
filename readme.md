![Contextrie header](assets/github-header.png)

[![npm version](https://badge.fury.io/js/contextrie.svg)](https://badge.fury.io/js/contextrie)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/feuersteiner/contextrie/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/feuersteiner/contextrie/actions/workflows/pr-checks.yml)

# Contextrie

Context-aware memory for agentic workflows. Contextrie curates what each agent sees so tasks stay sharp from step one to step one thousand.

> [!TIP]
> **Get started quickly:** `bun add contextrie` — see [Quickstart](#quickstart) below
>
> [📖 Blog Post](https://flintworks.dev/blog/engineering/humans-managed-deep-contexts-agents-are-not-different) · [💬 Discord](https://discord.gg/ayX9hm4D)

## Quickstart

```bash
bun add contextrie
```

```typescript
import { Contextrie } from "contextrie";

const ctx = new Contextrie({
  ingester: { model },
  assessor: { model },
  compose: { model },
});

await ctx.ingest.file("./docs/contract.md").file("./docs/clauses.csv").run();

const assessment = await ctx.assess
  .task("Find clauses about SLA violations")
  .from(ctx.sources)
  .run();

const context = await ctx.compose
  .task("Find clauses about SLA violations")
  .from(assessment.rated)
  .density("balanced")
  .run();

console.log(context);
```

## Why Contextrie

Long-running agents accumulate noise. Contextrie keeps a working memory that evolves with the task, compressing and expanding sources so the right details are visible at the right time.

## How it works

Three-stage pipeline: **Ingest → Assess → Compose**.

- **Ingest** files and generate compact metadata (title, description, keypoints)
- **Assess** sources for relevance to each task (shallow or deep)
- **Compose** a task-specific context at the right density

Supported file types: `.md`, `.txt`, `.csv`.

## Key capabilities

- Compact metadata for fast relevance matching
- Task-scoped scoring with shallow and deep modes
- Context compression with density presets or numeric values
- Source lineage preserved for expansion later
- Designed for multi-step, agentic workflows

## Demo

See the end-to-end legal contract review example in `demo/README.md`.

## Roadmap (planned)

Planned features include organic memory (forgetfulness/remembrance), feedback-loop assembly, per-item assessment, and additional file types.

## Status

Contextrie is in early development. The core pipeline (Ingest → Assess → Compose) is functional, but the API is still taking shape.

## License

MIT
