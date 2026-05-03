import { Icons } from "./Icons";

export function MobileGate() {
  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <div style={{ color: "var(--accent)", display: "flex" }}>
          <Icons.Anvil />
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            letterSpacing: "0.01em",
          }}
        >
          Blacksmith
        </span>
      </div>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          lineHeight: 1.2,
          fontWeight: 400,
          marginBottom: 14,
          maxWidth: 420,
        }}
      >
        Blacksmith works best on its native app.
      </h1>

      <p
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          lineHeight: 1.55,
          maxWidth: 360,
          marginBottom: 32,
        }}
      >
        Your data stays on your device. Get the app for the full experience.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
          maxWidth: 280,
        }}
      >
        <StoreButton label="App Store" sublabel="Coming soon" />
        <StoreButton label="Google Play" sublabel="Coming soon" />
      </div>

      <p
        style={{
          marginTop: 36,
          fontSize: 11.5,
          fontFamily: "var(--font-mono)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
        }}
      >
        Open on desktop to use the web version
      </p>
    </div>
  );
}

function StoreButton({ label, sublabel }: { label: string; sublabel: string }) {
  return (
    <button
      disabled
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        padding: "12px 18px",
        background: "var(--surface-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        color: "var(--text-secondary)",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: 500,
        cursor: "not-allowed",
        opacity: 0.7,
      }}
    >
      <span>{label}</span>
      <span
        style={{
          fontSize: 10.5,
          fontFamily: "var(--font-mono)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
        }}
      >
        {sublabel}
      </span>
    </button>
  );
}
