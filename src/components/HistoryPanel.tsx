import { useState } from "react";
import { Icons } from "./Icons";
import { DiffView } from "./DiffView";
import { computeDiff } from "../lib/diff";
import type { Commit } from "../types";

interface HistoryPanelProps {
  commits: Commit[];
  onRestore: (commit: Commit) => void;
  onClose: () => void;
  initialDoc: string;
}

export function HistoryPanel({
  commits,
  onRestore,
  onClose,
  initialDoc,
}: HistoryPanelProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const getPrevDoc = (idx: number) =>
    idx === commits.length - 1 ? initialDoc : commits[idx + 1].doc;

  if (selectedIdx !== null) {
    const c = commits[selectedIdx];
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 520,
          background: "var(--surface-elevated)",
          borderLeft: "1px solid var(--border)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          animation: "slideIn 0.2s ease-out",
        }}
      >
        <DiffView
          oldDoc={getPrevDoc(selectedIdx)}
          newDoc={c.doc}
          commitMsg={c.message}
          commitTime={c.time}
          commitHash={c.hash}
          onBack={() => setSelectedIdx(null)}
          onRestore={
            selectedIdx > 0
              ? () => {
                  onRestore(c);
                  setSelectedIdx(null);
                }
              : null
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: 340,
        background: "var(--surface-elevated)",
        borderLeft: "1px solid var(--border)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        animation: "slideIn 0.2s ease-out",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "0.02em",
          }}
        >
          HISTORY
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: 4,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Icons.Close />
        </button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px" }}>
        {commits.length === 0 ? (
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: 13,
              padding: "20px 0",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
            }}
          >
            No commits yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {commits.map((c, i) => {
              const stats = computeDiff(getPrevDoc(i), c.doc);
              return (
                <div
                  key={i}
                  style={{ display: "flex", gap: 12, position: "relative" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: 8,
                        background:
                          i === 0 ? "var(--accent)" : "var(--text-muted)",
                        opacity: i === 0 ? 1 : 0.4,
                        border:
                          i === 0
                            ? "2px solid var(--accent-dim)"
                            : "2px solid transparent",
                        boxSizing: "border-box",
                      }}
                    />
                    {i < commits.length - 1 && (
                      <div
                        style={{
                          width: 1.5,
                          flex: 1,
                          background: "var(--border)",
                          marginTop: 4,
                          marginBottom: 4,
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      paddingBottom: 16,
                      cursor: "pointer",
                      borderRadius: 6,
                      padding: "6px 8px",
                      marginLeft: -4,
                      transition: "background 0.1s",
                    }}
                    onClick={() => setSelectedIdx(i)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--surface-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        marginBottom: 3,
                      }}
                    >
                      {c.message}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {c.time}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                          color: "var(--accent)",
                          background: "var(--accent-glow)",
                          padding: "0 4px",
                          borderRadius: 2,
                          opacity: 0.8,
                        }}
                      >
                        {c.hash}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                          color: "#4ae28a",
                          opacity: 0.7,
                        }}
                      >
                        +{stats.additions}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                          color: "#e25a5a",
                          opacity: 0.7,
                        }}
                      >
                        -{stats.deletions}
                      </span>
                    </div>
                    {i > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestore(c);
                        }}
                        style={{
                          marginTop: 6,
                          fontSize: 11,
                          color: "var(--accent)",
                          background: "none",
                          border: "1px solid var(--accent-dim)",
                          borderRadius: 4,
                          padding: "2px 8px",
                          cursor: "pointer",
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        RESTORE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
