import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const target = process.env.TAURI_ENV_PLATFORM ? "desktop" : "web";
  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_TARGET": JSON.stringify(target),
    },
    server: {
      watch: { ignored: ["**/src-tauri/**"] },
    },
  };
});
