# contextrie-convert

PDF-to-markdown converter using [Docling](https://github.com/DS4SD/docling). Produces markdown output suitable for the contextrie ingestion pipeline.

## Setup

```bash
cd python
poetry install
```

## CLI usage

```bash
# Convert a PDF to markdown (printed to stdout)
contextrie-convert path/to/document.pdf

# Disable OCR for born-digital PDFs (faster)
contextrie-convert path/to/document.pdf --no-ocr

# Also works as a module
python -m contextrie_convert path/to/document.pdf
```

## Python API

```python
from contextrie_convert import convert_pdf_to_markdown

markdown = convert_pdf_to_markdown("path/to/document.pdf")

# Disable OCR for born-digital PDFs
markdown = convert_pdf_to_markdown("path/to/document.pdf", ocr=False)
```

## Testing

```bash
poetry run pytest                        # unit tests only
poetry run pytest -m integration         # integration tests (requires Docling)
```
