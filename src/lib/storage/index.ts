import { isDesktop } from "../platform";
import { FsStorage } from "./fs";
import { IndexedDbStorage } from "./indexeddb";
import type { Storage } from "./types";

export const storage: Storage = isDesktop
  ? new FsStorage()
  : new IndexedDbStorage();
