import { Icons } from "./Icons";
import { useStore, extractTitle, createNewApp } from "../lib/store";

export function Sidebar() {
  const {
    apps,
    activeId,
    sidebarOpen,
    setSidebarOpen,
    setActiveId,
    setApps,
    setShowHistory,
    setInput,
  } = useStore();

  const handleSwitchApp = (id: string) => {
    setActiveId(id);
    setShowHistory(false);
    setInput("");
  };

  const handleDeleteApp = (id: string) => {
    const remaining = apps.filter((a) => a.id !== id);
    if (remaining.length === 0) {
      const fresh = createNewApp();
      setApps([fresh]);
      setActiveId(fresh.id);
      return;
    }
    setApps(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  };

  const SIDEBAR_W = sidebarOpen ? 220 : 48;

  return (
    <div
      style={{
        width: SIDEBAR_W,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border)",
        transition: "width 0.2s ease",
        overflow: "hidden",
      }}
    >
      {/* Sidebar header */}
      <div
        style={{
          height: 52,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: sidebarOpen ? "0 12px" : "0",
          justifyContent: sidebarOpen ? "space-between" : "center",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {sidebarOpen && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
            }}
          >
            APPS
          </span>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: 6,
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
          <Icons.Sidebar />
        </button>
      </div>

      {/* App list */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: sidebarOpen ? "8px" : "8px 4px",
        }}
      >
        {apps.map((a) => {
          const title = extractTitle(a.doc);
          const isActive = a.id === activeId;
          const hasChanges = a.doc !== a.lastCommittedDoc;
          if (!sidebarOpen) {
            return (
              <div
                key={a.id}
                onClick={() => handleSwitchApp(a.id)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  margin: "4px auto",
                  position: "relative",
                  background: isActive ? "var(--accent-glow)" : "transparent",
                  border: isActive
                    ? "1px solid var(--accent-dim)"
                    : "1px solid transparent",
                  color: isActive ? "var(--accent)" : "var(--text-muted)",
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const tip = document.getElementById(`tip-${a.id}`);
                  if (tip) {
                    tip.style.opacity = "1";
                    tip.style.top = `${rect.top + rect.height / 2}px`;
                    tip.style.left = `${rect.right + 8}px`;
                  }
                }}
                onMouseLeave={() => {
                  const tip = document.getElementById(`tip-${a.id}`);
                  if (tip) tip.style.opacity = "0";
                }}
              >
                <Icons.File />
              </div>
            );
          }
          return (
            <div
              key={a.id}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              onClick={() => handleSwitchApp(a.id)}
              onMouseEnter={(e) => {
                const btn = e.currentTarget.querySelector(
                  "[data-delete]"
                ) as HTMLElement | null;
                if (btn) btn.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget.querySelector(
                  "[data-delete]"
                ) as HTMLElement | null;
                if (btn) btn.style.opacity = "0";
              }}
            >
              <Icons.File />
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 12.5,
                }}
              >
                {title}
              </span>
              {hasChanges && (
                <span style={{ color: "var(--accent)", flexShrink: 0 }}>
                  <Icons.Dot />
                </span>
              )}
              <button
                data-delete=""
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteApp(a.id);
                }}
                style={{
                  opacity: 0,
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  transition: "opacity 0.1s, color 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#e25a5a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
              >
                <Icons.Trash />
              </button>
            </div>
          );
        })}
      </div>

      {/* New app button */}
      <NewAppButton />
    </div>
  );
}

function NewAppButton() {
  const { sidebarOpen, setApps, setActiveId, setShowHistory, setInput } =
    useStore();

  const handleNewApp = () => {
    const newApp = createNewApp();
    setApps((prev) => [...prev, newApp]);
    setActiveId(newApp.id);
    setShowHistory(false);
    setInput("");
  };

  return (
    <div
      style={{
        padding: sidebarOpen ? "8px 12px" : "8px 4px",
        borderTop: "1px solid var(--border)",
      }}
    >
      {sidebarOpen ? (
        <button
          onClick={handleNewApp}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px 0",
            borderRadius: 6,
            border: "1px dashed var(--border)",
            background: "transparent",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.04em",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-dim)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <Icons.Plus /> NEW APP
        </button>
      ) : (
        <button
          onClick={handleNewApp}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px dashed var(--border)",
            background: "transparent",
            color: "var(--text-muted)",
            cursor: "pointer",
            margin: "0 auto",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-dim)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <Icons.Plus />
        </button>
      )}
    </div>
  );
}
