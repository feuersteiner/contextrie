/**
 * Session - Chat context management for Contextrie
 *
 * A Session manages the ongoing conversation with a user and orchestrates
 * context assessment at each turn.
 *
 * ============================================================================
 * CONCEPT (to be implemented)
 * ============================================================================
 *
 * The Session is part of the Contextrie class and serves as the bridge between
 * the user's conversation and the source assessment system.
 *
 * KEY RESPONSIBILITIES:
 *
 * 1. CHAT HISTORY MANAGEMENT
 *    - Store messages between user and assistant
 *    - Each message can be compressed at multiple forgetfulness levels
 *    - Apply the same compaction mechanism as sources (0-1 forgetfulness scale)
 *    - The chat history itself is a special type of Source
 *
 *    Example message with compression levels:
 *    ```
 *    {
 *      role: "user",
 *      original: "I've been trying to set up the API integration for three
 *                 days now. The docs say to use the v2 endpoint but I keep
 *                 getting 401 errors...",
 *      compressed: [
 *        { forgetfulness: 0.3, value: "User struggling with API integration,
 *          401 errors on v2 endpoint despite regenerating keys." },
 *        { forgetfulness: 0.7, value: "API 401 errors, v2 endpoint." }
 *      ],
 *      keyPoints: ["API integration issue", "401 auth errors", "v2 endpoint"]
 *    }
 *    ```
 *
 * 2. TASK GENERATION
 *    At each turn of conversation, the Session should generate an assessment
 *    "task" or prompt that captures:
 *    - What is the user trying to accomplish right now?
 *    - What context would be most helpful for this turn?
 *
 *    This task is then used as input to the Assessor to find relevant sources.
 *    The task generation should consider:
 *    - The current user message
 *    - Recent conversation context
 *    - Any extracted intents or goals
 *
 * 3. COMPACTION
 *    As conversation grows, the Session should:
 *    - Compact older messages to higher forgetfulness levels
 *    - Extract keypoints from messages for quick relevance matching
 *    - Retain ability to "remember" (expand back to full detail) when needed
 *    - Manage context window budget across chat history + sources
 *
 *    Compaction strategy might be:
 *    - Recent messages: forgetfulness 0 (full detail)
 *    - Older messages: forgetfulness 0.3-0.5 (summarized)
 *    - Ancient messages: forgetfulness 0.7+ (keypoints only)
 *
 * 4. INTEGRATION WITH CONTEXTRIE
 *    - The Session lives on the Contextrie class as an optional component
 *    - Sessions can be created, persisted, and resumed
 *    - The Session itself can be treated as a Source for cross-session context
 *
 * ============================================================================
 * FUTURE API SKETCH
 * ============================================================================
 *
 * ```typescript
 * // Create a new session
 * const session = ctx.session.create();
 *
 * // Add messages as conversation progresses
 * session.addMessage({ role: "user", content: "..." });
 * session.addMessage({ role: "assistant", content: "..." });
 *
 * // Generate a task for the current turn (what should we assess for?)
 * const task = await session.generateTask();
 *
 * // Assess sources against the current conversation context
 * const relevant = await ctx.assess
 *   .task(task)
 *   .from(ctx.sources)
 *   .run();
 *
 * // Compact history when it gets too long
 * await session.compact({ targetForgetfulness: 0.5 });
 *
 * // Get the session as a Source (for cross-session context)
 * const sessionSource = session.toSource();
 *
 * // Persist and resume
 * const sessionId = await session.save();
 * const restored = await ctx.session.load(sessionId);
 * ```
 *
 * ============================================================================
 * DESIGN CONSIDERATIONS
 * ============================================================================
 *
 * - How does forgetfulness interact with the context window budget?
 * - Should task generation be automatic on each message, or explicit?
 * - How to handle multi-turn intents that span several messages?
 * - Should the Session maintain its own source scoring cache?
 * - How to persist sessions efficiently (full history vs. compacted)?
 */

import humanId from "human-id";
import type { DocumentSource } from "../ingester/types";

export type SessionRole = "user" | "assistant" | "system";

