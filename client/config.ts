import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import type { DensityValue } from "../core/compose/density";

const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: "http://localhost:11434/v1",
});

export interface IngesterConfig {
  model: LanguageModel;
}

export interface AssessorConfig {
  model: LanguageModel;
}

export interface ComposeConfig {
  model: LanguageModel;
  defaultThreshold: number;
  defaultDensity?: DensityValue;
}

export interface ContextrieConfig {
  outputDir: string;
  ingester: IngesterConfig;
  assessor: AssessorConfig;
  compose: ComposeConfig;
}

export const DEFAULT_CONFIG: ContextrieConfig = {
  outputDir: ".contextrie",
  ingester: {
    model: ollama.languageModel("llama3.2"),
  },
  assessor: {
    model: ollama.languageModel("llama3.2"),
  },
  compose: {
    model: ollama.languageModel("llama3.2"),
    defaultThreshold: 0.65,
    defaultDensity: "minimal",
  },
};
