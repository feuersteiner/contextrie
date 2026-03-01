import argparse
import sys

from .converter import convert_pdf_to_markdown


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        prog="contextrie-convert",
        description="Convert a PDF to markdown using Docling.",
    )
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument(
        "--no-ocr",
        action="store_true",
        help="Disable OCR (for born-digital PDFs)",
    )

    args = parser.parse_args(argv)

    try:
        markdown = convert_pdf_to_markdown(args.pdf_path, ocr=not args.no_ocr)
        sys.stdout.write(markdown)
    except (FileNotFoundError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
