import { useState, useRef, useEffect } from "react";

interface CommitDialogProps {
  onCommit: (message: string) => void;
  onCancel: () => void;
}

export function CommitDialog({ onCommit, onCancel }: CommitDialogProps) {
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.15s ease-out",
      }}
    >
      <div
        style={{
          background: "var(--surface-elevated)",
          borderRadius: 10,
          padding: 24,
          width: 380,
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 16,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.02em",
          }}
        >
          COMMIT CHANGES
        </div>
        <input
          ref={inputRef}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && msg.trim()) onCommit(msg.trim());
          }}
          placeholder="Describe your changes..."
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 13,
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text-primary)",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "var(--font-body)",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 16,
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "7px 16px",
              fontSize: 12,
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
            }}
          >
            CANCEL
          </button>
          <button
            onClick={() => msg.trim() && onCommit(msg.trim())}
            style={{
              padding: "7px 16px",
              fontSize: 12,
              borderRadius: 6,
              border: "none",
              background: msg.trim() ? "var(--accent)" : "var(--border)",
              color: msg.trim() ? "#000" : "var(--text-muted)",
              cursor: msg.trim() ? "pointer" : "default",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
            }}
          >
            COMMIT
          </button>
        </div>
      </div>
    </div>
  );
}
