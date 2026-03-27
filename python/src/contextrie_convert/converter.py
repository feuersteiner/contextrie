from pathlib import Path

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption


def convert_pdf_to_markdown(pdf_path: str | Path, *, ocr: bool = True) -> str:
    """Convert a PDF file to markdown using Docling.

    Args:
        pdf_path: Path to the PDF file.
        ocr: Whether to enable OCR (default True). Set False for born-digital PDFs.

    Returns:
        Markdown string of the converted document.

    Raises:
        FileNotFoundError: If the PDF file does not exist.
        ValueError: If the file does not have a .pdf extension.
    """
    path = Path(pdf_path)

    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {path}")

    if path.suffix.lower() != ".pdf":
        raise ValueError(f"Expected a .pdf file, got: {path.suffix}")

    pipeline_options = PdfPipelineOptions(do_ocr=ocr)
    converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options),
        }
    )

    result = converter.convert(str(path))
    return result.document.export_to_markdown()
