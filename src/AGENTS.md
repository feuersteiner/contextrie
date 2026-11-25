# Source guide

- `index.ts`: public runtime exports.
- `types.ts`: public type exports; empty until public types are needed.
- `src/index.ts`: the `Contextrie` main class, currently empty; not a barrel.
- `src/catalog/`: incoming placement, descriptions and record maintenance, and assessing change impacts.
- `src/search/`: smart-grep evidence through descriptions, terms, content, and recorded dependencies.
- `src/mirror/`: refresh generated `## Contextrie` sections while preserving handwritten text.
- `src/validate/`: check record shape, duplicates, missing targets, and cycles.
- `src/loader/`: read and parse inputs; the loading pipeline remains to be designed.

Each feature directory has an `index.ts` entry exporting its empty command class and owns its types in `types.ts`, which remains an empty placeholder module.
Dependencies and references are catalog data, not a separate feature. Custom ignore settings are out of scope.
Import another feature's runtime exports through its `index.ts` and its types through its `types.ts`, using explicit `.ts` extensions and `import type` for types.
Add shared primitives only when needed. Add `src/types.ts` only when dependency-free shared types are needed; it must not import from feature directories.
Keep public re-exports in `index.ts` and `types.ts`; source modules never import from these public entry points or re-export another feature's names.
