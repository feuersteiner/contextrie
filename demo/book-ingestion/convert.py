"""
Downloads a Project Gutenberg book PDF and converts it to markdown via Docling.

Usage:
    pip install -r requirements.txt
    python convert.py

Output: book.md in the current directory
"""

import sys
import urllib.request
from pathlib import Path

from docling.document_converter import DocumentConverter

# "The Art of War" by Sun Tzu — public domain from Project Gutenberg
BOOK_URL = "https://www.gutenberg.org/files/132/132-0.txt"
OUTPUT_PATH = Path(__file__).parent / "book.md"


def download_text(url: str) -> str:
    """Download the plain text from Project Gutenberg."""
    print(f"Downloading from {url}...")
    with urllib.request.urlopen(url) as resp:
        return resp.read().decode("utf-8")


def text_to_markdown(text: str) -> str:
    """Use Docling to convert the text content to structured markdown."""
    print("Converting to markdown via Docling...")
    converter = DocumentConverter()
    result = converter.convert_all([text], input_format="text")
    # Docling returns an iterable of ConversionResult
    for doc in result:
        return doc.document.export_to_markdown()
    return text  # fallback: return raw text


def simple_convert(text: str) -> str:
    """
    Simple fallback: convert Gutenberg plain text to markdown
    by treating ALL-CAPS lines as headings.
    """
    lines = text.split("\n")
    output = []
    in_body = False

    for line in lines:
        stripped = line.strip()

        # Skip Gutenberg header/footer
        if "*** START OF" in stripped:
            in_body = True
            continue
        if "*** END OF" in stripped:
            break
        if not in_body:
            continue

        # Detect chapter/section headings (ALL-CAPS lines with > 2 chars)
        if (
            stripped
            and stripped == stripped.upper()
            and len(stripped) > 2
            and stripped[0].isalpha()
        ):
            output.append(f"\n## {stripped.title()}\n")
        else:
            output.append(line)

    return "\n".join(output)


def main():
    text = download_text(BOOK_URL)

    try:
        markdown = text_to_markdown(text)
    except Exception as e:
        print(f"Docling conversion failed ({e}), using simple fallback...")
        markdown = simple_convert(text)

    OUTPUT_PATH.write_text(markdown, encoding="utf-8")
    print(f"Written to {OUTPUT_PATH} ({len(markdown)} chars)")


if __name__ == "__main__":
    main()
