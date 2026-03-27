from __future__ import annotations

import inspect
from collections.abc import AsyncIterable, Mapping
from dataclasses import fields, is_dataclass
from types import NoneType, UnionType
from typing import Any, TypeVar, Union, get_args, get_origin, get_type_hints

T = TypeVar("T")


async def maybe_await(value: T) -> T:
    if inspect.isawaitable(value):
        return await value
    return value


async def collect_async_iterable(
    iterable: AsyncIterable[str],
    *,
    limit: int | None = None,
) -> list[str]:
    items: list[str] = []
    async for item in iterable:
        items.append(item)
        if limit is not None and len(items) >= limit:
            break
    return items


def coerce_schema_instance(schema: type[T], payload: Any) -> T:
    if isinstance(payload, schema):
        return payload
    if not is_dataclass(schema):
        raise TypeError(f"{schema!r} must be a dataclass schema")
    if not isinstance(payload, Mapping):
        raise TypeError(f"Expected {schema.__name__} or mapping, got {type(payload).__name__}")

    type_hints = get_type_hints(schema)
    values: dict[str, Any] = {}
    for field in fields(schema):
        if field.name not in payload:
            raise TypeError(f"Missing field {field.name!r} for {schema.__name__}")
        values[field.name] = _coerce_value(type_hints.get(field.name, field.type), payload[field.name])
    return schema(**values)


def _coerce_value(expected_type: Any, value: Any) -> Any:
    origin = get_origin(expected_type)
    if origin is None:
        if expected_type in (Any, object):
            return value
        if expected_type is NoneType:
            if value is not None:
                raise TypeError("Expected None")
            return value
        if is_dataclass(expected_type):
            return coerce_schema_instance(expected_type, value)
        if not isinstance(value, expected_type):
            raise TypeError(f"Expected {expected_type!r}, got {type(value)!r}")
        return value

    if origin is list:
        (item_type,) = get_args(expected_type)
        if not isinstance(value, list):
            raise TypeError(f"Expected list, got {type(value)!r}")
        return [_coerce_value(item_type, item) for item in value]

    if origin is dict:
        key_type, value_type = get_args(expected_type)
        if not isinstance(value, Mapping):
            raise TypeError(f"Expected mapping, got {type(value)!r}")
        return {
            _coerce_value(key_type, item_key): _coerce_value(value_type, item_value)
            for item_key, item_value in value.items()
        }

    if origin in (UnionType, Union):
        args = get_args(expected_type)
        if value is None and NoneType in args:
            return None
        for option in args:
            if option is NoneType:
                continue
            try:
                return _coerce_value(option, value)
            except TypeError:
                continue
        raise TypeError(f"Value {value!r} does not match {expected_type!r}")

    if str(origin).endswith("Literal"):
        if value not in get_args(expected_type):
            raise TypeError(f"Expected one of {get_args(expected_type)!r}, got {value!r}")
        return value

    return value
