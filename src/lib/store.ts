import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { App, ViewMode } from "../types";
import { saveApps, savePreferences, loadAll } from "./persistence";

// --- Constants ---
export const INITIAL_DOC = `# Welcome to Blacksmith

Blacksmith is a **doc-to-app framework** — part of the Atman Project.

## What is this?

This is your workspace. The document you're reading right now is a *living document*. You can edit it directly, or use the chat on the left to transform it.

## How it works

- **Chat** with Blacksmith to shape your document
- **Edit** the note directly on the right
- **Commit** your changes to create save points
- **Revert** to undo uncommitted changes
- **History** to browse your commit timeline

## Philosophy

> Your memories you will never lose.
> Software shifts. Your data shouldn't.

Data is not static. It is something to be **forged**.
`;

const WELCOME_MESSAGE = "Welcome to the Blacksmith forge. I can help you shape your document — ask me to add sections, restructure content, change tone, or transform it entirely.";

let nextId = 2;

export function createNewApp(): App {
  const id = `app-${nextId++}`;
  return {
    id,
    doc: INITIAL_DOC,
    lastCommittedDoc: INITIAL_DOC,
    messages: [{ role: "assistant", content: WELCOME_MESSAGE }],
    commits: [],
  };
}

export function createInitialApp(): App {
  return {
    id: "app-1",
    doc: INITIAL_DOC,
    lastCommittedDoc: INITIAL_DOC,
    messages: [{ role: "assistant", content: WELCOME_MESSAGE }],
    commits: [],
  };
}

export function extractTitle(doc: string): string {
  const match = doc.match(/^#\s+(.+)/m);
  return match ? match[1].replace(/\*\*/g, "") : "Untitled";
}

// --- Simulated AI ---
export function getAIResponse(
  userMsg: string,
  currentDoc: string
): { reply: string; newDoc: string } {
  const msg = userMsg.toLowerCase();
  let newDoc = currentDoc,
    reply = "";
  if (msg.includes("add") && msg.includes("section")) {
    const t =
      userMsg
        .replace(/add\s*(a\s*)?section\s*(about|on|for|called|titled)?\s*/i, "")
        .trim() || "New Section";
    const cap = t.charAt(0).toUpperCase() + t.slice(1);
    newDoc =
      currentDoc +
      `\n\n## ${cap}\n\nThis section covers ${cap.toLowerCase()}. Start writing here...\n`;
    reply = `Added a new section: **${cap}**.`;
  } else if (msg.includes("add") && msg.includes("todo")) {
    newDoc =
      currentDoc +
      `\n\n## TODO\n\n- [ ] First task\n- [ ] Second task\n- [ ] Third task\n`;
    reply = "Added a TODO section with placeholder tasks.";
  } else if (msg.includes("summarize") || msg.includes("summary")) {
    reply =
      "Your document covers the current sections with their content. It's structured and ready for further shaping.";
  } else if (msg.includes("clear") || msg.includes("reset")) {
    newDoc = "# Untitled\n\nStart writing...\n";
    reply = "Document cleared. A fresh canvas awaits.";
  } else if (msg.includes("title") || msg.includes("rename")) {
    const title =
      userMsg.replace(/.*(?:title|rename)\s*(?:to|it|this)?\s*/i, "").trim() ||
      "Untitled";
    newDoc = currentDoc.replace(/^#\s+.+/m, `# ${title}`);
    reply = `Updated the title to **${title}**.`;
  } else {
    reply = `I understand you want to: "${userMsg}". Try:\n\n- "Add a section about [topic]"\n- "Add a todo list"\n- "Rename to [new title]"\n- "Clear the document"`;
  }
  return { reply, newDoc };
}

// --- Store context ---
export interface StoreState {
  apps: App[];
  activeId: string;
  sidebarOpen: boolean;
  viewMode: ViewMode;
  showHistory: boolean;
  showCommitDialog: boolean;
  toast: string | null;
  isTyping: boolean;
  input: string;
  loaded: boolean;
}

export interface StoreActions {
  setApps: React.Dispatch<React.SetStateAction<App[]>>;
  setActiveId: React.Dispatch<React.SetStateAction<string>>;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  setShowHistory: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCommitDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setToast: React.Dispatch<React.SetStateAction<string | null>>;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  updateApp: (id: string, updater: (a: App) => Partial<App>) => void;
}

export const StoreContext = createContext<(StoreState & StoreActions) | null>(
  null
);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// --- Persistence hook ---
export function useAutoPersist(state: StoreState) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Persist apps
  useEffect(() => {
    if (!state.loaded) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveApps(state.apps);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [state.apps, state.loaded]);

  // Persist preferences
  const prefsDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!state.loaded) return;
    clearTimeout(prefsDebounceRef.current);
    prefsDebounceRef.current = setTimeout(() => {
      savePreferences({
        activeId: state.activeId,
        sidebarOpen: state.sidebarOpen,
        viewMode: state.viewMode,
      });
    }, 300);
    return () => clearTimeout(prefsDebounceRef.current);
  }, [state.activeId, state.sidebarOpen, state.viewMode, state.loaded]);
}

// --- Load from persistence ---
export async function loadInitialState(): Promise<{
  apps: App[];
  activeId: string;
  sidebarOpen: boolean;
  viewMode: ViewMode;
}> {
  const data = await loadAll();
  if (data && data.apps.length > 0) {
    // Restore nextId so new apps don't collide
    const maxIdNum = data.apps.reduce((max, a) => {
      const num = parseInt(a.id.replace("app-", ""), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 1);
    nextId = maxIdNum + 1;

    return {
      apps: data.apps,
      activeId: data.preferences?.activeId || data.apps[0].id,
      sidebarOpen: data.preferences?.sidebarOpen ?? true,
      viewMode: data.preferences?.viewMode ?? "rendered",
    };
  }
  return {
    apps: [createInitialApp()],
    activeId: "app-1",
    sidebarOpen: true,
    viewMode: "rendered",
  };
}

// Re-export for convenience
export { useCallback };
