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

## Project Structure

```
contextrie/
├── core/           # The engine: ingest → assess → compose pipeline
│   ├── ingest/     # Data ingestion, source types
│   ├── assess/     # Evaluation and scoring
│   └── compose/    # Output generation
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
