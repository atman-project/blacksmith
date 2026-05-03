import type { EchoAdapter, EchoEvent } from "./echo";

export async function initWeb(): Promise<EchoAdapter> {
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
      console.log("[echo] accept:", ev);
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
          console.log("[echo] connect:", ev);
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
