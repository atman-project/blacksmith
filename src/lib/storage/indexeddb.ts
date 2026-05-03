import { openDB, type IDBPDatabase } from "idb";
import type { App, UIPreferences } from "../../types";
import type { Storage } from "./types";

const DB_NAME = "blacksmith-db";
const DB_VERSION = 1;
const APPS_STORE = "apps";
const PREFS_STORE = "preferences";

export class IndexedDbStorage implements Storage {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  private getDB() {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(APPS_STORE)) {
            db.createObjectStore(APPS_STORE, { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains(PREFS_STORE)) {
            db.createObjectStore(PREFS_STORE);
          }
        },
      });
    }
    return this.dbPromise;
  }

  async saveApps(apps: App[]): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(APPS_STORE, "readwrite");
    const store = tx.objectStore(APPS_STORE);
    await store.clear();
    for (const app of apps) {
      await store.put(app);
    }
    await tx.done;
  }

  async savePreferences(prefs: UIPreferences): Promise<void> {
    const db = await this.getDB();
    await db.put(PREFS_STORE, prefs, "ui");
  }

  async saveApiKey(keyId: string, key: string): Promise<void> {
    const db = await this.getDB();
    const existing = ((await db.get(PREFS_STORE, "apiKeys")) ?? {}) as Record<
      string,
      string
    >;
    if (key) {
      existing[keyId] = key;
    } else {
      delete existing[keyId];
    }
    await db.put(PREFS_STORE, existing, "apiKeys");
  }

  async loadApiKeys(): Promise<Record<string, string>> {
    try {
      const db = await this.getDB();
      return ((await db.get(PREFS_STORE, "apiKeys")) ?? {}) as Record<
        string,
        string
      >;
    } catch {
      return {};
    }
  }

  async loadAll(): Promise<{
    apps: App[];
    preferences: UIPreferences | undefined;
  } | null> {
    try {
      const db = await this.getDB();
      const apps = await db.getAll(APPS_STORE);
      const preferences = await db.get(PREFS_STORE, "ui");
      return {
        apps: apps as App[],
        preferences: preferences as UIPreferences | undefined,
      };
    } catch {
      return null;
    }
  }
}
