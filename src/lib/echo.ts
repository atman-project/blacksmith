import { isDesktop } from "./platform";
import { initWeb } from "@echo-web";

// Cross-target echo node adapter.
// Web → WASM (iroh, relay-mediated). Desktop → Tauri invoke (native iroh).
// `@echo-web` resolves to the real wasm-loading module on web builds and to a
// throwing stub on desktop builds (see vite.config.ts). The stub keeps the
// wasm chunk out of the Tauri bundle.

export type EchoEvent =
  | { type: "accepted"; endpointId: string }
  | { type: "echoed"; endpointId: string; bytesSent: number }
  | { type: "closed"; endpointId?: string; error?: string }
  | { type: "connected" }
  | { type: "sent"; bytesSent: number }
  | { type: "received"; bytesReceived: number };

export interface EchoAdapter {
  endpointId(): string;
  connect(peer: string, payload: string): Promise<void>;
  onAccept(cb: (e: EchoEvent) => void): () => void;
  onConnect(cb: (e: EchoEvent) => void): () => void;
}

let adapter: EchoAdapter | null = null;
let initPromise: Promise<EchoAdapter> | null = null;

export function initEcho(): Promise<EchoAdapter> {
  // Concurrent callers must share one in-flight init.
  // React StrictMode invokes effects twice in dev, so initEcho() can be called
  // twice before the first call resolves.
  // So, return the existing promise if init is already in-flight.
  if (adapter) return Promise.resolve(adapter);
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const a = isDesktop ? await initDesktop() : await initWeb();
    adapter = a;
    console.log("[echo] endpoint id:", a.endpointId());
    console.log(
      "[echo] paste this into another instance's SYNC menu to receive payloads",
    );
    return a;
  })();
  return initPromise;
}

export function getEcho(): EchoAdapter | null {
  return adapter;
}

// --- Desktop (Tauri) ---

async function initDesktop(): Promise<EchoAdapter> {
  const { invoke } = await import("@tauri-apps/api/core");
  const { listen } = await import("@tauri-apps/api/event");

  const endpointId = await invoke<string>("echo_endpoint_id");

  const acceptListeners = new Set<(e: EchoEvent) => void>();
  const connectListeners = new Set<(e: EchoEvent) => void>();

  await listen<EchoEvent>("echo-accept", (e) => {
    console.log("[echo] accept:", e.payload);
    acceptListeners.forEach((cb) => cb(e.payload));
  });
  await listen<EchoEvent>("echo-connect", (e) => {
    console.log("[echo] connect:", e.payload);
    connectListeners.forEach((cb) => cb(e.payload));
  });

  return {
    endpointId: () => endpointId,
    async connect(peer, payload) {
      await invoke("echo_connect", { peer, payload });
    },
    onAccept(cb) {
      acceptListeners.add(cb);
      return () => acceptListeners.delete(cb);
    },
    onConnect(cb) {
      connectListeners.add(cb);
      return () => connectListeners.delete(cb);
    },
  };
}
