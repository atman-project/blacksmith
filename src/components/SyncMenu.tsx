import { useState, useRef, useEffect } from "react";
import { Icons } from "./Icons";
import { useStore } from "../lib/store";
import { getEcho } from "../lib/echo";

const PEERS_KEY = "echoPeers";
const PAYLOAD = "hello from blacksmith";

export function SyncMenu() {
  const { setToast } = useStore();
  const [open, setOpen] = useState(false);
  const [peers, setPeers] = useState(
    () => localStorage.getItem(PEERS_KEY) ?? "",
  );
  const ref = useRef<HTMLDivElement>(null);
  const myEndpoint = getEcho()?.endpointId() ?? null;

  const copyEndpoint = async () => {
    if (!myEndpoint) return;
    try {
      await navigator.clipboard.writeText(myEndpoint);
      setToast("Endpoint copied");
    } catch {
      setToast("Copy failed");
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const persist = (value: string) => {
    setPeers(value);
    localStorage.setItem(PEERS_KEY, value);
  };

  const handleSync = async () => {
    const echo = getEcho();
    if (!echo) {
      setToast("Echo node not ready yet");
      return;
    }
    const list = peers
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    if (list.length === 0) {
      setToast("Add at least one endpoint id");
      return;
    }
    setOpen(false);
    for (const peer of list) {
      try {
        await echo.connect(peer, PAYLOAD);
      } catch (err) {
        console.error("[echo] connect failed:", peer, err);
      }
    }
    setToast(`Sent payload to ${list.length} peer(s)`);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="toolbar-btn" onClick={() => setOpen(!open)}>
        <Icons.Sync /> SYNC
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            width: 320,
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            zIndex: 200,
            padding: 12,
            animation: "fadeIn 0.1s ease-out",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            MY ENDPOINT
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              padding: "8px 10px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              borderRadius: 4,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: myEndpoint ? "var(--text-primary)" : "var(--text-muted)",
              marginBottom: 12,
            }}
          >
            <span style={{ flex: 1, wordBreak: "break-all", userSelect: "all" }}>
              {myEndpoint ?? "starting…"}
            </span>
            {myEndpoint && (
              <button
                onClick={copyEndpoint}
                aria-label="Copy endpoint"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 2,
                  border: "none",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                <Icons.Copy />
              </button>
            )}
          </div>

          <div
            style={{
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            PEER ENDPOINTS (ONE PER LINE)
          </div>
          <textarea
            value={peers}
            onChange={(e) => persist(e.target.value)}
            placeholder="paste endpoint id..."
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: 100,
              padding: "8px 10px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              borderRadius: 4,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-primary)",
              outline: "none",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
          <button
            onClick={handleSync}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "7px 0",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              letterSpacing: "0.04em",
              borderRadius: 4,
              border: "none",
              background: "var(--accent)",
              color: "#000",
              cursor: "pointer",
            }}
          >
            SYNC
          </button>
        </div>
      )}
    </div>
  );
}
