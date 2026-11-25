# contextrie

Repo librarian for agents: maintain descriptions of repository contents and find evidence. Agents supply judgment and suggest text.

## Specification

[Issue #66 — Contextree v2](https://github.com/feuersteiner/contextrie/issues/66) describes the new design. The name remains **contextrie**, and directory records use **`.contextrie`**, overriding the older spelling in the issue.

### Record format — awaiting review

The agreed design below is documented for review; record handling is not implemented.

Each directory owns its metadata in a `.contextrie` record: `purpose` describes the directory, with optional `terms` and `references`. Each path has one authoritative metadata location.

`entries` covers immediate children. File metadata belongs in the containing directory's record, as either a plain description string or an object with `description`, optional `terms`, and optional `references`. Directory entries are bare relative child names ending in `/`; they point to the child's `.contextrie` without duplicating its metadata.

A reference has a repository-rooted file or directory `path` and optional `why`. Directory references belong at the record's top level; file references belong inside the file entry. References are catalog data, not a separate command.

Example repository-root `.contextrie`:

```yaml
purpose: Repository librarian for agents.
entries:
  - README.md: Project overview and development instructions.
  - src/
mirror:
  - AGENTS.md: true
  - README.md: true
ignore:
  - */**/*.mjs
```

`mirror` and `ignore` settings belong only in the root record.

Example `/src/.contextrie`:

```yaml
purpose: Implementation scaffold for repository librarian operations.
terms: [catalog, search]
references:
  - path: /README.md
    why: Describes the planned behavior and current implementation status.
entries:
  - index.ts:
      description: Empty Contextrie main class.
      terms: [api, entrypoint]
      references:
        - path: /README.md
          why: Documents the main class and runtime entry point.
  - catalog/
```

Shared TypeScript types in `src/types.ts` are the next proposed step after review; they have not been implemented.

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
