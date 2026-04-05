export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Commit {
  message: string;
  doc: string;
  time: string;
  hash: string;
}

export interface App {
  id: string;
  doc: string;
  lastCommittedDoc: string;
  messages: Message[];
  commits: Commit[];
}

export type ViewMode = "markdown" | "rendered";

export type ModelId = "claude-sonnet" | "llama-3.2-8b";

export interface ModelOption {
  id: ModelId;
  label: string;
  category: "cloud" | "local";
  available: boolean;
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: "claude-sonnet", label: "Claude Sonnet", category: "cloud", available: true },
  { id: "llama-3.2-8b", label: "Llama 3.2 8B", category: "local", available: false },
];

export interface UIPreferences {
  activeId: string;
  sidebarOpen: boolean;
  viewMode: ViewMode;
  modelId: ModelId;
}

export interface DiffLine {
  type: "ctx" | "add" | "del";
  content: string;
  oldNum?: number;
  newNum?: number;
  pair?: DiffLine;
}

export interface Hunk {
  lines: DiffLine[];
}

export interface DiffResult {
  hunks: Hunk[];
  additions: number;
  deletions: number;
}

export interface InlineSegment {
  text: string;
  highlight: boolean;
}

export interface InlineDiffResult {
  oldSegments: InlineSegment[];
  newSegments: InlineSegment[];
}
