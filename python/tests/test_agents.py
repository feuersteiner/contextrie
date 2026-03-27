from __future__ import annotations

import asyncio

import pytest

from contextrie import (
    ComposerAgent,
    DocumentSource,
    IndexingAgent,
    JudgeAgent,
    JudgeTask,
    ListSource,
    Metadata,
)


class FakeModel:
    def __init__(self) -> None:
        self.prompts: list[tuple[str, type]] = []

    async def generate_object(self, *, prompt: str, schema: type):
        self.prompts.append((prompt, schema))
        if schema.__name__ == "Metadata":
            return {
                "title": "Generated title",
                "description": "Generated description.",
                "keypoints": ["first", "second", "third"],
            }
        if schema.__name__ == "JudgeDecision":
            return {"score": 0.75, "reason": "Matches the task."}
        if schema.__name__ == "ComposerOutput":
            return {
                "source_ids": ["architecture", "missing"],
                "context": "  The architecture source explains the indexing flow.  ",
            }
        raise AssertionError(f"Unexpected schema: {schema.__name__}")


def test_indexing_agent_assigns_metadata() -> None:
    agent = IndexingAgent(FakeModel())
    source = DocumentSource("architecture", None, "Indexing content")

    indexed = asyncio.run(agent.add(source).run())

    assert indexed == [source]
    assert source.metadata is not None
    assert source.metadata.title == "Generated title"


def test_judge_agent_handles_shallow_and_deep_sources() -> None:
    model = FakeModel()
    shallow = DocumentSource(
        "architecture",
        Metadata(
            title="Architecture",
            description="System design notes.",
            keypoints=["indexing", "judgment", "composition"],
        ),
        "Architecture content",
    )
    deep = ListSource("roadmap", None, ["alpha", "beta", "gamma"])

    results = asyncio.run(
        JudgeAgent(model)
        .from_sources(shallow)
        .from_deep(deep)
        .run(JudgeTask(objective="response", input="What matters?"))
    )

    assert results["architecture"].score == pytest.approx(0.75)
    assert results["roadmap"].reason == "Matches the task."
    prompt_text = "\n".join(prompt for prompt, _ in model.prompts)
    assert "Source title: Architecture" in prompt_text
    assert "Source content:\nalpha\nbeta\ngamma" in prompt_text


def test_composer_agent_returns_trimmed_context() -> None:
    model = FakeModel()
    source = DocumentSource(
        "architecture",
        Metadata(
            title="Architecture",
            description="System design notes.",
            keypoints=["indexing", "judgment", "composition"],
        ),
        "Architecture content",
        path="core/index.ts",
    )

    context = asyncio.run(
        ComposerAgent(model)
        .from_sources(
            {
                "architecture": {
                    "source": source,
                    "decision": {"score": 0.8, "reason": "Useful for the answer."},
                }
            }
        )
        .run(JudgeTask(objective="response", input="What matters?"))
    )

    assert context == "The architecture source explains the indexing flow."


def test_composer_agent_rejects_invalid_selected_source_ids() -> None:
    class InvalidComposerModel(FakeModel):
        async def generate_object(self, *, prompt: str, schema: type):
            if schema.__name__ == "ComposerOutput":
                return {"source_ids": ["missing"], "context": "Invalid"}
            return await super().generate_object(prompt=prompt, schema=schema)

    source = DocumentSource(
        "architecture",
        Metadata(
            title="Architecture",
            description="System design notes.",
            keypoints=["indexing", "judgment", "composition"],
        ),
        "Architecture content",
    )

    with pytest.raises(RuntimeError, match="did not select any valid source IDs"):
        asyncio.run(
            ComposerAgent(InvalidComposerModel())
            .from_sources(
                {
                    "architecture": {
                        "source": source,
                        "decision": {"score": 0.8, "reason": "Useful for the answer."},
                    }
                }
            )
            .run(JudgeTask(objective="response", input="What matters?"))
        )
