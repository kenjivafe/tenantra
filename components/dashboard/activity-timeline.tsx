"use client";

import { useMemo, useState } from "react";

import { FilterChips } from "@/components/ui/filter-chips";
import { cn } from "@/lib/cn";

export type ActivityItem = {
  id: string;
  /** Pre-formatted on the server so SSR and hydration agree on the clock. */
  relative: string;
  module: string;
  description: string;
  actor: string;
  action: string;
  success: boolean;
};

const DOT_TONE: Record<string, string> = {
  create: "bg-status-success",
  update: "bg-accent",
  delete: "bg-status-danger",
  login: "bg-text-muted",
};

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  const [module, setModule] = useState("All");

  const options = useMemo(() => {
    const modules = Array.from(new Set(items.map((item) => item.module)));
    return [{ value: "All", label: "All" }, ...modules.map((name) => ({ value: name, label: name }))];
  }, [items]);

  const visible = useMemo(
    () => (module === "All" ? items : items.filter((item) => item.module === module)).slice(0, 8),
    [items, module],
  );

  return (
    <div>
      <FilterChips options={options} value={module} onChange={setModule} className="mb-4" />

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">No activity recorded for {module}.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {visible.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    item.success ? (DOT_TONE[item.action] ?? "bg-accent") : "bg-status-danger",
                  )}
                />
                <div className="min-w-0">
                  <p className="truncate text-text-secondary" title={item.description}>
                    {item.description}
                  </p>
                  <p className="text-xs text-text-muted">
                    {item.module} · {item.actor}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-text-muted">{item.relative}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
