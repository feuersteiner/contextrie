from __future__ import annotations

from dataclasses import dataclass

from ..types import IndexedSourceBase, Metadata


@dataclass(slots=True)
class DocumentSection:
    """A section within a complex document."""

    heading: str
    level: int
    content: str
    metadata: Metadata
    children: list["DocumentSection"]

    def __post_init__(self) -> None:
        if not isinstance(self.heading, str) or not self.heading.strip():
            raise ValueError("DocumentSection.heading must be a non-empty string")
        if not isinstance(self.level, int) or self.level < 1:
            raise ValueError("DocumentSection.level must be an integer >= 1")
        if not isinstance(self.content, str):
            raise ValueError("DocumentSection.content must be a string")
        if not isinstance(self.metadata, Metadata):
            raise ValueError("DocumentSection.metadata must be Metadata")
        if not isinstance(self.children, list):
            raise ValueError("DocumentSection.children must be a list")


class ComplexDocumentSource(IndexedSourceBase):
    """Source containing a structured document split into sections."""

    kind = "complex-document"

    def __init__(
        self,
        id: str,
        metadata: Metadata | None,
        sections: list[DocumentSection],
        content: str,
        path: str | None = None,
    ) -> None:
        super().__init__(id=id, metadata=metadata, path=path)
        self.sections = sections
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
