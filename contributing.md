# Contributing

## Prerequisites

- [Bun](https://bun.sh) (latest)

## Setup

```bash
git clone https://github.com/your-username/contextrie.git
cd contextrie
bun install
```

## Development

```bash
bun run dev          # Run with hot reload
bun run format       # Format code with Prettier
bun run lint         # Run ESLint
bun run lint:fix     # Auto-fix lint issues
```

## Testing

```bash
bun test              # All tests
bun test cli          # Just CLI tests
```

Test files live alongside source files using the `*.test.ts` convention.

## Project Structure

```
contextrie/
├── core/           # The engine: ingest → assess → compose pipeline
│   ├── ingest/     # Data ingestion, source types
│   ├── assess/     # Evaluation and scoring for sources for each prompt
│   └── compose/    # Output generation, composing the context for the LLM
├── client/         # Public API (Contextrie class)
├── cli/            # Command-line interface
└── index.ts        # Library entry point
```

Types are colocated with their modules rather than centralized.

## Pull Requests

1. Fork the repo and create a branch from `main`
2. Run `bun run format` and `bun run lint` before committing
3. Keep PRs focused—one feature or fix per PR

## Status

Contextrie is in early development. The API is still taking shape, so expect breaking changes.

## Deprecation notice

The current API surface is being refactored as part of issue #39. Expect breaking changes and updated package boundaries.
