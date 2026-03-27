from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import AsyncIterable
from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class Metadata:
    """Metadata extracted or generated during indexing."""

    title: str
    description: str
    keypoints: list[str]

    def __post_init__(self) -> None:
        if not isinstance(self.title, str) or not self.title.strip():
            raise ValueError("Metadata.title must be a non-empty string")
        if not isinstance(self.description, str) or not self.description.strip():
            raise ValueError("Metadata.description must be a non-empty string")
        if not isinstance(self.keypoints, list) or not self.keypoints:
            raise ValueError("Metadata.keypoints must be a non-empty list")
        if not all(isinstance(point, str) and point.strip() for point in self.keypoints):
            raise ValueError("Metadata.keypoints must contain non-empty strings")


class IndexedSourceBase(ABC):
    """Base class for retrieval-ready sources."""

    kind: str

    def __init__(
        self,
        id: str,
        metadata: Metadata | None = None,
        path: str | None = None,
    ) -> None:
        self.id = id
        self.metadata = metadata
        self.path = path

    @property
    def is_draft(self) -> bool:
        return self.metadata is None

    @property
    @abstractmethod
    def is_iterable(self) -> bool:
        raise NotImplementedError

    @abstractmethod
    def get_content(self) -> str | list[str] | AsyncIterable[str] | Any:
        raise NotImplementedError

    @abstractmethod
    async def build_index_input(self) -> str:
        raise NotImplementedError

    @abstractmethod
    async def build_deep_judge_input(self) -> str:
        raise NotImplementedError
