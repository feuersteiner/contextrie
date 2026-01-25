import type { LanguageModel } from "ai";
import { generateText, Output } from "ai";
import { z } from "zod";
import type { GeneratedMetadata } from "./types";

const metadataSchema = z.object({
  title: z
    .string()
    .describe(
      "A concise, searchable title that captures what this source is about. Used by assessors to quickly judge relevance without reading full content.",
    ),
  description: z
    .string()
    .describe(
      "A 3-10 sentence summary explaining the source's purpose and value. This is the highest compression level (forgetfulness ~0.8) - retains only essential meaning for context assembly when space is tight.",
    ),
  keypoints: z
    .array(z.string())
    .min(3)
    .max(10)
    .describe(
      "Atomic facts or concepts that assessors can score against tasks. Each keypoint should be independently meaningful - think of them as hooks for relevance matching. When the source becomes central to a task, these guide remembrance back to full detail.",
    ),
});

export async function generateMetadata(
  model: LanguageModel,
  content: string,
  filePath: string,
): Promise<GeneratedMetadata> {
  const fileName = filePath.split("/").pop() ?? "unknown";
  const truncatedContent = content.slice(0, 4000);

  const result = await generateText({
    model,
    output: Output.object({ schema: metadataSchema }),
    prompt: `You are generating metadata for a source in Contextrie, a context orchestration system for AI agents.

This metadata serves three critical purposes:
1. **Relevance scoring**: Assessors use the title and keypoints to score this source against tasks. Make them specific and searchable.
2. **Compressed representation**: The description is the highest-compression version of this content (forgetfulness ~0.8). It must retain core meaning when context space is tight.
3. **Remembrance hooks**: Keypoints act as pointers back to the full content. When this source becomes relevant, agents use them to decide whether to expand to full detail.

Generate metadata that helps assessors answer: "Is this source relevant to the current task?"

You MUST respond with valid JSON in this exact format:
{
  "title": "Specific, searchable title - what is this about?",
  "description": "3-10 sentences capturing essential meaning. What would someone need to know if they could only read this?",
  "keypoints": ["atomic fact or concept 1", "atomic fact or concept 2", "..."]
}

File: ${fileName}

Content:
${truncatedContent}`,
  });

  return result.output;
}
