// Ambient stub for the wasm-bindgen output that lands at src/wasm/echo_node.js
// after `pnpm build:wasm`. Lets tsc compile when the wasm build hasn't been run
// (e.g. the desktop CI matrix, which ships the native iroh adapter and aliases
// the web adapter to a stub). When the real .d.ts is present, TypeScript
// prefers it over this ambient declaration.
declare module "*/wasm/echo_node.js" {
  const init: () => Promise<unknown>;
  export default init;
  export class EchoNode {
    static spawn(): Promise<EchoNode>;
    endpoint_id(): string;
    events(): ReadableStream;
    connect(peer: string, payload: string): ReadableStream;
  }
}
