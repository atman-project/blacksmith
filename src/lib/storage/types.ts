import type { App, UIPreferences } from "../../types";

export interface Storage {
  saveApps(apps: App[]): Promise<void>;
  savePreferences(prefs: UIPreferences): Promise<void>;
  saveApiKey(keyId: string, key: string): Promise<void>;
  loadApiKeys(): Promise<Record<string, string>>;
  loadAll(): Promise<{
    apps: App[];
    preferences: UIPreferences | undefined;
  } | null>;
}
