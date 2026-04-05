import { useMemo } from "react";
import { Icons } from "./Icons";
import { useStore } from "../lib/store";
import { renderMarkdown } from "../lib/markdown";

function RenderedMarkdown({ content }: { content: string }) {
  const html = useMemo(() => renderMarkdown(content), [content]);
  return (
    <div
      className="rendered-md"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function Editor() {
  const { apps, activeId, viewMode, setViewMode, updateApp } = useStore();
  const app = apps.find((a) => a.id === activeId) || apps[0];
  const isDirty = app.doc !== app.lastCommittedDoc;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-elevated)",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "10px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
            }}
          >
            DOCUMENT
          </span>
          {isDirty && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--accent)",
                opacity: 0.7,
              }}
            >
              (modified)
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              color: "var(--text-muted)",
            }}
          >
            {app.doc.split("\n").length} lines
          </span>
          <div
            style={{
              display: "flex",
              borderRadius: 5,
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setViewMode("rendered")}
              onMouseEnter={(e) => {
                const lbl = e.currentTarget.querySelector(
                  "[data-label]"
                ) as HTMLElement | null;
                if (lbl) {
                  lbl.style.width = "auto";
                  lbl.style.opacity = "1";
                  lbl.style.marginLeft = "4px";
                }
              }}
              onMouseLeave={(e) => {
                const lbl = e.currentTarget.querySelector(
                  "[data-label]"
                ) as HTMLElement | null;
                if (lbl) {
                  lbl.style.width = "0";
                  lbl.style.opacity = "0";
                  lbl.style.marginLeft = "0";
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 7px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.1s",
                background:
                  viewMode === "rendered"
                    ? "var(--surface-hover)"
                    : "transparent",
                color:
                  viewMode === "rendered"
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
              }}
            >
              <Icons.Eye />
              <span
                data-label=""
                style={{
                  overflow: "hidden",
                  width: 0,
                  opacity: 0,
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                Preview
              </span>
            </button>
            <button
              onClick={() => setViewMode("markdown")}
              onMouseEnter={(e) => {
                const lbl = e.currentTarget.querySelector(
                  "[data-label]"
                ) as HTMLElement | null;
                if (lbl) {
                  lbl.style.width = "auto";
                  lbl.style.opacity = "1";
                  lbl.style.marginLeft = "4px";
                }
              }}
              onMouseLeave={(e) => {
                const lbl = e.currentTarget.querySelector(
                  "[data-label]"
                ) as HTMLElement | null;
                if (lbl) {
                  lbl.style.width = "0";
                  lbl.style.opacity = "0";
                  lbl.style.marginLeft = "0";
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 7px",
                border: "none",
                borderLeft: "1px solid var(--border)",
                cursor: "pointer",
                transition: "all 0.1s",
                background:
                  viewMode === "markdown"
                    ? "var(--surface-hover)"
                    : "transparent",
                color:
                  viewMode === "markdown"
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
              }}
            >
              <Icons.Code />
              <span
                data-label=""
                style={{
                  overflow: "hidden",
                  width: 0,
                  opacity: 0,
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                Markdown
              </span>
            </button>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {viewMode === "markdown" ? (
          <textarea
            className="note-editor"
            value={app.doc}
            onChange={(e) =>
              updateApp(activeId, () => ({ doc: e.target.value }))
            }
            spellCheck={false}
          />
        ) : (
          <RenderedMarkdown content={app.doc} />
        )}
      </div>
    </div>
  );
}
