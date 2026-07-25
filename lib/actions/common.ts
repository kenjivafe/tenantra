import { revalidatePath } from "next/cache";

import { mutate } from "@/lib/store";
import type { ActionResult, AuditAction, Database } from "@/lib/types";

export function ok(message: string): ActionResult {
  return { ok: true, message, at: Date.now() };
}

export function fail(message: string): ActionResult {
  return { ok: false, message, at: Date.now() };
}

/** Every mutation touches shared aggregates, so the whole admin tree is refreshed. */
export function revalidateAll() {
  revalidatePath("/", "layout");
}

export function recordAudit(
  db: Database,
  action: AuditAction,
  module: string,
  description: string,
  success = true,
) {
  const id = `log-${String(db.auditLogs.length + 1).padStart(5, "0")}-${Date.now().toString(36)}`;
  db.auditLogs.unshift({
    id,
    at: new Date().toISOString(),
    actor: db.settings.adminName,
    action,
    module,
    description,
    ip: "127.0.0.1",
    success,
  });
}

/** Runs a mutation, writes an audit entry, and revalidates the admin tree. */
export function withAudit<T>(
  action: AuditAction,
  module: string,
  fn: (db: Database) => { result: T; description: string },
): T {
  const value = mutate((db) => {
    const { result, description } = fn(db);
    recordAudit(db, action, module, description);
    return result;
  });
  revalidateAll();
  return value;
}

export function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function readNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number(readString(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

export function readBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}
