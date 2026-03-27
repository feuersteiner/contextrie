from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Protocol, TypeVar, runtime_checkable

T = TypeVar("T")


@runtime_checkable
class StructuredModel(Protocol):
    """Provider-agnostic model interface used by Contextrie agents."""

    def generate_object(
        self,
        *,
        prompt: str,
        schema: type[T],
    ) -> T | Mapping[str, Any] | object:
        ...
