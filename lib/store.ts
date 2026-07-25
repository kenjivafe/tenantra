import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { DB_VERSION, createSeedDatabase } from "@/lib/seed";
import type { Database } from "@/lib/types";

// On serverless hosts (Vercel) the project directory is read-only; only the
// system temp dir is writable. Locally we keep the store beside the project so
// demo data survives restarts. Either way an in-memory cache backs every read,
// so a failed write never breaks the app — it just isn't shared across instances.
const DATA_DIR = process.env.VERCEL ? path.join(os.tmpdir(), "tenantra") : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "tenantra.json");

type Cache = { db: Database | null };

// Next.js re-evaluates modules on hot reload; the global keeps the demo data alive.
const globalCache = globalThis as typeof globalThis & { __tenantraStore?: Cache };
const cache: Cache = (globalCache.__tenantraStore ??= { db: null });

function readFromDisk(): Database | null {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as Database;
    return parsed.version === DB_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

/** Disk is a convenience, not a requirement — read-only filesystems fall back to memory. */
function writeToDisk(db: Database) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // Ignore: the in-memory copy stays authoritative for this process.
  }
}

export function getDb(): Database {
  if (cache.db) return cache.db;

  const fromDisk = readFromDisk();
  if (fromDisk) {
    cache.db = fromDisk;
    return fromDisk;
  }

  const seeded = createSeedDatabase(new Date());
  cache.db = seeded;
  writeToDisk(seeded);
  return seeded;
}

/** Applies a mutation to the live database and persists the result. */
export function mutate<T>(fn: (db: Database) => T): T {
  const db = getDb();
  const result = fn(db);
  writeToDisk(db);
  return result;
}

export function resetDb(): Database {
  const seeded = createSeedDatabase(new Date());
  cache.db = seeded;
  writeToDisk(seeded);
  return seeded;
}

export function nextId(prefix: string, existing: Array<{ id: string }>) {
  let max = 0;
  for (const item of existing) {
    const numeric = Number(item.id.split("-").pop());
    if (Number.isFinite(numeric) && numeric > max) max = numeric;
  }
  return `${prefix}-${String(max + 1).padStart(5, "0")}`;
}
