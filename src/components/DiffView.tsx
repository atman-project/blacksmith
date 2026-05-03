import { useMemo } from "react";
import { Icons } from "./Icons";
import { computeDiff, isAdd, isDel, parsePatch } from "../lib/diff";

interface DiffViewProps {
  oldDoc: string;
  newDoc: string;
  commitMsg: string;
  commitTime: string;
  commitHash?: string;
  onBack: () => void;
  onRestore?: (() => void) | null;
}

const ADD_FG = "#4ae28a";
const DEL_FG = "#e25a5a";
const ADD_BG = "rgba(74,226,138,0.08)";
const DEL_BG = "rgba(226,90,90,0.08)";
const ADD_HL = "rgba(74,226,138,0.3)";
const DEL_HL = "rgba(226,90,90,0.3)";

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
  const lines = useMemo(() => parsePatch(diff.patch), [diff.patch]);

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
        <span style={{ color: ADD_FG }}>+{diff.additions}</span>
        <span style={{ color: DEL_FG }}>-{diff.deletions}</span>
        {diff.additions + diff.deletions > 0 && (
          <div style={{ display: "flex", gap: 1, alignItems: "center" }}>
            {Array.from({ length: Math.min(diff.additions, 20) }).map((_, i) => (
              <div
                key={`a${i}`}
                style={{
                  width: 5,
                  height: 5,
                  background: ADD_FG,
                  borderRadius: 1,
                  opacity: 0.7,
                }}
              />
            ))}
            {Array.from({ length: Math.min(diff.deletions, 20) }).map((_, i) => (
              <div
                key={`d${i}`}
                style={{
                  width: 5,
                  height: 5,
                  background: DEL_FG,
                  borderRadius: 1,
                  opacity: 0.7,
                }}
              />
            ))}
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
            LOAD
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "4px 0" }}>
        {lines.length === 0 ? (
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
          lines.map(({ raw, segments }, i) => {
            const c = raw[0];
            const add = isAdd(raw);
            const del = isDel(raw);
            const color = add
              ? ADD_FG
              : del
                ? DEL_FG
                : c === "@"
                  ? "var(--accent)"
                  : raw.startsWith("---") ||
                      raw.startsWith("+++") ||
                      raw.startsWith("Index:") ||
                      raw.startsWith("===")
                    ? "var(--text-muted)"
                    : "var(--text-secondary)";
            const background = add ? ADD_BG : del ? DEL_BG : "transparent";
            const hl = add ? ADD_HL : DEL_HL;
            return (
              <div
                key={i}
                style={{
                  fontSize: 12,
                  lineHeight: "20px",
                  fontFamily: "var(--font-mono)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  padding: "0 16px",
                  color,
                  background,
                }}
              >
                {segments
                  ? [
                      <span key="p" style={{ fontWeight: 700 }}>
                        {c}
                      </span>,
                      ...segments.map((seg, si) =>
                        seg.changed ? (
                          <span
                            key={si}
                            style={{
                              background: hl,
                              borderRadius: 2,
                              padding: "1px 0",
                            }}
                          >
                            {seg.text}
                          </span>
                        ) : (
                          <span key={si}>{seg.text}</span>
                        )
                      ),
                    ]
                  : raw || "\u00A0"}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
