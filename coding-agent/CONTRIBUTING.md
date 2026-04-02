# Contributing

Keep it small, direct, and package-local.

- Prefer functional JS. Use arrow functions, not `function` declarations.
- Avoid helpers and abstraction until reuse is real.
- Keep `services/` focused on orchestration, one CLI capability per service.
- Keep shared shapes in `types/`.
- Keep generic filesystem and low-level utilities in `adapters/` or `lib/`.
- Keep task or prompt builders close to the service that uses them.
- Repeated values should become shared constants.
- Prefer explicit names over abbreviations. Use `workingDir`, not `cwd`.
- Preserve the harness contract: scaffold tasks, wrap prompts, delegate, validate. Do not add model-running behavior to v1.
- Keep command semantics simple and safe. Prefer idempotent behavior and do not mutate existing files unless the command explicitly owns that change.
- When behavior changes, update the relevant markdown docs in this directory.
