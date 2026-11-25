# Repository guide

Contextrie is a repository librarian for agents: maintain descriptions of repository contents and find evidence. Agents supply judgment and suggest text. Read [README.md](README.md) and [issue #66](https://github.com/feuersteiner/contextrie/issues/66) for the design; the current name is `contextrie` and directory records use `.contextrie`.

## Layout

- `index.ts`: public runtime exports.
- `types.ts`: public types, currently an empty placeholder module.
- `src/index.ts`: the empty `Contextrie` main class.
- `src/catalog/`: ingestion and placement, descriptions and record maintenance, and change assessment.
- `src/search/`: smart-grep evidence through descriptions, terms, content, and recorded dependencies.
- `src/mirror/`: refresh generated sections while preserving handwritten text.
- `src/validate/`: check schema, duplicates, missing targets, and cycles.
- `src/loader/`: load and parse inputs.
- `cli/index.ts`: placeholder CLI entry point; no working CLI exists yet.

Feature directories currently contain empty command classes and type modules. Read [src/AGENTS.md](src/AGENTS.md) before changing source internals. Custom ignore settings are out of scope.

## Development

Use Bun and TypeScript. Install dependencies with `bun install`; `bun run index.ts` only loads the scaffold. Run `./node_modules/.bin/tsc --noEmit` for type checking and `git diff --check` before committing. No package scripts or tests exist yet.

Keep changes scoped to the requested work and keep README indexes aligned with the repository layout. Commit and push only when authorized.
