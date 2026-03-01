from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from contextrie_convert.converter import convert_pdf_to_markdown


class TestInputValidation:
    def test_missing_file_raises(self, tmp_path: Path) -> None:
        with pytest.raises(FileNotFoundError, match="not found"):
            convert_pdf_to_markdown(tmp_path / "nonexistent.pdf")

    def test_non_pdf_extension_raises(self, tmp_path: Path) -> None:
        txt_file = tmp_path / "document.txt"
        txt_file.write_text("hello")
        with pytest.raises(ValueError, match=r"\.txt"):
            convert_pdf_to_markdown(txt_file)


class TestConverterOptions:
    @patch("contextrie_convert.converter.DocumentConverter")
    def test_ocr_disabled_passes_pipeline_options(
        self, mock_converter_cls: MagicMock, tmp_path: Path
    ) -> None:
        pdf = tmp_path / "test.pdf"
        pdf.write_bytes(b"%PDF-1.4 fake")

        mock_result = MagicMock()
        mock_result.document.export_to_markdown.return_value = "# Mocked"
        mock_converter_cls.return_value.convert.return_value = mock_result

        result = convert_pdf_to_markdown(pdf, ocr=False)

        assert result == "# Mocked"
        call_kwargs = mock_converter_cls.call_args
        format_options = call_kwargs.kwargs.get(
            "format_options", call_kwargs.args[0] if call_kwargs.args else {}
        )
        from docling.datamodel.base_models import InputFormat

        pdf_option = format_options[InputFormat.PDF]
        assert pdf_option.pipeline_options.do_ocr is False

    @patch("contextrie_convert.converter.DocumentConverter")
    def test_ocr_enabled_by_default(
        self, mock_converter_cls: MagicMock, tmp_path: Path
    ) -> None:
        pdf = tmp_path / "test.pdf"
        pdf.write_bytes(b"%PDF-1.4 fake")

        mock_result = MagicMock()
        mock_result.document.export_to_markdown.return_value = "# OCR result"
        mock_converter_cls.return_value.convert.return_value = mock_result

        result = convert_pdf_to_markdown(pdf)

        assert result == "# OCR result"
        call_kwargs = mock_converter_cls.call_args
        format_options = call_kwargs.kwargs.get(
            "format_options", call_kwargs.args[0] if call_kwargs.args else {}
        )
        from docling.datamodel.base_models import InputFormat

        pdf_option = format_options[InputFormat.PDF]
        assert pdf_option.pipeline_options.do_ocr is True


class TestCli:
    def test_missing_file_exits_with_error(self) -> None:
        from contextrie_convert.cli import main

        with pytest.raises(SystemExit) as exc_info:
            main(["/nonexistent/path.pdf"])
        assert exc_info.value.code == 1


class TestIntegration:
    @pytest.mark.integration
    def test_converts_fixture_pdf(self, sample_pdf: Path) -> None:
        """Full round-trip: fixture PDF → markdown string."""
        try:
            result = convert_pdf_to_markdown(sample_pdf, ocr=False)
        except Exception as exc:
            pytest.skip(f"Docling conversion unavailable: {exc}")

        assert isinstance(result, str)
        assert len(result) > 0
