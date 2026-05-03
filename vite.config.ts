import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  const target = process.env.TAURI_ENV_PLATFORM ? "desktop" : "web";
  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_TARGET": JSON.stringify(target),
    },
    resolve: {
      alias: {
        // Swap the WASM-backed echo adapter for a stub on desktop builds so
        // the iroh wasm chunk doesn't ship inside the Tauri bundle.
        "@echo-web": path.resolve(
          __dirname,
          target === "desktop"
            ? "src/lib/echo-web.stub.ts"
            : "src/lib/echo-web.ts",
        ),
      },
    },
    server: {
      watch: { ignored: ["**/src-tauri/**"] },
    },
  };
});
