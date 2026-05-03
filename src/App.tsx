import { useState, useEffect, useCallback } from "react";
import type { App as AppType, ViewMode, ModelId } from "./types";
import {
  StoreContext,
  INITIAL_DOC,
  createInitialApp,
  extractTitle,
  loadInitialState,
  useAutoPersist,
  saveApiKey,
} from "./lib/store";
import { resetClient } from "./lib/ai";
import { Sidebar } from "./components/Sidebar";
import { Chat } from "./components/Chat";
import { Editor } from "./components/Editor";
import { TopBar } from "./components/TopBar";
import { HistoryPanel } from "./components/HistoryPanel";
import { CommitDialog } from "./components/CommitDialog";
import { Toast } from "./components/Toast";

export default function App() {
  const [apps, setApps] = useState<AppType[]>([createInitialApp()]);
  const [activeId, setActiveId] = useState("app-1");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("rendered");
  const [modelId, setModelId] = useState<ModelId>("claude-sonnet");
  const [apiKeys, setApiKeysState] = useState<Partial<Record<ModelId, string>>>(
    {},
  );
  const [loaded, setLoaded] = useState(false);

  const setApiKey = useCallback((modelId: ModelId, key: string) => {
    setApiKeysState((prev) => {
      const next = { ...prev };
      if (key) next[modelId] = key;
      else delete next[modelId];
      return next;
    });
    saveApiKey(modelId, key);
    resetClient();
  }, []);

  // Load persisted state
  useEffect(() => {
    loadInitialState().then((data) => {
      setApps(data.apps);
      setActiveId(data.activeId);
      setSidebarOpen(data.sidebarOpen);
      setViewMode(data.viewMode);
      setModelId(data.modelId);
      setApiKeysState(data.apiKeys);
      setLoaded(true);
    });
  }, []);

  const updateApp = useCallback(
    (id: string, updater: (a: AppType) => Partial<AppType>) => {
      setApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updater(a) } : a))
      );
    },
    []
  );

  const app = apps.find((a) => a.id === activeId) || apps[0];

  const handleCommit = (message: string) => {
    const now = new Date();
    const time = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const hash = Math.random().toString(36).slice(2, 9);
    updateApp(activeId, (a) => ({
      commits: [{ message, doc: a.doc, time, hash }, ...a.commits],
      lastCommittedDoc: a.doc,
      head: hash,
    }));
    setShowCommitDialog(false);
    setToast(`Committed: ${message}`);
  };

  const handleRestore = (commit: { doc: string; message: string; hash: string }) => {
    updateApp(activeId, () => ({
      doc: commit.doc,
      lastCommittedDoc: commit.doc,
      head: commit.hash,
    }));
    setShowHistory(false);
    setToast(`Loaded: ${commit.message}`);
  };

  const storeValue = {
    apps,
    activeId,
    sidebarOpen,
    viewMode,
    modelId,
    apiKeys,
    showHistory,
    showCommitDialog,
    toast,
    isTyping,
    input,
    loaded,
    setApps,
    setActiveId,
    setSidebarOpen,
    setViewMode,
    setModelId,
    setApiKey,
    setShowHistory,
    setShowCommitDialog,
    setToast,
    setIsTyping,
    setInput,
    updateApp,
  };

  // Auto-persist to IndexedDB
  useAutoPersist(storeValue);

  if (!loaded) return null;

  return (
    <StoreContext.Provider value={storeValue}>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          background: "var(--surface)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
          overflow: "hidden",
        }}
      >
        {/* APP SIDEBAR */}
        <Sidebar />

        {/* MAIN AREA */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* TOP BAR */}
          <TopBar />

          {/* WORKSPACE */}
          <div
            style={{
              flex: 1,
              display: "flex",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* CHAT */}
            <Chat />

            {/* NOTE VIEW */}
            <Editor />

            {showHistory && (
              <HistoryPanel
                commits={app.commits}
                head={app.head}
                onRestore={handleRestore}
                onClose={() => setShowHistory(false)}
                initialDoc={
                  app.lastCommittedDoc ===
                  app.commits[app.commits.length - 1]?.doc
                    ? INITIAL_DOC
                    : app.lastCommittedDoc
                }
              />
            )}
          </div>
        </div>

        {showCommitDialog && (
          <CommitDialog
            onCommit={handleCommit}
            onCancel={() => setShowCommitDialog(false)}
          />
        )}
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}

        {/* Tooltips for collapsed sidebar */}
        {!sidebarOpen &&
          apps.map((a) => (
            <div
              key={`tip-${a.id}`}
              id={`tip-${a.id}`}
              style={{
                position: "fixed",
                transform: "translateY(-50%)",
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontSize: 11.5,
                fontFamily: "var(--font-body)",
                padding: "5px 10px",
                borderRadius: 5,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                opacity: 0,
                transition: "opacity 0.15s ease",
                pointerEvents: "none",
                zIndex: 999,
              }}
            >
              {extractTitle(a.doc)}
            </div>
          ))}
      </div>
    </StoreContext.Provider>
  );
}
