import { createOpenAI } from "@ai-sdk/openai";
import {
  ComposerAgent,
  DocumentSource,
  IndexingAgent,
  JudgeAgent,
  type IndexedSourceBase,
} from "@contextrie/core";

function buildSources(): DocumentSource[] {
  return [
    new DocumentSource(
      "adapter-boundaries",
      undefined,
      `Core should stay thin. Parsing, file-format handling, and external IO belong in adapters or higher-level packages.
Sources should expose indexing input and deep-judge input, while agent contracts remain small and composable.`,
    ),
    new DocumentSource(
      "composer-risk",
      undefined,
      `The composer currently returns only a context string to the caller.
Even when a model emits selected source IDs, downstream code cannot verify provenance unless those IDs are preserved alongside the composed paragraph.`,
    ),
    new DocumentSource(
      "eval-direction",
      undefined,
      `Agent evaluation should use task fixtures, expected relevance judgments, and rubric-based checks.
Exact string matching is brittle; score bands, ordering, and grounding checks are more stable.`,
    ),
  ];
}

async function main(): Promise<void> {
  const apiKey = process.env.KIMI_API_KEY;
  const baseURL = process.env.KIMI_API_ENDPOINT;
  const modelName =
    process.env.KIMI_DEPLOYMENT_NAME ??
    process.env.KIMI_MODEL_NAME ??
    "Kimi-K2.5";

  if (!apiKey || !baseURL) {
    throw new Error(
      "Missing KIMI_API_KEY or KIMI_API_ENDPOINT in Bun environment",
    );
  }

  const openai = createOpenAI({ apiKey, baseURL });
  const model = openai.chat(modelName);
  const task = {
    objective: "response" as const,
    input: "How should Contextrie evaluate its agents without bloating core?",
  };

  const draftSources = buildSources();

  const indexingAgent = new IndexingAgent(model);
  const indexedSources = await indexingAgent.add(draftSources).run();

  console.log("\n[Indexing]");
  for (const source of indexedSources) {
    console.log(`- ${source.id}: ${source.metadata?.title}`);
  }

  const judgeAgent = new JudgeAgent(model);
  const judgments = await judgeAgent.from(indexedSources).run(task);

  console.log("\n[Judge]");
  for (const source of indexedSources) {
    const decision = judgments[source.id];
    if (!decision) {
      throw new Error(`Missing judgment for source ${source.id}`);
    }
    console.log(
      `- ${source.id}: ${decision.score.toFixed(2)} | ${decision.reason}`,
    );
  }

  const judgedRecord: Record<
    string,
    {
      source: IndexedSourceBase;
      decision: NonNullable<(typeof judgments)[string]>;
    }
  > = {};

  for (const source of indexedSources) {
    const decision = judgments[source.id];
    if (!decision) {
      throw new Error(`Missing judgment for source ${source.id}`);
    }

    judgedRecord[source.id] = {
      source,
      decision,
    };
  }

  const composerAgent = new ComposerAgent(model);
  const context = await composerAgent.from(judgedRecord).run(task);

  console.log("\n[Composer]");
  console.log(context);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
