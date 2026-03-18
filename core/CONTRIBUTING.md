# Contributing (core)

Lightweight package, strict boundaries.

## Setup

```bash
bun install
```

---

## Development

```bash
bun run typecheck
bun run format
```

---

## Notes

- Types live under `core/types`; agent contracts live under `core/agents`
- Keep contracts minimal and avoid IO here
- After changes, update relevant docs to keep them in sync
