# core

TypeScript core library for Contextrie. Defines the ingestion contracts and source primitives used across the system.

## Purpose

Core is intentionally thin: it only defines types and contracts. IO, parsing, and format handling belong in adapters or higher-level packages.

## Structure

- types/ Contracts for sources, raw inputs, and ingest interfaces
- ingest/ Markdown parsing and ingestion strategies (flat-map, map-reduce)

## Boundaries

- No IO in core
- Markdown section parsing lives in ingest/; other format adapters belong in higher-level packages
- Keep types small and composable

## Development

See `CONTRIBUTING.md` for local setup, scripts, and conventions.
