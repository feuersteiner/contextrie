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

## Azure OpenAI setup

Use the helper script to create an Azure OpenAI resource and deployment:

```bash
bash demo/scripts/az-openai.sh
```

Then update `demo/keys.ts` with the resource name, API key, and deployment name printed by the script.

`demo/keys.ts` is gitignored, so create it locally like:

```ts
export const resourceName = "<your-azure-resource-name>";
export const apiKey = "<your-azure-api-key>";
export const deploymentName = "<your-azure-deployment-name>";
```

## Bring your own model (OpenAI)

You can swap the Azure client for OpenAI with the AI SDK. Replace the Azure client setup in `demo/demo.ts` with:

```ts
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = openai("gpt-5.2-chat");
```

## Environment Setup

If you're using the OpenAI option, copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Then open `.env` and replace `your_openai_api_key_here` with your actual key from https://platform.openai.com/api-keys

## Output

The demo outputs:

- List of sources with their IDs and titles
- Shallow assessment results showing relevance scores for each source
- Composed context in hierarchical markdown, organized by relevance tier

## Notes

- The demo uses Azure OpenAI. Configure your endpoint in `demo.ts`.
- This demo is illustrative only and is not legal advice.

## Deprecation notice

The demo code will be updated alongside the refactor in issue #39. Expect API changes and updated package boundaries.
