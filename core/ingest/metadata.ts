import type { LanguageModel } from "ai";
import type { GeneratedMetadata } from "./types";

/**
 * Generate metadata (title, description, keypoints) for content
 *
 * TODO: Implement actual LLM call using the provided model
 * Current implementation returns placeholder values for testing
 *
 * Future implementation will:
 * 1. Use the AI SDK's generateObject() function
 * 2. Send appropriate prompts for title, description, keypoints
 * 3. Parse structured output from the LLM
 *
 * Example future implementation:
 *
 * import { generateObject } from "ai";
 * import { z } from "zod";
 *
 * const result = await generateObject({
 *   model,
 *   schema: z.object({
 *     title: z.string(),
 *     description: z.string(),
 *     keypoints: z.array(z.string()),
 *   }),
 *   prompt: `Analyze the following content and generate:
 *     - A concise title
 *     - A brief description (1-2 sentences)
 *     - 3-5 key points
 *
 *     Content:
 *     ${content.slice(0, 4000)}
 *   `,
 * });
 *
 * return result.object;
 */
export async function generateMetadata(
  model: LanguageModel,
  content: string,
  filePath: string,
): Promise<GeneratedMetadata> {
  // PLACEHOLDER IMPLEMENTATION
  // Returns simulated metadata for testing
  const fileName = filePath.split("/").pop() ?? "unknown";

  return {
    title: `Title: ${fileName}`,
    description: `Lorem ipsum description for ${fileName}. This is a placeholder that will be replaced with LLM-generated content.`,
    keypoints: [
      "Lorem ipsum keypoint 1",
      "Lorem ipsum keypoint 2",
      "Lorem ipsum keypoint 3",
    ],
  };
}
