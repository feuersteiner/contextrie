# demo

Small end-to-end Contextrie flow using three `DocumentSource` inputs.

The script:

- indexes the sources and generates metadata
- judges each source against a task
- composes the final context from the judged set

## Run

```bash
bun install
bun run index.ts
```

The demo expects:

- `KIMI_API_KEY`
- `KIMI_API_ENDPOINT`
- optional `KIMI_DEPLOYMENT_NAME` or `KIMI_MODEL_NAME`

## Expected Behavior

A successful run prints:

- indexing results with generated source metadata
- relevance scores for each source
- the composed context

Exact wording and scores depend on the configured model.

For parser-specific examples, see [`../parsers/README.md`](../parsers/README.md).
