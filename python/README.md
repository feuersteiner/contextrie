# contextrie

Dynamic context curation for long-running agent work, packaged as Contextrie's Python core library.

This package mirrors the TypeScript `@contextrie/core` surface:

- source contracts and metadata types
- document, list, reference, and complex-document sources
- indexing, judging, and composing agents

It intentionally excludes parsing, crawling, filesystem IO, and storage.

## Install

```bash
cd python
python -m pip install -e .
```

## Model contract

Agents accept any model adapter that implements:

```python
async def generate_object(*, prompt: str, schema: type[T]) -> T | dict: ...
```

Return either:

- an instance of the requested dataclass schema
- a `dict` matching that schema

## Quick example

```python
import asyncio

from contextrie import ComposerAgent, DocumentSource, IndexingAgent, JudgeAgent, JudgeTask


class DemoModel:
    async def generate_object(self, *, prompt: str, schema: type):
        if schema.__name__ == "Metadata":
            return {
                "title": "Architecture",
                "description": "Notes about indexing and context composition.",
                "keypoints": ["indexing", "judgment", "composition"],
            }
        if schema.__name__ == "JudgeDecision":
            return {"score": 0.9, "reason": "Directly relevant to the task."}
        return {
            "source_ids": ["architecture"],
            "context": "The architecture source explains how Contextrie indexes, judges, and composes context for downstream agent work.",
        }


async def main() -> None:
    model = DemoModel()
    sources = [
        DocumentSource(
            "architecture",
            None,
            "The indexing pipeline adds metadata to a source while preserving the underlying content for deep judgment.",
        )
    ]

    indexing = IndexingAgent(model)
    indexed = await indexing.add(sources).run()

    judge = JudgeAgent(model)
    judgments = await judge.from_sources(indexed).run(
        JudgeTask(objective="response", input="What matters for context composition?")
    )

    judged_sources = {
        source.id: {
            "source": source,
            "decision": judgments[source.id],
        }
        for source in indexed
    }

    composer = ComposerAgent(model)
    context = await composer.from_sources(judged_sources).run(
        JudgeTask(objective="response", input="What matters for context composition?")
    )

    print(context)


asyncio.run(main())
```

## Development

```bash
python -m pip install -e .[dev]
python -m pytest
```
