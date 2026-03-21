# examples

> Minimal entry points for trying Contextrie quickly.

## Intent

- show the smallest useful flows
- keep setup friction low
- mirror the public API shape

## Available

### [`demo`](./demo/README.md)

Small end-to-end example of the core flow:

- create 3 `DocumentSource` inputs
- run `IndexingAgent` to generate metadata
- run `JudgeAgent` to score relevance for the task
- run `ComposerAgent` to produce the final context

Use this example to see the actual runtime behavior and console output for a minimal Contextrie pipeline.

### [`parsers`](./parsers/README.md)

Standalone parser example package using the published `@contextrie/parsers` package.

It shows:

- short CSV parsed as `DocumentSource`
- longer CSV parsed as `ListSource`
- markdown and text fixtures parsed from local files
