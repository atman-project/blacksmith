import { useSyncExternalStore } from "react";
import { isWeb } from "./platform";

const QUERY = "(max-width: 768px) and (pointer: coarse)";

function subscribe(cb: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

// Returns true only on web mobile viewports (small + coarse pointer).
// Desktop Tauri builds always return false so the gate never shows there.
export function useIsMobileWeb(): boolean {
  const mobile = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return isWeb && mobile;
}
