from __future__ import annotations

from ..types import IndexedSourceBase, Metadata


class DocumentSource(IndexedSourceBase):
    """Source containing a single text document."""

    kind = "document"

    def __init__(
        self,
        id: str,
        metadata: Metadata | None,
        content: str,
        path: str | None = None,
    ) -> None:
        super().__init__(id=id, metadata=metadata, path=path)
        self._content = content

    @property
    def is_iterable(self) -> bool:
        return False

    def get_content(self) -> str:
        return self._content

    async def build_index_input(self) -> str:
        return self._content

    async def build_deep_judge_input(self) -> str:
        return self._content
