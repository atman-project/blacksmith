import { useMemo } from "react";
import { Icons } from "./Icons";
import { computeDiff, computeInlineDiff } from "../lib/diff";

interface DiffViewProps {
  oldDoc: string;
  newDoc: string;
  commitMsg: string;
  commitTime: string;
  commitHash?: string;
  onBack: () => void;
  onRestore?: (() => void) | null;
}

export function DiffView({
  oldDoc,
  newDoc,
  commitMsg,
  commitTime,
  commitHash,
  onBack,
  onRestore,
}: DiffViewProps) {
  const diff = useMemo(() => computeDiff(oldDoc, newDoc), [oldDoc, newDoc]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: 4,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            transition: "color 0.1s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <Icons.Back />
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            {commitMsg}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 3,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {commitTime}
            </span>
            {commitHash && (
              <span
                style={{
                  fontSize: 10,
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                  background: "var(--accent-glow)",
                  padding: "1px 5px",
                  borderRadius: 3,
                }}
              >
                {commitHash}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "8px 16px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
        }}
      >
        <span style={{ color: "#4ae28a" }}>+{diff.additions}</span>
        <span style={{ color: "#e25a5a" }}>-{diff.deletions}</span>
        {diff.additions + diff.deletions > 0 && (
          <div style={{ display: "flex", gap: 1, alignItems: "center" }}>
            {Array.from({ length: Math.min(diff.additions, 20) }).map(
              (_, i) => (
                <div
                  key={`a${i}`}
                  style={{
                    width: 5,
                    height: 5,
                    background: "#4ae28a",
                    borderRadius: 1,
                    opacity: 0.7,
                  }}
                />
              )
            )}
            {Array.from({ length: Math.min(diff.deletions, 20) }).map(
              (_, i) => (
                <div
                  key={`d${i}`}
                  style={{
                    width: 5,
                    height: 5,
                    background: "#e25a5a",
                    borderRadius: 1,
                    opacity: 0.7,
                  }}
                />
              )
            )}
          </div>
        )}
        <div style={{ flex: 1 }} />
        {onRestore && (
          <button
            onClick={onRestore}
            style={{
              fontSize: 11,
              color: "var(--accent)",
              background: "none",
              border: "1px solid var(--accent-dim)",
              borderRadius: 4,
              padding: "3px 10px",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.02em",
            }}
          >
            RESTORE
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "4px 0" }}>
        {diff.hunks.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            No changes
          </div>
        ) : (
          diff.hunks.map((hunk, hi) => (
            <div key={hi}>
              {hi > 0 && (
                <div
                  style={{
                    padding: "6px 0",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    textAlign: "center",
                    background: "var(--surface)",
                    borderTop: "1px solid var(--border-subtle)",
                    borderBottom: "1px solid var(--border-subtle)",
                    letterSpacing: "0.3em",
                  }}
                >
                  ...
                </div>
              )}
              {hunk.lines.map((line, li) => {
                const isAdd = line.type === "add";
                const isDel = line.type === "del";
                return (
                  <div
                    key={`${hi}-${li}`}
                    style={{
                      display: "flex",
                      fontSize: 12,
                      lineHeight: "22px",
                      fontFamily: "var(--font-mono)",
                      background: isAdd
                        ? "rgba(74,226,138,0.06)"
                        : isDel
                          ? "rgba(226,90,90,0.06)"
                          : "transparent",
                      borderLeft: `3px solid ${isAdd ? "rgba(74,226,138,0.5)" : isDel ? "rgba(226,90,90,0.5)" : "transparent"}`,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        flexShrink: 0,
                        textAlign: "right",
                        paddingRight: 4,
                        color: isDel
                          ? "rgba(226,90,90,0.4)"
                          : isAdd
                            ? "transparent"
                            : "var(--border)",
                        userSelect: "none",
                        fontSize: 10.5,
                      }}
                    >
                      {!isAdd ? line.oldNum || "" : ""}
                    </div>
                    <div
                      style={{
                        width: 36,
                        flexShrink: 0,
                        textAlign: "right",
                        paddingRight: 8,
                        color: isAdd
                          ? "rgba(74,226,138,0.4)"
                          : isDel
                            ? "transparent"
                            : "var(--border)",
                        userSelect: "none",
                        fontSize: 10.5,
                      }}
                    >
                      {!isDel ? line.newNum || "" : ""}
                    </div>
                    <div
                      style={{
                        width: 16,
                        flexShrink: 0,
                        textAlign: "center",
                        color: isAdd
                          ? "#4ae28a"
                          : isDel
                            ? "#e25a5a"
                            : "transparent",
                        fontWeight: 700,
                        userSelect: "none",
                      }}
                    >
                      {isAdd ? "+" : isDel ? "\u2212" : " "}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        paddingRight: 12,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        color: isAdd
                          ? "#4ae28a"
                          : isDel
                            ? "#e25a5a"
                            : "var(--text-secondary)",
                        opacity: isAdd || isDel ? 1 : 0.6,
                      }}
                    >
                      {(() => {
                        if (!line.pair || !line.content)
                          return line.content || "\u00A0";
                        const inline = computeInlineDiff(
                          isDel ? line.content : line.pair.content,
                          isAdd ? line.content : line.pair.content
                        );
                        const segments = isDel
                          ? inline.oldSegments
                          : inline.newSegments;
                        const hlColor = isAdd
                          ? "rgba(74,226,138,0.25)"
                          : "rgba(226,90,90,0.25)";
                        return segments.map((seg, si) =>
                          seg.highlight ? (
                            <span
                              key={si}
                              style={{
                                background: hlColor,
                                borderRadius: 2,
                                padding: "1px 0",
                              }}
                            >
                              {seg.text}
                            </span>
                          ) : (
                            <span key={si}>{seg.text}</span>
                          )
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
