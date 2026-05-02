export const isDesktop =
  import.meta.env.VITE_TARGET === "desktop" ||
  (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window);

export const isWeb = !isDesktop;
