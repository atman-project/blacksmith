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

export interface UIPreferences {
  activeId: string;
  sidebarOpen: boolean;
  viewMode: ViewMode;
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
