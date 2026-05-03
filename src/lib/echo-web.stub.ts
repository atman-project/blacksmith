import type { EchoAdapter } from "./echo";

// Vite swaps in this stub for `@echo-web` on desktop builds (see vite.config.ts).
// `initWeb` (which loads WASM) isn't necessary for desktop.
export function initWeb(): Promise<EchoAdapter> {
  return Promise.reject(
    new Error("[echo] web adapter is not available in desktop builds"),
  );
}
