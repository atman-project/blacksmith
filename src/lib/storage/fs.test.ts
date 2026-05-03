import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { App, UIPreferences } from "../../types";

// Per-test tempdir acting as $APPDATA. Set in beforeEach; closures below read it lazily.
let tmpDir = "";
const pathInTmpDir = (relativePath: string) => join(tmpDir, relativePath);

// In-memory keychain backing the mocked invoke() below. Keyed by keyId.
const keychain = new Map<string, string>();

vi.mock("@tauri-apps/api/core", () => ({
  invoke: async (
    cmd: string,
    args?: { keyId?: string; key?: string },
  ) => {
    switch (cmd) {
      case "get_api_key":
        return keychain.get(args!.keyId!) ?? null;
      case "set_api_key":
        keychain.set(args!.keyId!, args!.key!);
        return undefined;
      case "delete_api_key":
        keychain.delete(args!.keyId!);
        return undefined;
      default:
        throw new Error(`unmocked invoke: ${cmd}`);
    }
  },
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  BaseDirectory: { AppData: 0 },
  exists: async (relativePath: string) => {
    try {
      await stat(pathInTmpDir(relativePath));
      return true;
    } catch {
      return false;
    }
  },
  mkdir: async (relativePath: string, opts?: { recursive?: boolean }) => {
    await mkdir(pathInTmpDir(relativePath), { recursive: opts?.recursive });
  },
  writeTextFile: async (relativePath: string, content: string) => {
    await writeFile(pathInTmpDir(relativePath), content);
  },
  readTextFile: async (relativePath: string) =>
    readFile(pathInTmpDir(relativePath), "utf8"),
  rename: async (oldRelativePath: string, newRelativePath: string) => {
    await rename(pathInTmpDir(oldRelativePath), pathInTmpDir(newRelativePath));
  },
  remove: async (relativePath: string, opts?: { recursive?: boolean }) => {
    await rm(pathInTmpDir(relativePath), {
      recursive: opts?.recursive,
      force: true,
    });
  },
  readDir: async (relativePath: string) => {
    const entries = await readdir(pathInTmpDir(relativePath), {
      withFileTypes: true,
    });
    return entries.map((e) => ({
      name: e.name,
      isDirectory: e.isDirectory(),
      isFile: e.isFile(),
      isSymlink: e.isSymbolicLink(),
    }));
  },
}));

const { FsStorage } = await import("./fs");

function makeApp(id: string, doc = "hello"): App {
  return {
    id,
    doc,
    lastCommittedDoc: doc,
    messages: [{ role: "assistant", content: "hi" }],
    commits: [{ message: "init", doc, time: "2026-05-01", hash: "abc" }],
  };
}

const PREFS: UIPreferences = {
  activeId: "app-1",
  sidebarOpen: true,
  viewMode: "rendered",
  modelId: "claude-sonnet",
};

async function pathExists(absolutePath: string) {
  try {
    await stat(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "blacksmith-test-"));
  keychain.clear();
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe("FsStorage", () => {
  it("returns null from loadAll when apps.json is missing", async () => {
    const storage = new FsStorage();
    expect(await storage.loadAll()).toBeNull();
  });

  it("roundtrips apps and preferences", async () => {
    const storage = new FsStorage();
    const apps = [makeApp("app-1"), makeApp("app-2", "world")];
    await storage.saveApps(apps);
    await storage.savePreferences(PREFS);

    const data = await storage.loadAll();
    expect(data?.apps).toEqual(apps);
    expect(data?.preferences).toEqual(PREFS);
  });

  it("writes the expected file layout", async () => {
    const storage = new FsStorage();
    await storage.saveApps([makeApp("app-1", "body")]);

    expect(await readFile(pathInTmpDir("apps/app-1/doc.md"), "utf8")).toBe(
      "body",
    );
    expect(
      JSON.parse(await readFile(pathInTmpDir("apps/app-1/meta.json"), "utf8")),
    ).toEqual({
      id: "app-1",
      lastCommittedDoc: "body",
    });
    expect(
      JSON.parse(await readFile(pathInTmpDir("apps/app-1/chat.json"), "utf8")),
    ).toEqual([{ role: "assistant", content: "hi" }]);
    expect(
      JSON.parse(
        await readFile(pathInTmpDir("apps/app-1/commits.json"), "utf8"),
      ),
    ).toHaveLength(1);
    expect(
      JSON.parse(await readFile(pathInTmpDir("apps.json"), "utf8")),
    ).toEqual(["app-1"]);
  });

  it("prunes apps that were removed on the next save", async () => {
    const storage = new FsStorage();
    await storage.saveApps([makeApp("app-1"), makeApp("app-2")]);
    expect(await pathExists(pathInTmpDir("apps/app-2/doc.md"))).toBe(true);

    await storage.saveApps([makeApp("app-1")]);
    expect(await pathExists(pathInTmpDir("apps/app-2"))).toBe(false);
    expect(
      JSON.parse(await readFile(pathInTmpDir("apps.json"), "utf8")),
    ).toEqual(["app-1"]);
  });

  it("uses atomic writes (no .tmp files left behind)", async () => {
    const storage = new FsStorage();
    await storage.saveApps([makeApp("app-1")]);
    await storage.savePreferences(PREFS);

    const allFiles = await walk(tmpDir);
    for (const filePath of allFiles) {
      expect(filePath.endsWith(".tmp")).toBe(false);
    }
  });

  it("roundtrips multiple API keys via the OS keychain", async () => {
    const storage = new FsStorage();
    expect(await storage.loadApiKeys()).toEqual({});

    await storage.saveApiKey("claude-sonnet", "sk-anthropic");
    await storage.saveApiKey("ollama", "ollama-key");

    expect(keychain.get("claude-sonnet")).toBe("sk-anthropic");
    expect(keychain.get("ollama")).toBe("ollama-key");
    expect(await storage.loadApiKeys()).toEqual({
      "claude-sonnet": "sk-anthropic",
      ollama: "ollama-key",
    });
  });

  it("clears a single keychain entry when saving an empty key", async () => {
    const storage = new FsStorage();
    await storage.saveApiKey("claude-sonnet", "sk-anthropic");
    await storage.saveApiKey("ollama", "ollama-key");

    await storage.saveApiKey("ollama", "");
    expect(keychain.has("ollama")).toBe(false);
    expect(await storage.loadApiKeys()).toEqual({
      "claude-sonnet": "sk-anthropic",
    });
  });
});
