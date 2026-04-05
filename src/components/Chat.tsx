import { useRef, useEffect, useCallback } from "react";
import { Icons } from "./Icons";
import { useStore, getAIResponse } from "../lib/store";

export function Chat() {
  const {
    apps,
    activeId,
    input,
    setInput,
    isTyping,
    setIsTyping,
    updateApp,
  } = useStore();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const app = apps.find((a) => a.id === activeId) || apps[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [app.messages, isTyping]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    updateApp(activeId, (a) => ({
      messages: [...a.messages, { role: "user", content: trimmed }],
    }));
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const currentApp = apps.find((a) => a.id === activeId);
      const { reply, newDoc } = getAIResponse(
        trimmed,
        currentApp?.doc || ""
      );
      updateApp(activeId, (a) => ({
        doc: newDoc,
        messages: [
          ...a.messages,
          { role: "user" as const, content: trimmed },
          { role: "assistant" as const, content: reply },
        ].filter((m, i, arr) => {
          if (m.role === "user" && m.content === trimmed && i > 0) {
            const prevSame = arr
              .slice(0, i)
              .filter((x) => x.role === "user" && x.content === trimmed)
              .length;
            return prevSame === 0;
          }
          return true;
        }),
      }));
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  }, [input, activeId, apps, updateApp, setInput, setIsTyping]);

  return (
    <div
      style={{
        width: 380,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icons.Branch />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11.5,
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
          }}
        >
          FORGE CHAT
        </span>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {app.messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  m.role === "user" ? "flex-end" : "flex-start",
                animation: "fadeIn 0.25s ease-out",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  lineHeight: 1.6,
                  background:
                    m.role === "user"
                      ? "var(--user-bubble)"
                      : "transparent",
                  color:
                    m.role === "user"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  border:
                    m.role === "user"
                      ? "1px solid var(--border)"
                      : "none",
                  fontFamily: "var(--font-body)",
                }}
              >
                {m.content.split("\n").map((line, j) => (
                  <div
                    key={j}
                    style={{ marginBottom: line === "" ? 8 : 0 }}
                  >
                    {line.split(/(\*\*[^*]+\*\*)/g).map((part, k) => {
                      if (
                        part.startsWith("**") &&
                        part.endsWith("**")
                      )
                        return (
                          <strong
                            key={k}
                            style={{
                              color: "var(--text-primary)",
                              fontWeight: 600,
                            }}
                          >
                            {part.slice(2, -2)}
                          </strong>
                        );
                      return <span key={k}>{part}</span>;
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {isTyping && (
            <div
              style={{ display: "flex", gap: 4, padding: "10px 4px" }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--text-muted)",
                    animation: `pulse 1.2s ${i * 0.15}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Shape your document..."
          rows={1}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <Icons.Send />
        </button>
      </div>
    </div>
  );
}
