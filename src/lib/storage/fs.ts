import {
  BaseDirectory,
  exists,
  mkdir,
  readDir,
  readTextFile,
  remove,
  rename,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import type { App, Commit, Message, UIPreferences } from "../../types";
import type { Storage } from "./types";

const BASE = { baseDir: BaseDirectory.AppData } as const;
const APPS_DIR = "apps";
const APPS_INDEX = "apps.json";
const PREFS_FILE = "preferences.json";
const APIKEY_FILE = "apikey";

interface AppMeta {
  id: string;
  lastCommittedDoc: string;
}

async function ensureDir(path: string) {
  if (!(await exists(path, BASE))) {
    await mkdir(path, { ...BASE, recursive: true });
  }
}

async function atomicWrite(path: string, content: string) {
  const tmp = `${path}.tmp`;
  await writeTextFile(tmp, content, BASE);
  await rename(tmp, path, {
    oldPathBaseDir: BaseDirectory.AppData,
    newPathBaseDir: BaseDirectory.AppData,
  });
}

export class FsStorage implements Storage {
  async saveApps(apps: App[]): Promise<void> {
    await ensureDir(APPS_DIR);

    for (const app of apps) {
      const dir = `${APPS_DIR}/${app.id}`;
      await ensureDir(dir);
      const meta: AppMeta = {
        id: app.id,
        lastCommittedDoc: app.lastCommittedDoc,
      };
      await atomicWrite(`${dir}/doc.md`, app.doc);
      await atomicWrite(`${dir}/meta.json`, JSON.stringify(meta, null, 2));
      await atomicWrite(
        `${dir}/chat.json`,
        JSON.stringify(app.messages, null, 2),
      );
      await atomicWrite(
        `${dir}/commits.json`,
        JSON.stringify(app.commits, null, 2),
      );
    }

    const ids = new Set(apps.map((a) => a.id));
    const entries = await readDir(APPS_DIR, BASE);
    for (const entry of entries) {
      if (entry.isDirectory && !ids.has(entry.name)) {
        await remove(`${APPS_DIR}/${entry.name}`, {
          ...BASE,
          recursive: true,
        });
      }
    }

    await atomicWrite(
      APPS_INDEX,
      JSON.stringify(
        apps.map((a) => a.id),
        null,
        2,
      ),
    );
  }

  async savePreferences(prefs: UIPreferences): Promise<void> {
    await atomicWrite(PREFS_FILE, JSON.stringify(prefs, null, 2));
  }

  async saveApiKey(key: string): Promise<void> {
    // TODO(Step 6): Move to OS keychain (macOS Keychain / Windows Credential
    // Manager / Linux Secret Service). Plaintext for Phase 1 only.
    await atomicWrite(APIKEY_FILE, key);
  }

  async loadApiKey(): Promise<string | undefined> {
    try {
      if (!(await exists(APIKEY_FILE, BASE))) return undefined;
      return await readTextFile(APIKEY_FILE, BASE);
    } catch {
      return undefined;
    }
  }

  async loadAll(): Promise<{
    apps: App[];
    preferences: UIPreferences | undefined;
  } | null> {
    try {
      if (!(await exists(APPS_INDEX, BASE))) return null;

      const ids: string[] = JSON.parse(await readTextFile(APPS_INDEX, BASE));
      const apps: App[] = [];
      for (const id of ids) {
        const dir = `${APPS_DIR}/${id}`;
        const [doc, metaJson, chatJson, commitsJson] = await Promise.all([
          readTextFile(`${dir}/doc.md`, BASE),
          readTextFile(`${dir}/meta.json`, BASE),
          readTextFile(`${dir}/chat.json`, BASE),
          readTextFile(`${dir}/commits.json`, BASE),
        ]);
        const meta: AppMeta = JSON.parse(metaJson);
        const messages: Message[] = JSON.parse(chatJson);
        const commits: Commit[] = JSON.parse(commitsJson);
        apps.push({
          id: meta.id,
          doc,
          lastCommittedDoc: meta.lastCommittedDoc,
          messages,
          commits,
        });
      }

      let preferences: UIPreferences | undefined;
      if (await exists(PREFS_FILE, BASE)) {
        try {
          preferences = JSON.parse(await readTextFile(PREFS_FILE, BASE));
        } catch {
          preferences = undefined;
        }
      }

      return { apps, preferences };
    } catch {
      return null;
    }
  }
}
