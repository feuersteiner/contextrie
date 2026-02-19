import type { LanguageModel } from "ai";
import { generateText, Output } from "ai";
import { z } from "zod";
import type { Source } from "../ingester/types";
import type { RatedSource } from "./types";
import { formatSourceForPrompt } from "./formatters";

/**
 * Schema for AI-generated relevance scores
 */
const scoringSchema = z.object({
  scores: z.array(
    z.object({
      id: z.string().describe("The source ID being scored"),
      relevance: z
        .number()
        .min(0)
        .max(1)
        .describe("Relevance score from 0 (irrelevant) to 1 (highly relevant)"),
      reasoning: z
        .string()
        .describe("Brief explanation for why this score was given"),
    }),
  ),
});

type ScoringResult = z.infer<typeof scoringSchema>;

/**
 * Score sources against a prompt using AI
 * @param model - The language model to use
 * @param prompt - The task/prompt to score against
 * @param sources - The sources to score
 * @param deep - Whether to include full content in scoring
 * @returns Array of rated sources sorted by relevance (highest first)
 */
export async function scoreSources(
  model: LanguageModel,
  prompt: string,
  sources: Source[],
  deep: boolean,
): Promise<RatedSource[]> {
  if (sources.length === 0) {
    return [];
  }

  const formattedSources = sources
    .map((s, i) => `--- Source ${i + 1} ---\n${formatSourceForPrompt(s, deep)}`)
    .join("\n\n");

  const modeDescription = deep
    ? "You have access to the full content of each source."
    : "You only have access to metadata (title, description, keypoints). Score based on these.";

  const result = await generateText({
    model,
    output: Output.object({ schema: scoringSchema }),
    prompt: `You are an assessor in Contextrie, a context orchestration system for AI agents.

Your job is to score how relevant each source is to the given task/prompt.

## Task
${prompt}

## Scoring Guidelines
- 1.0: Highly relevant - directly addresses the task
- 0.7-0.9: Very relevant - contains important information for the task
- 0.4-0.6: Somewhat relevant - tangentially related or might be useful
- 0.1-0.3: Slightly relevant - weak connection to the task
- 0.0: Irrelevant - no connection to the task

${modeDescription}

## Sources to Evaluate
${formattedSources}

Score each source. You MUST respond with valid JSON containing scores for ALL sources:
{
  "scores": [
    { "id": "source-id", "relevance": 0.85, "reasoning": "Brief explanation" },
    ...
  ]
}`,
  });

  const scoringResult: ScoringResult = result.output;

  // Map scores back to sources
  const scoreMap = new Map(
    scoringResult.scores.map(({ id, relevance, reasoning }) => [
      id,
      { relevance, reasoning },
    ]),
  );

  const ratedSources: RatedSource[] = sources.map((source) => {
    const score = scoreMap.get(source.id);
    return {
      source,
      relevance: score?.relevance ?? 0,
      reasoning: score?.reasoning,
    };
  });

  // Sort by relevance descending
  ratedSources.sort((a, b) => b.relevance - a.relevance);

  return ratedSources;
}
