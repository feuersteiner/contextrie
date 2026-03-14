from pathlib import Path

import pytest

FIXTURES_DIR = Path(__file__).parent / "fixtures"
SAMPLE_PDF = FIXTURES_DIR / "sample.pdf"


def _generate_sample_pdf() -> Path:
    """Generate a small fixture PDF using reportlab."""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import Paragraph, SimpleDocTemplate

    FIXTURES_DIR.mkdir(exist_ok=True)

    doc = SimpleDocTemplate(str(SAMPLE_PDF), pagesize=letter)
    styles = getSampleStyleSheet()

    story = [
        Paragraph("Sample Document", styles["Heading1"]),
        Paragraph(
            "This is a test paragraph used to verify PDF-to-markdown conversion.",
            styles["BodyText"],
        ),
    ]
    doc.build(story)
    return SAMPLE_PDF


@pytest.fixture(scope="session")
def sample_pdf() -> Path:
    """Return the path to a generated fixture PDF."""
    if not SAMPLE_PDF.exists():
        _generate_sample_pdf()
    return SAMPLE_PDF
