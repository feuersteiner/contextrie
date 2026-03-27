from __future__ import annotations

from collections.abc import Awaitable, Callable

from .._runtime import maybe_await
from ..types import IndexedSourceBase, Metadata


class ReferenceDocumentSource(IndexedSourceBase):
    """Source that resolves a document on demand."""

    kind = "reference-document"

    def __init__(
        self,
        id: str,
        metadata: Metadata | None,
        get_content: Callable[[], str | Awaitable[str]],
        path: str | None = None,
    ) -> None:
        super().__init__(id=id, metadata=metadata, path=path)
        self._get_content = get_content

    @property
    def is_iterable(self) -> bool:
        return False

    def get_content(self) -> str | Awaitable[str]:
        return self._get_content()

    async def build_index_input(self) -> str:
        return await maybe_await(self._get_content())

    async def build_deep_judge_input(self) -> str:
        return await maybe_await(self._get_content())