export interface SessionCompression {
  forgetfulness: number;
  value: string;
}

export interface SessionMessage {
  id: string;
  role: SessionRole;
  content: string;
  createdAt: string;
  compressed?: SessionCompression[];
  keypoints?: string[];
}

export interface SessionSnapshot {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messages: SessionMessage[];
}

export interface SessionStore {
  save(snapshot: SessionSnapshot): Promise<void>;
  load(id: string): Promise<SessionSnapshot | null>;
  delete(id: string): Promise<void>;
}

export class MemorySessionStore implements SessionStore {
  private store = new Map<string, SessionSnapshot>();

  async save(snapshot: SessionSnapshot): Promise<void> {
    this.store.set(snapshot.id, snapshot);
  }

  async load(id: string): Promise<SessionSnapshot | null> {
    return this.store.get(id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}

export interface SessionCreateOptions {
  id?: string;
  title?: string;
  messages?: SessionMessage[];
}

export interface SessionManagerOptions {
  store?: SessionStore;
}

export class SessionManager {
  private store: SessionStore;

  constructor(options?: SessionManagerOptions) {
    this.store = options?.store ?? new MemorySessionStore();
  }

  create(options?: SessionCreateOptions): Session {
    return new Session(options, this.store);
  }

  async load(id: string): Promise<Session | null> {
    const snapshot = await this.store.load(id);
    if (!snapshot) return null;
    return Session.fromSnapshot(snapshot, this.store);
  }
}

export interface SessionCompactOptions {
  targetForgetfulness?: number;
  maxMessages?: number;
}

export interface SessionTaskOptions {
  maxMessages?: number;
  includeAssistant?: boolean;
}

export interface SessionSourceOptions {
  useCompressed?: boolean;
  targetForgetfulness?: number;
}

export class Session {
  private store: SessionStore;
  private _id: string;
  private _title?: string;
  private _createdAt: string;
  private _updatedAt: string;
  private _messages: SessionMessage[] = [];

  constructor(options?: SessionCreateOptions, store?: SessionStore) {
    this.store = store ?? new MemorySessionStore();
    this._id = options?.id ?? generateSessionId();
    this._title = options?.title;
    this._messages = options?.messages ?? [];
    const now = new Date().toISOString();
    this._createdAt = now;
    this._updatedAt = now;
  }

  static fromSnapshot(
    snapshot: SessionSnapshot,
    store?: SessionStore,
  ): Session {
    const session = new Session(
      {
        id: snapshot.id,
        title: snapshot.title,
        messages: snapshot.messages,
      },
      store,
    );
    session._createdAt = snapshot.createdAt;
    session._updatedAt = snapshot.updatedAt;
    return session;
  }

  get id(): string {
    return this._id;
  }

  get title(): string | undefined {
    return this._title;
  }

  get messages(): SessionMessage[] {
    return [...this._messages];
  }

  addMessage(message: Omit<SessionMessage, "id" | "createdAt">): this {
    const createdAt = new Date().toISOString();
    const full: SessionMessage = {
      id: generateMessageId(),
      role: message.role,
      content: message.content,
      createdAt,
      compressed: message.compressed,
      keypoints: message.keypoints ?? extractKeypoints(message.content),
    };
    this._messages.push(full);
    this._updatedAt = createdAt;
    return this;
  }

  generateTask(options?: SessionTaskOptions): string {
    const maxMessages = options?.maxMessages ?? 6;
    const includeAssistant = options?.includeAssistant ?? true;
    const lastUser = [...this._messages]
      .reverse()
      .find((m) => m.role === "user");
    const recent = this.selectRecentMessages(maxMessages, includeAssistant);
    const context = recent
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    if (lastUser && context) {
      return `${lastUser.content}\n\nRecent context:\n${context}`;
    }

    if (lastUser) return lastUser.content;
    if (context) return `Continue the conversation using:\n${context}`;
    return "Continue the conversation.";
  }

  compact(options?: SessionCompactOptions): this {
    const targetForgetfulness = clamp01(options?.targetForgetfulness ?? 0.5);
    const maxMessages = options?.maxMessages ?? 20;
    const forgetfulnessLevel = mapForgetfulness(targetForgetfulness);
    const keepFrom = Math.max(0, this._messages.length - maxMessages);

    this._messages = this._messages.map((message, index) => {
      if (index >= keepFrom) return message;
      const compressed = compressText(message.content, forgetfulnessLevel);
      const entry: SessionCompression = {
        forgetfulness: forgetfulnessLevel,
        value: compressed,
      };
      return {
        ...message,
        compressed: mergeCompression(message.compressed, entry),
      };
    });

    this._updatedAt = new Date().toISOString();
    return this;
  }

  toSource(options?: SessionSourceOptions): DocumentSource {
    const content = this._messages
      .map((message) => this.resolveMessageContent(message, options))
      .join("\n\n");
    const description = buildDescription(this._messages);
    const keypoints = collectKeypoints(this._messages);

    return {
      type: "document",
      id: this._id,
      title: this._title ?? `Session ${this._id}`,
      description,
      keypoints,
      content,
    };
  }

  async save(): Promise<string> {
    await this.store.save(this.snapshot());
    return this._id;
  }

  async delete(): Promise<void> {
    await this.store.delete(this._id);
  }

  snapshot(): SessionSnapshot {
    return {
      id: this._id,
      title: this._title,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      messages: this._messages,
    };
  }

  private resolveMessageContent(
    message: SessionMessage,
    options?: SessionSourceOptions,
  ): string {
    if (!options?.useCompressed || !message.compressed?.length) {
      return message.content;
    }

    const target = mapForgetfulness(options.targetForgetfulness ?? 0.5);
    const closest = pickClosestCompression(message.compressed, target);
    return closest?.value ?? message.content;
  }

  private selectRecentMessages(
    maxMessages: number,
    includeAssistant: boolean,
  ): SessionMessage[] {
    const filtered = includeAssistant
      ? this._messages
      : this._messages.filter((m) => m.role === "user");
    return filtered.slice(-maxMessages);
  }
}

const generateSessionId = (): string =>
  `${humanId({
    adjectiveCount: 2,
    capitalize: false,
    separator: "-",
  })}-${Math.random().toString(36).substring(2, 8)}`;

const generateMessageId = (): string =>
  `msg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const mapForgetfulness = (value: number): number => {
  return Math.max(1, Math.min(10, Math.round(1 + value * 9)));
};

const compressText = (content: string, forgetfulness: number): string => {
  const base = Math.max(80, 320 - forgetfulness * 20);
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (trimmed.length <= base) return trimmed;
  return `${trimmed.slice(0, base).trim()}...`;
};

const mergeCompression = (
  existing: SessionCompression[] | undefined,
  entry: SessionCompression,
): SessionCompression[] => {
  const list = existing ? [...existing] : [];
  const index = list.findIndex(
    (item) => item.forgetfulness === entry.forgetfulness,
  );
  if (index >= 0) {
    list[index] = entry;
  } else {
    list.push(entry);
  }
  return list;
};

const pickClosestCompression = (
  entries: SessionCompression[],
  target: number,
): SessionCompression | undefined => {
  let best: SessionCompression | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const entry of entries) {
    const distance = Math.abs(entry.forgetfulness - target);
    if (distance < bestDistance) {
      best = entry;
      bestDistance = distance;
    }
  }
  return best;
};

const extractKeypoints = (content: string): string[] => {
  const sentences = content
    .replace(/\s+/g, " ")
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return [];
  return sentences.slice(0, 5);
};

const collectKeypoints = (messages: SessionMessage[]): string[] => {
  const keypoints: string[] = [];
  for (const message of messages) {
    if (message.keypoints?.length) {
      keypoints.push(...message.keypoints);
    } else {
      keypoints.push(...extractKeypoints(message.content));
    }
  }
  return keypoints.slice(0, 10);
};

const buildDescription = (messages: SessionMessage[]): string => {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser) {
    return compressText(lastUser.content, 6);
  }
  const combined = messages.map((m) => m.content).join(" ");
  return compressText(combined, 7);
};
