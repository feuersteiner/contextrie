import type { LanguageModel } from "ai";
import { generateText } from "ai";
import type { Source } from "../ingester/types";

/**
 * Convert relevance (0-1) to forgetfulness level (1-10)
 * - relevance 1.0 → forgetfulness 1 (full content)
 * - relevance 0.5 → forgetfulness 6 (main points only)
 * - relevance 0.0 → forgetfulness 10 (single sentence)
 */
export const relevanceToForgetfulness = (relevance: number): number => {
  return Math.round((1 - relevance) * 9) + 1;
};

/**
 * Forgetfulness level descriptions for the AI prompt
 */
const forgetfulnessDescriptions: Record<number, string> = {
  1: "Return the full content with no compression. Keep everything.",
  2: "Minor trimming only. Remove redundant phrases and filler words, but keep all information.",
  3: "Keep all key paragraphs and important details. Remove only clearly redundant content.",
  4: "Keep key paragraphs but lightly summarize verbose sections. Preserve all important facts.",
  5: "Extract main points with their supporting details. Skip minor details.",
  6: "Main points only. No supporting details or examples.",
  7: "Brief summary in 3-4 sentences capturing the essence.",
  8: "Concise summary in 2-3 sentences with only the most critical information.",
  9: "Very brief summary in 1-2 sentences.",
  10: "Single sentence capturing the absolute essence.",
};

/**
 * Get the content from a source based on its type
 */
const getSourceContent = (source: Source): string => {
  switch (source.type) {
    case "document":
      return source.content;
    case "list":
      return source.content.join("\n");
    case "collection":
      return JSON.stringify(source.content, null, 2);
    default:
      return "";
  }
};

/**
 * Compress source content using AI based on forgetfulness level
 * @param model - The language model to use
 * @param source - The source to compress
 * @param forgetfulness - Compression level from 1 (full) to 10 (minimal)
 * @param forgetfulnessBoost - Additional boost to forgetfulness (default: 0)
 * @returns Compressed content string
 */
export async function compressSource(
  model: LanguageModel,
  source: Source,
  forgetfulness: number,
  forgetfulnessBoost: number = 0,
): Promise<string> {
  const content = getSourceContent(source);

  // Apply boost and clamp to valid range
  const effectiveForgetfulness = Math.max(
    1,
    Math.min(10, Math.round(forgetfulness + forgetfulnessBoost)),
  );

  // For forgetfulness level 1, return content as-is
  if (effectiveForgetfulness === 1) {
    return content;
  }

  const instruction = forgetfulnessDescriptions[effectiveForgetfulness];

  const result = await generateText({
    model,
    prompt: `You are a content compressor. Your task is to compress the following content according to the specified compression level.

## Compression Instruction
${instruction}

## Source Title
${source.title}

## Source Description
${source.description}

## Content to Compress
${content}

## Rules
- Preserve accuracy - never add information that isn't in the original
- Maintain the original meaning and intent
- Output only the compressed content, no explanations or prefixes
- If the content is already shorter than what the compression level would produce, return it as-is

Compressed content:`,
  });

  return result.text.trim();
}
