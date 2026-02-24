# Rewrite Plan (Monorepo Reset)

## Goals

- Keep a short leash on the codebase
- Make ingestion composable and format-agnostic
- Treat parsers as the only place for IO/format logic
- Delete existing code and restart clean
- Ship as an npm package (Bun)
- Add a Python package (pip)
- Build docs site with SvelteKit

## Repo Structure

- packages/core/ # TS library (npm)
- packages/cli/ # Bun CLI wrapper
- packages/docs/ # SvelteKit docs
- packages/python/ # Python package (stub initially)
- examples/ # Minimal examples
- scripts/ # Build/release helpers
- config/ # Shared config (tsconfig/eslint/prettier)

### Documentation Layout

- Root README.md describes the monorepo, build/publish flow, and high-level architecture
- Each package has its own README.md with:
  - Purpose and public API
  - Architecture notes (modules, contracts, boundaries)
  - Local dev/run instructions
  - Release/publish notes (if applicable)

## Core Concepts

- Parser: converts raw input into RawSource
- Ingester: validates RawSource and indexes it via the Indexer
- Indexer: LLM agent that generates metadata during ingest.run()

## Contracts

### RawSource (from parsers)

- kind: "document" | "list" | "collection"
- payload: string | string[] | Record<string, unknown>[]
- origin: Origin (required)

### Source (from ingester after indexing)

- id: string
- kind: "document" | "list" | "collection"
- content: normalized payload
- origin: Origin (passthrough)
- metadata:
  - title: string
  - description: string
  - keypoints: string[]

### Origin

- type: string
- id?: string
- path?: string
- uri?: string
- meta?: Record<string, unknown>

## Interfaces

### Parser

- parse(input): RawSource[]

### Indexer

- index(raw: RawSource): Promise<{ title; description; keypoints }>

### Ingester

- raw(raw: RawSource | RawSource[]): this (queues)
- run(): Promise<Source[]>

## Parser Builder Helpers

- createParser({ name, parse }): RawSource
- fileParser({ extensions, parseFile }): RawSource
- jsonParser({ toCollection }): RawSource

## Ingestion Flow

1. Parser parses input -> RawSource
2. Ingester queues RawSource
3. ingest.run() calls Indexer to create metadata
4. Ingester returns Source[] with id + metadata

## Class API (kept)

- ctx.ingest.from(input).run()
- ctx.assess.task(...).from(...).run()
- ctx.compose.task(...).from(...).run()

## Prune Targets

- Remove format parsing from core ingester
- Remove old metadata generation logic (replace with Indexer)
- Remove unused demo/formatters tied to old metadata flow

## Assessor Refactor (First/Last Pass)

### Goals

- Allow optional custom scoring hooks without replacing the model
- Keep API surface minimal and configurable at instantiation

### Contracts

- firstPass(source: Source): number | null
  - Optional pre-filter/scoring step
  - Return null to drop the source; number seeds/overrides score for filtering
- lastPass(rated: RatedSource): RatedSource
  - Optional post-processing to adjust relevance/reasoning

### Flow

1. firstPass runs per source (optional)
2. Sources are filtered/ordered based on firstPass output
3. Model assessor scores remaining sources
4. lastPass runs per rated source (optional)

### Config

- AssessorConfig accepts optional firstPass and lastPass hooks
