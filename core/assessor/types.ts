import type { Source } from "../ingester/types";

/**
 * Options for controlling assessment behavior
 */
export interface AssessmentOptions {
  /**
   * If true, include full content in scoring (slower but more accurate).
   * Default (false) uses only keypoints + description for fast scoring.
   */
  deep?: boolean;
}

/**
 * A source with its relevance score
 */
export interface RatedSource {
  /** The original source */
  source: Source;
  /** Relevance score from 0 (irrelevant) to 1 (highly relevant) */
  relevance: number;
  /** Optional explanation for the score (useful for debugging) */
  reasoning?: string;
}

/**
 * Result of an assessment run
 */
export interface AssessmentResult {
  /** The prompt/task that sources were assessed against */
  prompt: string;
  /** Sources sorted by relevance (highest first) */
  rated: RatedSource[];
}
