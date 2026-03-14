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

After a successful run, the console output looks like:

```text
[IndexingAgent] indexing 3 source(s)
[IndexingAgent] indexing source adapter-boundaries (document)
[IndexingAgent] indexing source composer-risk (document)
[IndexingAgent] indexing source eval-direction (document)
[IndexingAgent] indexed source composer-risk
[IndexingAgent] indexed source adapter-boundaries
[IndexingAgent] indexed source eval-direction
[IndexingAgent] completed indexing 3/3 source(s), failed: 0

[Indexing]
- composer-risk: Composer Output Lacks Source ID Provenance
- adapter-boundaries: Architectural Boundaries: Core Thinness and Adapter Responsibilities
- eval-direction: : 
[JudgeAgent] judging 3 source(s)
[JudgeAgent] starting shallow judgment for source composer-risk (document)
[JudgeAgent] starting shallow judgment for source adapter-boundaries (document)
[JudgeAgent] starting shallow judgment for source eval-direction (document)
[JudgeAgent] completed shallow judgment for source adapter-boundaries with score 0.9
[JudgeAgent] completed shallow judgment for source composer-risk with score 0
[JudgeAgent] completed shallow judgment for source eval-direction with score 0.9
[JudgeAgent] completed judging 3 source(s)

[Judge]
- composer-risk: 0.00 | The source discusses source ID preservation limitations in composer outputs for audit trails, which is unrelated to agent evaluation strategies or architectural decisions about core bloat.
- adapter-boundaries: 0.90 | Directly addresses preventing core bloat while evaluating agents by defining separation of concerns: core stays thin while adapters handle agent contracts, deep-judge input exposure, and external responsibilities. Specific mention of agent contracts being small/composable and sources exposing evaluation inputs (deep-judge) matches the evaluation requirement.
- eval-direction: 0.90 | Source provides agent evaluation guidelines emphasizing rubrics, score bands, and grounding validation over brittle exact string matching, directly supporting the design of robust yet lightweight evaluation frameworks that avoid bloat.
[ComposerAgent] composing context from 3 source(s)

[Composer]
Contextrie should maintain a thin core by delegating agent evaluation contracts and deep-judge input exposure to adapters, while implementing rubric-based validation with score bands and grounding checks rather than brittle exact string matching to keep evaluation logic lightweight and composable.
```

This shows the intended behavior clearly:

- indexing produces retrieval-oriented metadata
- judging scores each source against the task
- composing turns the highest-value judged material into one concise context output

For parser-specific examples, see [`../parsers/README.md`](../parsers/README.md).
