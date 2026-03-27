from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import TypeAlias

from .._runtime import coerce_schema_instance, maybe_await
from ..types import IndexedSourceBase, StructuredModel
from .judge import JudgeDecision, JudgeTask

LOGGER = logging.getLogger(__name__)

DEFAULT_COMPOSER_PROMPT = """Compose a tight retrieval context for a task.

Return ONLY valid JSON with this exact shape:
{
  "source_ids": string[],
  "context": string
}

Rules:
- source_ids must list only source IDs from the provided candidates
- source_ids should include only the sources needed for the context
- context must be exactly one short markdown paragraph
- no heading
- no bullet list
- no code fences
- use only facts supported by the selected sources
- synthesize instead of enumerating
- mention source titles only when needed for clarity
- when a source path is provided and a file reference helps, you may include an inline markdown link
- keep the paragraph dense and relevant to the task"""

DEFAULT_TIGHTNESS_BY_OBJECTIVE = {
    "proof": 0.85,
    "response": 0.65,
    "other": 0.5,
}


@dataclass(slots=True)
class JudgedSource:
    source: IndexedSourceBase
    decision: JudgeDecision


ComposerSourceRecord: TypeAlias = dict[str, JudgedSource | dict[str, object]]


@dataclass(slots=True)
class ComposerOutput:
    source_ids: list[str]
    context: str

    def __post_init__(self) -> None:
        if not isinstance(self.source_ids, list):
            raise ValueError("ComposerOutput.source_ids must be a list")
        if not all(isinstance(source_id, str) and source_id for source_id in self.source_ids):
            raise ValueError("ComposerOutput.source_ids must contain non-empty strings")
        if not isinstance(self.context, str) or not self.context.strip():
            raise ValueError("ComposerOutput.context must be a non-empty string")


class ComposerAgent:
    def __init__(
        self,
        model: StructuredModel,
        prompt: str = DEFAULT_COMPOSER_PROMPT,
    ) -> None:
        self.model = model
        self.prompt = prompt
        self._queue: dict[str, JudgedSource] = {}
        self._tightness: float | None = None

    def from_sources(
        self,
        sources: ComposerSourceRecord | list[ComposerSourceRecord],
    ) -> "ComposerAgent":
        if isinstance(sources, list):
            for record in sources:
                self._queue.update(self._normalize_record(record))
            return self

        self._queue.update(self._normalize_record(sources))
        return self

    def with_tightness(self, tightness: float) -> "ComposerAgent":
        self._tightness = tightness
        return self

    def clear(self) -> "ComposerAgent":
        self._queue.clear()
        self._tightness = None
        return self

    def get_effective_tightness(self, task: JudgeTask) -> float:
        candidate = self._tightness if self._tightness is not None else DEFAULT_TIGHTNESS_BY_OBJECTIVE[task.objective]
        return max(0.0, min(1.0, candidate))

    def rank_sources(self) -> list[tuple[str, JudgedSource]]:
        return sorted(
            self._queue.items(),
            key=lambda item: (-item[1].decision.score, item[0]),
        )

    def get_markdown_link_target(self, source_path: str) -> str:
        normalized = source_path.replace("\\", "/")
        return normalized if Path(source_path).is_absolute() else f"../{normalized}"

    async def build_source_section(self, source_id: str, judged_source: JudgedSource) -> str | None:
        source = judged_source.source
        decision = judged_source.decision
        lines = [
            f"Source ID: {source_id}",
            f"Declared source ID: {source.id}",
            f"Source kind: {source.kind}",
            f"Judge score: {decision.score}",
            f"Judge reason: {decision.reason}",
        ]

        if source.path:
            lines.append(f"Source path: {source.path}")
            lines.append(f"Markdown link target: {self.get_markdown_link_target(source.path)}")

        if source.metadata is not None:
            lines.append(f"Source title: {source.metadata.title}")
            lines.append(f"Source description: {source.metadata.description}")
            lines.append("Source keypoints:")
            lines.extend(f"- {point}" for point in source.metadata.keypoints)
            return "\n".join(lines)

        content = (await source.build_deep_judge_input()).strip()
        if not content:
            return None

        lines.append("Source content:")
        lines.append(content)
        return "\n".join(lines)

    async def build_prompt(
        self,
        task: JudgeTask,
        tightness: float,
        selected_sources: list[tuple[str, JudgedSource]],
    ) -> str:
        source_sections = [
            await self.build_source_section(source_id, judged_source)
            for source_id, judged_source in selected_sources
        ]
        resolved_sections = [section for section in source_sections if section is not None]
        if not resolved_sections:
            raise RuntimeError("[ComposerAgent] no source material available to compose")

        return (
            f"{self.prompt}\n\n"
            f"Task objective: {task.objective}\n"
            f"Task input: {task.input}\n"
            f"Context tightness: {tightness}\n\n"
            f"Candidate sources:\n\n"
            + "\n\n".join(resolved_sections)
        )

    async def run(self, task: JudgeTask) -> str:
        if not self._queue:
            raise RuntimeError("[ComposerAgent] cannot compose without judged sources")

        LOGGER.info("[ComposerAgent] composing context from %s source(s)", len(self._queue))
        try:
            ranked_sources = self.rank_sources()
            payload = await maybe_await(
                self.model.generate_object(
                    prompt=await self.build_prompt(
                        task,
                        self.get_effective_tightness(task),
                        ranked_sources,
                    ),
                    schema=ComposerOutput,
                )
            )
            output = coerce_schema_instance(ComposerOutput, payload)
            available_source_ids = {source_id for source_id, _ in ranked_sources}
            selected_source_ids = [
                source_id for source_id in output.source_ids if source_id in available_source_ids
            ]
            if not selected_source_ids:
                raise RuntimeError("[ComposerAgent] composer did not select any valid source IDs")
            return output.context.strip()
        finally:
            self.clear()

    def _normalize_record(self, record: ComposerSourceRecord) -> dict[str, JudgedSource]:
        normalized: dict[str, JudgedSource] = {}
        for source_id, payload in record.items():
            if isinstance(payload, JudgedSource):
                normalized[source_id] = payload
                continue
            if not isinstance(payload, dict):
                raise TypeError("Composer source records must contain JudgedSource or dict payloads")
            source = payload.get("source")
            decision = payload.get("decision")
            if not isinstance(source, IndexedSourceBase):
                raise TypeError("Composer source record payload is missing a valid source")
            normalized[source_id] = JudgedSource(
                source=source,
                decision=coerce_schema_instance(JudgeDecision, decision),
            )
        return normalized
