import type { App, UIPreferences } from "../../types";

export interface Storage {
  saveApps(apps: App[]): Promise<void>;
  savePreferences(prefs: UIPreferences): Promise<void>;
  saveApiKey(key: string): Promise<void>;
  loadApiKey(): Promise<string | undefined>;
  loadAll(): Promise<{
    apps: App[];
    preferences: UIPreferences | undefined;
  } | null>;
}
