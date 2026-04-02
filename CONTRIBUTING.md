# Contributing

Keep changes small, direct, and package-scoped.

## Rules

- Work in the relevant package and follow its local `README.md` and `CONTRIBUTING.md`.
- Prefer simple code over abstraction. Add helpers only when reuse is real or readability clearly improves.
- Keep package boundaries intact:
  - `core`: minimal contracts and agents, avoid IO in the package surface
  - `parsers`: keep parser code small and direct
  - `python`: mirror `core` package boundaries where applicable
  - `coding-agent`: services orchestrate; shared types stay central; command-specific builders stay close to the service that uses them
- Update docs when behavior, structure, or commands change.

## Before You Open A PR

- Run the checks for the package you changed.
- Keep generated diffs tight and relevant.
- If you touched more than one package, validate each one separately.

## Package Notes

- `core/CONTRIBUTING.md`
- `parsers/CONTRIBUTING.md`
- `python/CONTRIBUTING.md`
- `coding-agent/CONTRIBUTING.md`
