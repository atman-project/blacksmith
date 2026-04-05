import { openDB, type IDBPDatabase } from "idb";
import type { App, UIPreferences } from "../types";

const DB_NAME = "blacksmith-db";
const DB_VERSION = 1;
const APPS_STORE = "apps";
const PREFS_STORE = "preferences";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
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
  return dbPromise;
}

export async function saveApps(apps: App[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(APPS_STORE, "readwrite");
  const store = tx.objectStore(APPS_STORE);

  // Clear existing and write all
  await store.clear();
  for (const app of apps) {
    await store.put(app);
  }
  await tx.done;
}

export async function savePreferences(prefs: UIPreferences): Promise<void> {
  const db = await getDB();
  await db.put(PREFS_STORE, prefs, "ui");
}

export async function saveApiKey(key: string): Promise<void> {
  const db = await getDB();
  await db.put(PREFS_STORE, key, "apiKey");
}

export async function loadApiKey(): Promise<string | undefined> {
  try {
    const db = await getDB();
    return await db.get(PREFS_STORE, "apiKey");
  } catch {
    return undefined;
  }
}

export async function loadAll(): Promise<{
  apps: App[];
  preferences: UIPreferences | undefined;
} | null> {
  try {
    const db = await getDB();
    const apps = await db.getAll(APPS_STORE);
    const preferences = await db.get(PREFS_STORE, "ui");
    return { apps: apps as App[], preferences: preferences as UIPreferences | undefined };
  } catch {
    return null;
  }
}
