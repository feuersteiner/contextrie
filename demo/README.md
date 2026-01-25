Legal Contract Review Demo

Description

This demo shows how Contextrie can help triage a legal/compliance-style customer complaint by identifying relevant contract clauses.

Files
- `article.md` — Contract summary highlighting key clauses (termination, SLA, liability, indemnity, confidentiality, force majeure)
- `complaint.txt` — Customer complaint describing outages, refund requests, and data export issues
- `clauses.csv` — Structured list of contract clauses with short summaries

How to run

From repository root:

  bun demo/demo.ts

Notes
- The demo will call your configured LLM. Ensure the model endpoint is available (see `client/config.ts`).
- This demo is illustrative only and is not legal advice.
