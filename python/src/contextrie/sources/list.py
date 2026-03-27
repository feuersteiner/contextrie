from __future__ import annotations

from ..types import IndexedSourceBase, Metadata


class ListSource(IndexedSourceBase):
    """Source containing a list of items."""

    kind = "list"

    def __init__(
        self,
        id: str,
        metadata: Metadata | None,
        content: list[str],
        path: str | None = None,
    ) -> None:
        super().__init__(id=id, metadata=metadata, path=path)
        self._content = content

    @property
    def is_iterable(self) -> bool:
        return True

    def get_content(self) -> list[str]:
        return self._content

    async def build_index_input(self) -> str:
        return "\n".join(self._content)

    async def build_deep_judge_input(self) -> str:
        return "\n".join(self._content[:10])
