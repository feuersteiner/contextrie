# Legal Contract Review Demo

## Description

This demo shows how Contextrie can help triage a legal/compliance-style customer complaint by identifying relevant contract clauses. The scenario involves a threatened $47M arbitration between Nexus Financial and Apex Cloud.

## Files

**Relevant to the task:**
- `article.md` — Contract summary highlighting key clauses (termination, SLA, liability, indemnity, confidentiality, force majeure)
- `complaint.txt` — Customer complaint describing outages, refund requests, and data export issues
- `clauses.csv` — Structured list of contract clauses with short summaries

**Noise sources (low relevance):**
- `apex_products.md` — Product information about Apex Cloud offerings
- `nexus_earnings.md` — Nexus Financial earnings report

## How it works

1. **Ingest**: All 5 files are ingested, with AI-generated metadata (title, description, keypoints) for each
2. **Assess**: Sources are scored against a complex 7-part litigation task using shallow assessment (metadata only)
3. **Compose**: Relevant sources are compressed and formatted into hierarchical markdown context

## How to run

From repository root:

```bash
bun demo/demo.ts
```

## Output

The demo outputs:
- List of sources with their IDs and titles
- Shallow assessment results showing relevance scores for each source
- Composed context in hierarchical markdown, organized by relevance tier

## Notes

- The demo uses Azure OpenAI. Configure your endpoint in `demo.ts`.
- This demo is illustrative only and is not legal advice.
