export interface JudgeTask {
  objective: "response" | "proof" | "other";
  input: string;
}
export const JudgeTaskPromptRecord: Record<JudgeTask["objective"], string> = {
  response:
    "Judge whether this source is useful for producing a direct, high-quality response to the input.",
  proof:
    "Judge whether this source materially supports, verifies, or grounds the input with evidence.",
  other:
    "Judge whether this source is meaningfully relevant to the input and objective.",
};

export interface JudgeDecision {
  score: number;
  reason: string;
}

export type JudgeResults = Record<string, JudgeDecision>;
