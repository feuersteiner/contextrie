from __future__ import annotations

from collections.abc import AsyncIterable, Awaitable, Callable

from .._runtime import collect_async_iterable, maybe_await
from ..types import IndexedSourceBase, Metadata


class ReferenceListSource(IndexedSourceBase):
    """Source that resolves a list on demand."""

    kind = "reference-list"

    def __init__(
        self,
        id: str,
        metadata: Metadata | None,
        get_content: Callable[[], AsyncIterable[str] | Awaitable[AsyncIterable[str]]],
        path: str | None = None,
    ) -> None:
        super().__init__(id=id, metadata=metadata, path=path)
        self._get_content = get_content

    @property
    def is_iterable(self) -> bool:
        return True

    def get_content(self) -> AsyncIterable[str] | Awaitable[AsyncIterable[str]]:
        return self._get_content()

    async def build_index_input(self) -> str:
        content = await maybe_await(self._get_content())
        items = await collect_async_iterable(content)
        return "\n".join(items)

    async def build_deep_judge_input(self) -> str:
        content = await maybe_await(self._get_content())
        items = await collect_async_iterable(content, limit=10)
        return "\n".join(items)
