import { useState, useRef, useEffect } from "react";
import { useStore } from "../lib/store";
import { MODEL_OPTIONS } from "../types";
import type { ModelId } from "../types";

export function ModelSelector() {
  const { modelId, setModelId, setToast, apiKey, setApiKey } = useStore();
  const [open, setOpen] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = MODEL_OPTIONS.find((m) => m.id === modelId)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (id: ModelId, available: boolean) => {
    if (!available) {
      setToast("Coming soon");
      return;
    }
    setModelId(id);
    setOpen(false);
  };

  const categories = [
    { label: "CLOUD", models: MODEL_OPTIONS.filter((m) => m.category === "cloud") },
    { label: "LOCAL", models: MODEL_OPTIONS.filter((m) => m.category === "local") },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 8px",
          borderRadius: 4,
          border: "1px solid var(--border)",
          background: "transparent",
          color: "var(--text-muted)",
          cursor: "pointer",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.03em",
          transition: "all 0.1s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent-dim)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.color = "var(--text-muted)";
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: selected.category === "cloud" ? "var(--accent)" : "#4ae28a",
          }}
        />
        {selected.label}
        <svg
          width="8"
          height="8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            width: 180,
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            zIndex: 200,
            overflow: "hidden",
            animation: "fadeIn 0.1s ease-out",
          }}
        >
          {categories.map((cat) => (
            <div key={cat.label}>
              <div
                style={{
                  padding: "8px 12px 4px",
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                  letterSpacing: "0.08em",
                }}
              >
                {cat.label}
              </div>
              {cat.models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m.id, m.available)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 12px",
                    border: "none",
                    background:
                      m.id === modelId ? "var(--accent-glow)" : "transparent",
                    color: m.available
                      ? "var(--text-secondary)"
                      : "var(--text-muted)",
                    cursor: m.available ? "pointer" : "default",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    textAlign: "left",
                    transition: "background 0.1s",
                    opacity: m.available ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    if (m.available)
                      e.currentTarget.style.background = "var(--surface-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      m.id === modelId ? "var(--accent-glow)" : "transparent";
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background:
                        m.category === "cloud" ? "var(--accent)" : "#4ae28a",
                      opacity: m.available ? 1 : 0.4,
                    }}
                  />
                  <span style={{ flex: 1 }}>{m.label}</span>
                  {!m.available && (
                    <span
                      style={{
                        fontSize: 8,
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      Coming soon
                    </span>
                  )}
                  {m.id === modelId && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          ))}

          {/* API Key section */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding: "6px 12px 8px",
            }}
          >
            {showKeyInput ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                    letterSpacing: "0.08em",
                  }}
                >
                  API KEY
                </div>
                <input
                  type="password"
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && keyDraft.trim()) {
                      setApiKey(keyDraft.trim());
                      setShowKeyInput(false);
                      setOpen(false);
                      setToast("API key saved");
                    }
                  }}
                  placeholder="sk-ant-..."
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "5px 8px",
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    borderRadius: 4,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text-primary)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setShowKeyInput(false)}
                    style={{
                      padding: "3px 8px",
                      fontSize: 9,
                      fontFamily: "var(--font-mono)",
                      borderRadius: 3,
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => {
                      if (keyDraft.trim()) {
                        setApiKey(keyDraft.trim());
                        setShowKeyInput(false);
                        setOpen(false);
                        setToast("API key saved");
                      }
                    }}
                    style={{
                      padding: "3px 8px",
                      fontSize: 9,
                      fontFamily: "var(--font-mono)",
                      borderRadius: 3,
                      border: "none",
                      background: keyDraft.trim() ? "var(--accent)" : "var(--border)",
                      color: keyDraft.trim() ? "#000" : "var(--text-muted)",
                      cursor: keyDraft.trim() ? "pointer" : "default",
                      fontWeight: 600,
                    }}
                  >
                    SAVE
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setKeyDraft(apiKey);
                  setShowKeyInput(true);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 0",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  transition: "color 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                {apiKey ? "Change API key" : "Set API key"}
                {apiKey && (
                  <span style={{ marginLeft: "auto", color: "#4ae28a", fontSize: 8 }}>
                    configured
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
