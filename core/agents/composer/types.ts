import type { IndexedSourceBase } from "../../types";
import type { JudgeDecision } from "../judge/types";

export interface JudgedSource {
  source: IndexedSourceBase;
  decision: JudgeDecision;
}

export type ComposerSourceRecord = Record<string, JudgedSource>;
