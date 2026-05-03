import { isDesktop } from "./platform";

// Cross-target echo node adapter.
// Web → WASM (iroh, relay-mediated). Desktop → Tauri invoke (native iroh).

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

// --- Web (WASM) ---

async function initWeb(): Promise<EchoAdapter> {
  const mod = await import("../wasm/echo_node.js");
  await mod.default();
  const node = await mod.EchoNode.spawn();

  const acceptListeners = new Set<(e: EchoEvent) => void>();
  const connectListeners = new Set<(e: EchoEvent) => void>();

  (async () => {
    const stream: ReadableStream = node.events();
    const reader = stream.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const ev = value as EchoEvent;
      console.log("[echo]", ev.type, ev);
      acceptListeners.forEach((cb) => cb(ev));
    }
  })();

  return {
    endpointId: () => node.endpoint_id(),
    async connect(peer, payload) {
      const stream: ReadableStream = node.connect(peer, payload);
      const reader = stream.getReader();
      (async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const ev = value as EchoEvent;
          console.log("[echo]", ev.type, ev);
          connectListeners.forEach((cb) => cb(ev));
        }
      })();
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

// --- Desktop (Tauri) ---

async function initDesktop(): Promise<EchoAdapter> {
  const { invoke } = await import("@tauri-apps/api/core");
  const { listen } = await import("@tauri-apps/api/event");

  const endpointId = await invoke<string>("echo_endpoint_id");

  const acceptListeners = new Set<(e: EchoEvent) => void>();
  const connectListeners = new Set<(e: EchoEvent) => void>();

  await listen<EchoEvent>("echo-accept", (e) => {
    console.log("[echo]", e.payload.type, e.payload);
    acceptListeners.forEach((cb) => cb(e.payload));
  });
  await listen<EchoEvent>("echo-connect", (e) => {
    console.log("[echo]", e.payload.type, e.payload);
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
