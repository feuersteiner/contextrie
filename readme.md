# Contextrie

<p align="center">
  <a href="https://flintworks.dev/blog/engineering/humans-managed-deep-contexts-agents-are-not-different" target="_blank"><img src="https://img.shields.io/badge/Manifesto-Read-blue" alt="Manifesto"></a>
  <a href="https://www.youtube.com/watch?v=G0_LVAIyRWI" target="_blank"><img src="https://img.shields.io/badge/YouTube-Demo-red?logo=youtube&logoColor=white" alt="YouTube Demo"></a>
  <a href="https://discord.gg/ayX9hm4D" target="_blank"><img src="https://img.shields.io/badge/Discord-Join_Chat-5865F2?logo=discord&logoColor=white" alt="Discord"></a>
</p>

![Contextrie header](assets/github-header.png)

<p align="center">
  <a href="https://opensource.org/licenses/MIT" target="_blank"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

AI agents lose accuracy and reasoning ability as they accumulate irrelevant context over long-running tasks. Contextrie dynamically curates what each agent sees, keeping it sharp from task one to task one thousand.

## Repo Layout

```
.
├─ assets/        Visuals and branding
├─ cli/           Bun CLI wrapper
├─ core/          TypeScript library (npm)
├─ docs/          SvelteKit documentation site
├─ examples/      Minimal examples
├─ python/        Python package (stub)
└─ README.md      Project overview
```

## Concepts

- Parser: converts raw input into `RawSource`
- Ingester: validates `RawSource` and indexes it via the Indexer
- Indexer: generates metadata during `ingest.run()`

## API Shape

- `ctx.ingest.from(input).run()`
- `ctx.assess.task(...).from(...).run()`
- `ctx.compose.task(...).from(...).run()`

## Getting Started

Each package maintains its own development and contribution instructions. Start in the package README for the area you are working on.

## Status

Early development; expect breaking changes.
