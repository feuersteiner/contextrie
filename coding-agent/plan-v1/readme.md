# Coding Harness Plan v1

Contextrie coding agent harness is a knowledge layer on top of your repo that helps you (and agents) structure work, capture context, and keep a record of decisions and work history. This is the first version of the harness, focused on task scaffolding, delegation, and validation.

## Goal

Ship a repo-native CLI that scaffolds task files, delegates planning and work to external coding agents, and validates task quality in CI.

## Boundaries

- The CLI owns scaffolding, prompt wrapping, delegation, and validation.
- Agents own filling and iterating on task content.
- v1 has no sprint model.
- v1 does not run models directly.
- v1 delegates to agents via a generated prompt.

## Repository Contract

```text
/TASKS/
  T00A9Qz-add-login-flow.md

/AGENTS/
  qa.md
  planner.md
  executor.md

/progress.md
```

Notes:

- `TASKS` stores the task files managed by the harness.
- `AGENTS` is reserved for agent-specific prompt/config files.
- `progress.md` is lightweight repo working memory, it is meant to be edited throughout the task, then reverted back to an empty slate for the next task.

## Task Lifecycle

`draft -> todo -> doing -> done`

- `draft`: scaffold exists, but the task is not yet validated as ready.
- `todo`: planned and validated.
- `doing`: execution is in progress.
- `done`: work and QA are complete.

## Task File Contract

Each task is a Markdown file with YAML frontmatter.

Example at [`TASKS/T00A9Qz-add-login-flow.md`](./TASKS/T00A9Qz-add-login-flow.md).

## Validation Contract

`task validate <taskId>` checks:

- schema completeness
- unique task id
- filename slug matches the task title slug
- required sections exist
- timestamps exist and parse as ISO timestamps

Rules:

- Optional fields may be missing or empty.
- Validation is read-only by default.
- `--fix` may apply safe fixes and promote `draft -> todo` when the task is valid.
- `--verbose` returns actionable findings meant to be fed back to the agent.

## CLI Surface

### `init`

Creates:

- `TASKS/`
- `AGENTS/`
- `progress.md`

### `task create "<brief>" [--title "<title>"]`

Creates a draft task scaffold.

Rules:

- The quoted value is the source brief.
- `--title` overrides the derived title.
- Without `--title`, the CLI derives a short title from the first words of the brief.
- The scaffold contains frontmatter plus the required empty sections.
- `Source Prompt` is populated from the user brief.

### `task delegate <mode> <taskId> --agent <agent> "<user prompt>"`

Delegates a task to an external agent.

Modes:

- `plan`
- `execute`
- `qa`

Agents:

- `codex`
- `opencode`
- `claudecode`

Rules:

- The CLI generates the full delegation prompt.
- The generated prompt wraps the task file, harness instructions, validation command, and the user prompt.
- On success, the CLI writes `agent` and `agentSessionId` into frontmatter.
- On failure, the task file is kept and the failure is recorded for follow-up.

### `task validate <taskId> [--fix] [--verbose]`

Validates a task file against the contract.

### `task list`

Lists tasks known to the harness.

### `task iterate <taskId> "<prompt>" --agent <agent>`

Sends a follow-up iteration prompt for an existing task.

Rules:

- Used when the user is not satisfied with the previous result.
- Reuses the task file as the source of truth.

### `task delete <taskId>`

Deletes a task file.
