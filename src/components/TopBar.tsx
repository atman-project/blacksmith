import { Icons } from "./Icons";
import { useStore } from "../lib/store";
import { SyncMenu } from "./SyncMenu";

export function TopBar() {
  const {
    apps,
    activeId,
    showHistory,
    setShowHistory,
    setShowCommitDialog,
    setToast,
    updateApp,
  } = useStore();

  const app = apps.find((a) => a.id === activeId) || apps[0];
  const isDirty = app.doc !== app.lastCommittedDoc;

  const handleRevert = () => {
    if (!isDirty) return;
    updateApp(activeId, (a) => ({ doc: a.lastCommittedDoc }));
    setToast("Reverted to last commit");
  };

  const handleCommit = () => {
    setShowCommitDialog(true);
  };

  return (
    <div
      style={{
        height: 52,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            color: "var(--accent)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Icons.Anvil />
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            color: "var(--text-primary)",
            letterSpacing: "0.01em",
          }}
        >
          Blacksmith
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
            padding: "2px 6px",
            borderRadius: 4,
            letterSpacing: "0.06em",
            marginLeft: 2,
          }}
        >
          FORGE
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isDirty && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginRight: 8,
              fontSize: 11,
              color: "var(--accent)",
              fontFamily: "var(--font-mono)",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <Icons.Dot /> UNSAVED
          </div>
        )}
        <button
          className="toolbar-btn"
          onClick={handleRevert}
          disabled={!isDirty}
        >
          <Icons.Undo /> REVERT
        </button>
        <button
          className="toolbar-btn accent"
          onClick={handleCommit}
          disabled={!isDirty}
        >
          <Icons.Save /> COMMIT
        </button>
        <button
          className="toolbar-btn"
          onClick={() => setShowHistory(!showHistory)}
        >
          <Icons.History /> HISTORY
          {app.commits.length > 0 && (
            <span
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent)",
                fontSize: 10,
                padding: "1px 5px",
                borderRadius: 10,
                fontWeight: 600,
              }}
            >
              {app.commits.length}
            </span>
          )}
        </button>
        <div
          style={{
            width: 1,
            height: 20,
            background: "var(--border)",
            margin: "0 4px",
          }}
        />
        <SyncMenu />
        <div
          style={{
            width: 1,
            height: 20,
            background: "var(--border)",
            margin: "0 4px",
          }}
        />
        <button
          className="toolbar-btn"
          onClick={() => setToast("Publish is coming soon")}
        >
          <Icons.Publish /> PUBLISH
        </button>
      </div>
    </div>
  );
}
