from __future__ import annotations

import asyncio
import logging

from .._runtime import coerce_schema_instance, maybe_await
from ..types import IndexedSourceBase, Metadata, StructuredModel

LOGGER = logging.getLogger(__name__)

DEFAULT_INDEXING_PROMPT = """Generate metadata for retrieval.

Return ONLY valid JSON with this exact shape:
{
  "title": string,
  "description": string,
  "keypoints": string[]
}

Rules:
- title: specific and concise (max 80 chars)
- description: 1-2 factual sentences about what this source contains and when to use it
- keypoints: 3-7 short strings with the most relevant facts, constraints, entities, or decisions
- prioritize information that helps relevance filtering
- use only provided content
- no markdown, no code fences, no extra keys"""


class IndexingAgent:
    def __init__(
        self,
        model: StructuredModel,
        prompt: str = DEFAULT_INDEXING_PROMPT,
    ) -> None:
        self.model = model
        self.prompt = prompt
        self._queue: list[IndexedSourceBase] = []

    def add(self, source: IndexedSourceBase | list[IndexedSourceBase]) -> "IndexingAgent":
        if isinstance(source, list):
            self._queue.extend(source)
        else:
            self._queue.append(source)
        return self

    def clear(self) -> "IndexingAgent":
        self._queue.clear()
        return self

    async def generate_metadata(self, source: IndexedSourceBase) -> Metadata:
        input_text = await source.build_index_input()
        payload = await maybe_await(
            self.model.generate_object(
                prompt=(
                    f"{self.prompt}\n\n"
                    f"Source ID: {source.id}\n"
                    f"Source kind: {source.kind}\n\n"
                    f"Source content:\n{input_text}"
                ),
                schema=Metadata,
            )
        )
        return coerce_schema_instance(Metadata, payload)

    async def run(self) -> list[IndexedSourceBase]:
        LOGGER.info("[IndexingAgent] indexing %s source(s)", len(self._queue))
        successful_results: list[IndexedSourceBase] = []

        async def index_source(source: IndexedSourceBase) -> None:
            try:
                LOGGER.info("[IndexingAgent] indexing source %s (%s)", source.id, source.kind)
                metadata = await self.generate_metadata(source)
                source.metadata = metadata
                successful_results.append(source)
                LOGGER.info("[IndexingAgent] indexed source %s", source.id)
            except Exception as error:
                LOGGER.error("[IndexingAgent] failed to index source %s: %s", source.id, error)

        try:
            await asyncio.gather(*(index_source(source) for source in self._queue))
            return successful_results
        finally:
            self.clear()
