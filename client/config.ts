import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: "http://localhost:11434/v1",
});

export interface IngesterConfig {
  model: LanguageModel;
}

export interface AssessConfig {
  model: LanguageModel;
}

export interface ComposeConfig {
  model: LanguageModel;
}

export interface ContextrieConfig {
  outputDir: string;
  ingest: IngesterConfig;
  assess: AssessConfig;
  compose: ComposeConfig;
}

export const DEFAULT_CONFIG: ContextrieConfig = {
  outputDir: ".contextrie",
  ingest: {
    model: ollama.languageModel("llama3.2"),
  },
  assess: {
    model: ollama.languageModel("llama3.2"),
  },
  compose: {
    model: ollama.languageModel("llama3.2"),
  },
};
