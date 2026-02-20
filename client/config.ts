import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import type { DensityValue } from "../core/compose/density";

const OLLAMA_BASE_URL = "http://localhost:11434/v1";
const DEFAULT_MODEL = "llama3.2";

const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: OLLAMA_BASE_URL,
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
    model: ollama.languageModel(DEFAULT_MODEL),
  },
  assessor: {
    model: ollama.languageModel(DEFAULT_MODEL),
  },
  compose: {
    model: ollama.languageModel(DEFAULT_MODEL),
    defaultThreshold: 0.65,
    defaultDensity: "minimal",
  },
};
