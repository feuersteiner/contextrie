# contextrie-cli

Node CLI for indexing local sources and composing task-specific context with Contextrie.

The CLI writes its working files under `.contextrie/` in the current project:

- `config.json`: saved model/provider configuration
- `sources.json`: indexed source manifest
- `context.md`: composed context for the current task

## Quickstart

Install globally with npm:

```bash
npm install -g contextrie-cli
```

Then run:

```bash
contextrie --index --all --openai-api-key "$OPENAI_API_KEY" --openai-base-url "$OPENAI_BASE_URL" --openai-model "gpt-5.4"
contextrie --task "Summarize the files most relevant to parser source path handling."
```

For local development with Bun:

```bash
bun install
bun run ./index.ts --index --all --openai-api-key "$OPENAI_API_KEY" --openai-model "gpt-5.4"
bun run ./index.ts --task "Summarize the files most relevant to parser source path handling."
```

Use `--openai-base-url` as well if you are targeting an OpenAI-compatible provider.

For the standalone macOS arm64 binary, use the separate compiled artifact and Homebrew flow. That is distinct from the npm `bin` entrypoint.

## Usage

```bash
bun run ./index.ts --help
```

```text
Usage
  $ contextrie --index [paths...]
  $ contextrie --task "describe the task"
```

## Index sources

Index explicit files, directories, or globs:

```bash
bun run ./index.ts --index README.md core parsers
```

Index all supported source files in the current repository:

```bash
bun run ./index.ts --index --all
```

Supported files are filtered through `@contextrie/parsers`, and indexed metadata is written to `.contextrie/sources.json`.

## Compose task context

After indexing, compose a task-specific context bundle:

```bash
bun run ./index.ts --task "Explain which files matter most for the CLI indexing flow."
```

This writes the final output to `.contextrie/context.md`.

## Configuration

The CLI resolves configuration from:

1. command flags
2. `.contextrie/config.json`
3. environment variables

Required:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Optional:

- `OPENAI_BASE_URL`

## Status

Early development; expect breaking changes.
