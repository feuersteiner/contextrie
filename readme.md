# Contextrie

AI agents lose performance as they accumulate irrelevant context over long-running tasks. Contextrie dynamically curates what each agent sees, keeping it sharp from task one to task one thousand.

## Quickstart

```bash
bun add contextrie
```

```typescript
import { Contextrie } from "contextrie";

const ctx = new Contextrie({
  ingester: { model },
  assessor: { model },
  compose: { model },
});

await ctx.ingest.file("./docs/contract.md").file("./docs/clauses.csv").run();

const assessment = await ctx.assess
  .task("Find clauses about SLA violations")
  .from(ctx.sources)
  .run();

const context = await ctx.compose
  .task("Find clauses about SLA violations")
  .from(assessment.rated)
  .density("balanced")
  .run();

console.log(context);
```

## Key Capabilities

- Ingest files and generate compact, searchable metadata
- Assess relevance per task with shallow or deep scoring
- Compose compressed context with controllable density
- Preserve source lineage for later expansion
- Built for multi-step, agentic workflows

## Why Contextrie?

Building AI agents that work across multiple steps is hard. Not because the models aren't capable, but because feeding them the _right_ information at the _right_ time is a constant struggle.

The core idea comes from how humans and organizations handle deep context: compress, filter, and distill until a decision brief emerges. Without that, both orgs and agents drown in noise and experience context rot.

Most context management today is either too simple (just append to chat history) or too rigid (static RAG pipelines). Real agentic workflows need something smarter: a system that understands what information exists, judges what's relevant _right now_, and assembles just enough context for each step.

Contextrie is that system.

## How It Works

Contextrie provides a three-stage pipeline: **Ingest → Assess → Compose**.

### 1. Ingester

The Ingester loads files and generates AI-powered metadata for each source:

```typescript
await ctx.ingest
  .file("./contract.md")
  .file("./complaint.txt")
  .file("./clauses.csv")
  .run();
```

**Supported file types:**

- `.md` (Markdown) → DocumentSource
- `.txt` (Text) → DocumentSource
- `.csv` (CSV) → ListSource

For each file, the Ingester generates:

- **title**: Concise, searchable name
- **description**: High-compression summary (essential meaning only)
- **keypoints**: Atomic facts/concepts that act as "hooks" for relevance matching

```typescript
interface Source {
  type: "document" | "list" | "collection";
  id: string;
  title: string;
  description: string;
  keypoints: string[];
  content: string | string[] | Record<string, unknown>[];
}
```

### 2. Assessor

The Assessor evaluates how relevant each source is to a given task:

```typescript
const result = await ctx.assess
  .task("Identify contract clauses related to SLA violations")
  .from(ctx.sources)
  .run();

// result.rated: sources sorted by relevance (highest first)
```

**Two scoring modes:**

- **Shallow (default)**: Fast scoring using only metadata (title, description, keypoints)
- **Deep**: More accurate scoring that includes full content

```typescript
// Use deep mode for thorough assessment
const result = await ctx.assess
  .task("Find clauses about liability caps")
  .from(ctx.sources)
  .deep()
  .run();
```

Each source receives a relevance score (0.0 to 1.0):

- **1.0**: Highly relevant — directly addresses the task
- **0.7-0.9**: Very relevant — contains important information
- **0.4-0.6**: Somewhat relevant — tangentially related
- **0.1-0.3**: Slightly relevant — weak connection
- **0.0**: Irrelevant — no connection

### 3. Composer

The Composer compresses and formats assessed sources into final context:

```typescript
const context = await ctx.compose
  .task("Identify relevant contract clauses")
  .from(result.rated)
  .density("sparse")
  .run();
```

**Density presets** control compression aggressiveness and source inclusion:

| Preset     | Value | Effect                            |
| ---------- | ----- | --------------------------------- |
| `minimal`  | 0.1   | Most compression, fewest sources  |
| `sparse`   | 0.3   | Aggressive compression            |
| `balanced` | 0.5   | Moderate compression              |
| `detailed` | 0.7   | Light compression                 |
| `thorough` | 0.9   | Minimal compression, most sources |

You can also pass a numeric value (0-1) directly.

**How compression works:**

Sources are compressed based on their relevance score. Higher relevance = less compression:

- Relevance 1.0 → Full content preserved
- Relevance 0.5 → Main points only
- Relevance 0.1 → Single sentence summary

The output is hierarchical markdown organized by relevance tier:

