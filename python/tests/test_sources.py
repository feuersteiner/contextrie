from __future__ import annotations

import asyncio

from contextrie import (
    ComplexDocumentSource,
    DocumentSection,
    DocumentSource,
    ListSource,
    Metadata,
    ReferenceDocumentSource,
    ReferenceListSource,
)


def test_document_source_builds_expected_inputs() -> None:
    source = DocumentSource("doc", None, "alpha\nbeta")

    assert source.kind == "document"
    assert source.is_draft is True
    assert source.is_iterable is False
    assert source.get_content() == "alpha\nbeta"
    assert asyncio.run(source.build_index_input()) == "alpha\nbeta"
    assert asyncio.run(source.build_deep_judge_input()) == "alpha\nbeta"


def test_list_source_uses_first_ten_items_for_deep_judgment() -> None:
    source = ListSource("items", None, [f"item-{index}" for index in range(12)])

    assert source.is_iterable is True
    assert asyncio.run(source.build_index_input()).count("\n") == 11
    assert asyncio.run(source.build_deep_judge_input()) == "\n".join(
        f"item-{index}" for index in range(10)
    )


def test_reference_sources_resolve_content_on_demand() -> None:
    async def get_document() -> str:
        return "lazy document"

    async def get_items():
        for value in ("one", "two", "three"):
            yield value

    document = ReferenceDocumentSource("ref-doc", None, get_document)
    items = ReferenceListSource("ref-list", None, get_items)

    assert asyncio.run(document.build_index_input()) == "lazy document"
    assert asyncio.run(items.build_index_input()) == "one\ntwo\nthree"


def test_complex_document_source_keeps_sections_and_content() -> None:
    section = DocumentSection(
        heading="Overview",
        level=1,
        content="Section content",
        metadata=Metadata(
            title="Overview",
            description="Top-level overview section.",
            keypoints=["overview", "structure", "context"],
        ),
        children=[],
    )
    source = ComplexDocumentSource(
        "complex",
        Metadata(
            title="Design",
            description="Structured design notes.",
            keypoints=["design", "sections", "metadata"],
        ),
        [section],
        "Full document content",
    )

    assert source.sections == [section]
    assert asyncio.run(source.build_deep_judge_input()) == "Full document content"
