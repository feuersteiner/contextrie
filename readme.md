# Contextrie

Context orchestration for agentic systems.

## Why Contextrie?

Building AI agents that work across multiple steps is hard. Not because the models aren't capable, but because feeding them the _right_ information at the _right_ time is a constant struggle.

Most context management today is either too simple (just append to chat history) or too rigid (static RAG pipelines). Real agentic workflows need something smarter: a system that understands what information exists, judges what's relevant _right now_, and assembles just enough context for each step.

Contextrie is that system.

## How It Works

### Sources

Your data lives in many places: structured stores, documents, databases, APIs, conversation history. Contextrie treats these uniformly as **sources** that can be queried, filtered, and scored.

### Organic Memory

Context windows are finite. Contextrie manages this constraint through two complementary mechanisms:

- **Forgetfulness**: Compress information when you don't need full detail. Summarize, extract key points, prune what's irrelevant.
- **Remembrance**: Expand back to full fidelity when needed. Compacted data retains pointers to its source, so nothing is truly lost.

This mimics how human memory works: we don't recall everything at once, but we can dig deeper when something becomes relevant.

A single piece of information can be stored at multiple compression levels. The `forgetfulness` value (0 to 1) indicates how much detail has been removed, higher means more compressed:

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

This also works for conversation history. Each message can be compacted, with key points extracted:

```json
{
  "id": "conversation-abc123",
  "type": "conversation",
  "messages": [
    {
      "role": "user",
      "original": "I've been trying to set up the API integration for three days now. The docs say to use the v2 endpoint but I keep getting 401 errors. I already regenerated my API key twice. This is for our production environment, we need it working by Friday.",
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
    },
    {
      "role": "assistant",
      "original": "The 401 error with a fresh API key usually means the key hasn't propagated yet, or you're hitting the wrong environment. Can you confirm you're using api.example.com and not api-staging.example.com? Also, keys take up to 60 seconds to activate.",
      "compressed": [
        {
          "forgetfulness": 0.3,
          "value": "Suggested checking environment URL (prod vs staging) and waiting 60s for key propagation."
        },
        {
          "forgetfulness": 0.7,
          "value": "Check environment URL, wait 60s for key."
        }
      ],
      "keyPoints": ["check environment URL", "key propagation delay 60s"]
    }
  ]
}
```

### Assessors

How do you know what's relevant? **Assessors** are agents that score items against the current task.

Let's walk through a complete example. A user wants to write a tweet promoting Contextrie:

```
Task: "Write a tweet promoting Contextrie, an AI context management tool.
       Capture attention by highlighting its unique value."
```

**Step 1: Score the sources**

First, assessors evaluate which sources are relevant to this task:

```json
{
  "task": "Write a tweet promoting Contextrie...",
  "sources": [
    {
      "id": "twitter-hooks-2026",
      "type": "collection",
      "title": "Twitter/X Hooks 2026",
      "description": "Engagement patterns for Twitter/X posts",
      "relevance": 1.0
    },
    {
      "id": "copywriting-techniques",
      "type": "collection",
      "title": "Copywriting Techniques",
      "description": "Proven methods for compelling marketing copy",
      "relevance": 0.85
    },
    {
      "id": "youtube-hooks",
      "type": "collection",
      "title": "YouTube Hooks",
      "description": "Techniques for video intros",
      "relevance": 0.1
    }
  ]
}
```

YouTube hooks score low, wrong medium. Twitter hooks and copywriting techniques score high.

**Step 2: Score items within top sources**

Now assessors dive into the high-scoring sources and evaluate individual items. The task gets refined to focus on what we're actually looking for:

```json
{
  "refinedTask": "Tweet hooks for promoting AI/tech products, emphasis on features",
  "sourceId": "twitter-hooks-2026",
  "items": [
    {
      "id": "hook-i-hate-it-when",
      "title": "I hate it when...",
      "description": "Relatable frustration opener",
      "example": "I hate it when I have to dig through docs for 20 min just to find one config option.",
      "relevance": 0.9
    },
    {
      "id": "hook-i-never-thought",
      "title": "I never thought...",
      "description": "Perspective shift hook",
      "example": "I never thought context management could actually be simple.",
      "relevance": 0.75
    },
    {
      "id": "hook-top-10",
      "title": "Top 10 for YYYY",
      "description": "Listicle format",
      "example": "Top 10 tools every developer needs in 2026",
      "relevance": 0.2
    }
  ]
}
```

The "I hate it when..." hook scores highest, it pairs well with the frustration of bad context management. Listicles score low, wrong format for a single product tweet.

### Assembly Loop

Contextrie ties this together in a feedback loop:

1. Take the current prompt or task
2. Dispatch assessors to score sources, then items within top sources
3. Select the highest-scoring items
4. Assemble them into context for the next step
5. Evaluate satisfaction, if the context isn't good enough, iterate

This loop runs at each pipeline step, ensuring context stays fresh and relevant as tasks evolve.

**Assembled context for tweet generation:**

```json
{
  "task": "Write a tweet promoting Contextrie, an AI context management tool.",
  "context": [
    {
      "sourceId": "twitter-hooks-2026",
      "id": "hook-i-hate-it-when",
      "title": "I hate it when...",
      "description": "Relatable frustration opener",
      "example": "I hate it when I have to dig through docs for 20 min just to find one config option.",
      "relevance": 0.9
    },
    {
      "sourceId": "twitter-hooks-2026",
      "id": "hook-i-never-thought",
      "title": "I never thought...",
      "description": "Perspective shift hook",
      "example": "I never thought context management could actually be simple.",
      "relevance": 0.75
    },
    {
      "sourceId": "copywriting-techniques",
      "id": "technique-problem-solution",
      "title": "Problem-Solution",
      "description": "State the pain, then the fix",
      "relevance": 0.8
    }
  ]
}
```

Or in a token-efficient markdown format for the final prompt:

```markdown
## Task

Write a tweet promoting Contextrie, an AI context management tool.

## Hooks to Consider

- **"I hate it when..."**: Relatable frustration opener.
  Example: "I hate it when I have to dig through docs for 20 min just to find one config option."

- **"I never thought..."**: Perspective shift.
  Example: "I never thought context management could actually be simple."

## Technique

- **Problem-Solution**: State the pain, then the fix.
```

## Installation

```bash
bun add contextrie
```

## Usage

### As a Library

```typescript
import { Contextrie } from "contextrie";

// API is under active development
```

### As a CLI

```bash
bunx contextrie [command]
```

## Status

Contextrie is in early development. The core concepts are defined, but the API is still taking shape. If you're interested in the problem space, watch this repo or reach out.

## License

MIT