```markdown
# Context for: Identify relevant contract clauses

## High Relevance Sources

### SLA and Uptime Guarantees (relevance: 0.95)

[compressed content]

## Medium Relevance Sources

### Termination Rights (relevance: 0.72)

[compressed content]

---

_Composed from 5 sources. Threshold: 0.65_
```

## Demo

See the end-to-end legal contract review example in `demo/README.md`.

## Links

- Post: https://flintworks.dev/engineering/humans-managed-deep-contexts-agents-are-not-different
- Discord: https://discord.gg/ayX9hm4D

## Roadmap (Planned)

> **Note:** The following describes planned functionality not yet implemented.

### Organic Memory

Context windows are finite. Contextrie will manage this constraint through two complementary mechanisms:

- **Forgetfulness**: Compress information when you don't need full detail. Summarize, extract key points, prune what's irrelevant.
- **Remembrance**: Expand back to full fidelity when needed. Compacted data retains pointers to its source, so nothing is truly lost.

This mimics how human memory works: we don't recall everything at once, but we can dig deeper when something becomes relevant.

A single piece of information could be stored at multiple compression levels:

```json
{
  "id": "customer-jane-doe",
  "original": "Jane Doe, premium customer since 2019. Prefers email over phone. Complained about billing twice (resolved). Interested in enterprise plan.",
  "compressed": [
    {
      "forgetfulness": 0.4,
      "value": "Jane Doe, premium since 2019. Prefers email. Interested in enterprise."
    },
    {
      "forgetfulness": 0.8,
      "value": "Jane Doe, premium customer, enterprise interest."
    }
  ]
}
```

When context space is tight, use the `0.8` version. When Jane becomes central to the task, expand back to the original.

This would also work for conversation history, with each message compacted and key points extracted:

```json
{
  "id": "conversation-abc123",
  "type": "conversation",
  "messages": [
    {
      "role": "user",
      "original": "I've been trying to set up the API integration for three days now...",
      "compressed": [
        {
          "forgetfulness": 0.3,
          "value": "User struggling with API integration, 401 errors on v2 endpoint despite regenerating keys. Production deadline Friday."
        },
        {
          "forgetfulness": 0.7,
          "value": "API 401 errors, v2 endpoint, deadline Friday."
        }
      ],
      "keyPoints": [
        "API integration issue",
        "401 auth errors",
        "v2 endpoint",
        "Friday deadline"
      ]
    }
  ]
}
```

### Assembly Loop

Contextrie will tie source scoring together in a feedback loop:

1. Take the current prompt or task
2. Dispatch assessors to score sources, then items within top sources
3. Select the highest-scoring items
4. Assemble them into context for the next step
5. Evaluate satisfaction — if the context isn't good enough, iterate

This loop would run at each pipeline step, ensuring context stays fresh and relevant as tasks evolve.

**Example: Scoring for a tweet-writing task**

```json
{
  "task": "Write a tweet promoting Contextrie...",
  "sources": [
    {
      "id": "twitter-hooks-2026",
      "title": "Twitter/X Hooks 2026",
      "relevance": 1.0
    },
    {
      "id": "copywriting-techniques",
      "title": "Copywriting Techniques",
      "relevance": 0.85
    },
    { "id": "youtube-hooks", "title": "YouTube Hooks", "relevance": 0.1 }
  ]
}
```

Then, within high-scoring sources, individual items would be scored:

```json
{
  "sourceId": "twitter-hooks-2026",
  "items": [
    {
      "id": "hook-i-hate-it-when",
      "title": "I hate it when...",
      "relevance": 0.9
    },
    {
      "id": "hook-i-never-thought",
      "title": "I never thought...",
      "relevance": 0.75
    },
    { "id": "hook-top-10", "title": "Top 10 for YYYY", "relevance": 0.2 }
  ]
}
```

### Additional Capabilities

- **Per-item assessment**: Score individual items within ListSource/CollectionSource
- **Additional file types**: JSON, XLSX, PDF, etc.
- **Custom compression strategies**: Beyond the current forgetfulness scale
- **Alternative output formats**: JSON, HTML, etc.
- **Streaming support**: For large files and contexts
- **Assessment caching**: Avoid re-scoring unchanged sources

## Status

Contextrie is in early development. The core pipeline (Ingest → Assess → Compose) is functional, but the API is still taking shape. If you're interested in the problem space, watch this repo or reach out.

## License

MIT
