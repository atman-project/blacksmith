import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";
import type { App, UIPreferences } from "../../types";
import { IndexedDbStorage } from "./indexeddb";

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

beforeEach(() => {
  // Fresh IDB universe per test so cached dbPromises in prior instances don't leak.
  globalThis.indexedDB = new IDBFactory();
});

describe("IndexedDbStorage", () => {
  it("returns empty data from loadAll when nothing is stored", async () => {
    const storage = new IndexedDbStorage();
    const data = await storage.loadAll();
    expect(data).toEqual({ apps: [], preferences: undefined });
  });

  it("roundtrips apps and preferences", async () => {
    const storage = new IndexedDbStorage();
    const apps = [makeApp("app-1"), makeApp("app-2", "world")];
    await storage.saveApps(apps);
    await storage.savePreferences(PREFS);

    const data = await storage.loadAll();
    expect(data?.apps).toEqual(apps);
    expect(data?.preferences).toEqual(PREFS);
  });

  it("saveApps replaces previous apps (no leftover entries)", async () => {
    const storage = new IndexedDbStorage();
    await storage.saveApps([makeApp("app-1"), makeApp("app-2")]);
    await storage.saveApps([makeApp("app-2", "updated")]);

    const data = await storage.loadAll();
    expect(data?.apps).toHaveLength(1);
    expect(data?.apps[0].id).toBe("app-2");
    expect(data?.apps[0].doc).toBe("updated");
  });

  it("roundtrips API keys for multiple keyIds", async () => {
    const storage = new IndexedDbStorage();
    expect(await storage.loadApiKeys()).toEqual({});

    await storage.saveApiKey("claude-sonnet", "sk-anthropic");
    await storage.saveApiKey("ollama", "ollama-key");
    expect(await storage.loadApiKeys()).toEqual({
      "claude-sonnet": "sk-anthropic",
      ollama: "ollama-key",
    });
  });

  it("clears a single API key when saving an empty string", async () => {
    const storage = new IndexedDbStorage();
    await storage.saveApiKey("claude-sonnet", "sk-anthropic");
    await storage.saveApiKey("ollama", "ollama-key");

    await storage.saveApiKey("ollama", "");
    expect(await storage.loadApiKeys()).toEqual({
      "claude-sonnet": "sk-anthropic",
    });
  });
});
