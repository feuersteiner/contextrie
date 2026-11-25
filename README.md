# contextrie

Repo librarian for agents: maintain descriptions of repository contents and find evidence. Agents supply judgment and suggest text.

## Specification

[Issue #66 — Contextree v2](https://github.com/feuersteiner/contextrie/issues/66) describes the new design. The name remains **contextrie**, and directory records use **`.contextrie`**, overriding the older spelling in the issue.

The planned model is a version-controlled record in each directory:

- `purpose` describes the directory.
- `entries` describes its immediate files and subdirectories.
- Optional terms help retrieval; references record dependencies between paths.
- Root settings control generated sections in `AGENTS.md` and `README.md`.

## Status

Early v1 scaffold on the `v1` branch. `Contextrie` is currently an empty class; record handling and librarian capabilities are not implemented. The five module directories are agreed: catalog, search, mirror, validate, and loader.

## Development

Requires Bun. Install dependencies:

```bash
bun install
```

Load the current scaffold:

```bash
bun run index.ts
```

This only loads the exported class; there is no CLI yet.

Runtime exports live in `index.ts`, public types in `types.ts`, and implementation in `src/`.
