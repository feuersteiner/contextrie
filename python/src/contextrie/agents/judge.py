from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import Literal, TypeAlias

from .._runtime import coerce_schema_instance, maybe_await
from ..types import IndexedSourceBase, StructuredModel

LOGGER = logging.getLogger(__name__)

DEFAULT_JUDGE_PROMPT = """Judge source relevance for a task.

Return ONLY valid JSON with this exact shape:
{
  "score": number,
  "reason": string
}

Rules:
- score must be between 0 and 1
- reason must be concise and factual
- use only the provided task and source information
- no markdown, no code fences, no extra keys"""

JudgeObjective: TypeAlias = Literal["response", "proof", "other"]

JUDGE_TASK_PROMPTS: dict[JudgeObjective, str] = {
    "response": "Judge whether this source is useful for producing a direct, high-quality response to the input.",
    "proof": "Judge whether this source materially supports, verifies, or grounds the input with evidence.",
    "other": "Judge whether this source is meaningfully relevant to the input and objective.",
}


@dataclass(slots=True)
class JudgeTask:
    objective: JudgeObjective
    input: str

    def __post_init__(self) -> None:
        if self.objective not in JUDGE_TASK_PROMPTS:
            raise ValueError(f"Unsupported objective: {self.objective!r}")
        if not isinstance(self.input, str) or not self.input.strip():
            raise ValueError("JudgeTask.input must be a non-empty string")


@dataclass(slots=True)
class JudgeDecision:
    score: float
    reason: str

    def __post_init__(self) -> None:
        if not isinstance(self.score, (int, float)) or not 0 <= float(self.score) <= 1:
            raise ValueError("JudgeDecision.score must be between 0 and 1")
        self.score = float(self.score)
        if not isinstance(self.reason, str) or not self.reason.strip():
            raise ValueError("JudgeDecision.reason must be a non-empty string")


JudgeResults: TypeAlias = dict[str, JudgeDecision]


class JudgeAgent:
    def __init__(
        self,
        model: StructuredModel,
        prompt: str = DEFAULT_JUDGE_PROMPT,
    ) -> None:
        self.model = model
        self.prompt = prompt
        self._queue: list[IndexedSourceBase] = []
        self._deep_queue: list[IndexedSourceBase] = []

    def from_sources(self, source: IndexedSourceBase | list[IndexedSourceBase]) -> "JudgeAgent":
        if isinstance(source, list):
            self._queue.extend(source)
        else:
            self._queue.append(source)
        return self

    def from_deep(self, source: IndexedSourceBase | list[IndexedSourceBase]) -> "JudgeAgent":
        if isinstance(source, list):
            self._deep_queue.extend(source)
        else:
            self._deep_queue.append(source)
        return self

    def deep(self) -> "JudgeAgent":
        self._deep_queue.extend(self._queue)
        self._queue.clear()
        return self

    def clear(self) -> "JudgeAgent":
        self._queue.clear()
        self._deep_queue.clear()
        return self

    def build_shallow_prompt(self, task: JudgeTask, source: IndexedSourceBase) -> str:
        if source.metadata is None:
            raise ValueError(f"[JudgeAgent] shallow source {source.id} is missing metadata")

        metadata = source.metadata
        keypoints = "\n".join(f"- {point}" for point in metadata.keypoints)
        return (
            f"{self.prompt}\n\n"
            f"Task objective: {task.objective}\n"
            f"Task input: {task.input}\n"
            f"Task guidance: {JUDGE_TASK_PROMPTS[task.objective]}\n\n"
            f"Source ID: {source.id}\n"
            f"Source kind: {source.kind}\n"
            f"Source title: {metadata.title}\n"
            f"Source description: {metadata.description}\n"
            f"Source keypoints:\n{keypoints}"
        )

    async def build_deep_prompt(self, task: JudgeTask, source: IndexedSourceBase) -> str:
        content = await source.build_deep_judge_input()
        return (
            f"{self.prompt}\n\n"
            f"Task objective: {task.objective}\n"
            f"Task input: {task.input}\n"
            f"Task guidance: {JUDGE_TASK_PROMPTS[task.objective]}\n\n"
            f"Source ID: {source.id}\n"
            f"Source kind: {source.kind}\n\n"
            f"Source content:\n{content}"
        )

    async def judge_shallow_source(self, task: JudgeTask, source: IndexedSourceBase) -> JudgeDecision:
        LOGGER.info("[JudgeAgent] starting shallow judgment for source %s (%s)", source.id, source.kind)
        payload = await maybe_await(
            self.model.generate_object(
                prompt=self.build_shallow_prompt(task, source),
                schema=JudgeDecision,
            )
        )
        decision = coerce_schema_instance(JudgeDecision, payload)
        LOGGER.info(
            "[JudgeAgent] completed shallow judgment for source %s with score %s",
            source.id,
            decision.score,
        )
        return decision

    async def judge_deep_source(self, task: JudgeTask, source: IndexedSourceBase) -> JudgeDecision:
        LOGGER.info("[JudgeAgent] starting deep judgment for source %s (%s)", source.id, source.kind)
        payload = await maybe_await(
            self.model.generate_object(
                prompt=await self.build_deep_prompt(task, source),
                schema=JudgeDecision,
            )
        )
        decision = coerce_schema_instance(JudgeDecision, payload)
        LOGGER.info(
            "[JudgeAgent] completed deep judgment for source %s with score %s",
            source.id,
            decision.score,
        )
        return decision

    async def run(self, task: JudgeTask) -> JudgeResults:
        total_count = len(self._queue) + len(self._deep_queue)
        results: JudgeResults = {}
        failures: list[IndexedSourceBase] = []

        async def judge_shallow(source: IndexedSourceBase) -> None:
            try:
                results[source.id] = await self.judge_shallow_source(task, source)
            except Exception:
                failures.append(source)

        async def judge_deep(source: IndexedSourceBase) -> None:
            try:
                results[source.id] = await self.judge_deep_source(task, source)
            except Exception:
                failures.append(source)

        LOGGER.info("[JudgeAgent] judging %s source(s)", total_count)
        try:
            await asyncio.gather(
                *(judge_shallow(source) for source in self._queue),
                *(judge_deep(source) for source in self._deep_queue),
            )
            if failures:
                failed = ", ".join(f"{source.id} ({source.kind})" for source in failures)
                raise RuntimeError(
                    f"[JudgeAgent] failed {len(failures)} of {total_count} judgment(s): {failed}"
                )
            return results
        finally:
            self.clear()
