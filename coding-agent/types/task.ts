export type TaskStatus = "draft" | "todo" | "doing" | "done";

export type TaskAgent = "codex" | "opencode" | "claudecode";

export interface Task {
  /** Stable task identifier used for references across files and commands. */
  id: string;
  /** Short human-readable label used in listings and headings. */
  title: string;
  /** Current execution state for the task lifecycle. */
  status: TaskStatus;
  /** Last delegated agent for the task, when delegation has occurred. */
  agent?: TaskAgent;
  /** Provider-specific session identifier returned by the delegated agent runtime. */
  agentSessionId?: string;
  /** Creation timestamp stored as text so Markdown frontmatter round-trips cleanly. */
  createdAt: string;
  /** Last modification timestamp for freshness checks and sorting. */
  updatedAt: string;
}

export interface TaskContent {
  /** Original user brief captured when the scaffold was created. */
  sourcePrompt: string;
  /** Detailed problem statement and spec detailing the task requirements, constraints, and context. */
  spec: string;
  /** Concrete, testable conditions that define task completion, used to validate by the QA agent. */
  acceptanceCriteria: string[];
  /** Free-form notes capturing the history of work done, decisions made, and next steps, including possibly the commit SHA. */
  history: TaskHistoryEntry[];
}

export interface TaskHistoryEntry {
  /** Free-form notes capturing what was done, decisions made, and next steps. */
  notes: string;
  /** Optional commit SHA linking this work entry to a specific code change. */
  commitSha?: string;
  /** Timestamp for when this history entry was recorded, stored as text for Markdown compatibility. */
  timestamp?: string;
}
