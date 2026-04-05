import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDone: () => void;
}

export function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    const duration = message.length > 50 ? 5000 : 2500;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "10px 20px",
        borderRadius: 8,
        fontSize: 13,
        fontFamily: "var(--font-mono)",
        background: "var(--surface-elevated)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        animation: "slideUp 0.25s ease-out",
        zIndex: 300,
        letterSpacing: "0.01em",
      }}
    >
      {message}
    </div>
  );
}
