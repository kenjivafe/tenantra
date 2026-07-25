"use client";

import { cn } from "@/lib/cn";

type Props = {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, pageCount, total, pageSize, onChange }: Props) {
  if (total === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const buttonClass =
    "rounded-control border border-border/60 px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:bg-accentSoft disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
      <span>
        Showing {first}–{last} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button type="button" className={buttonClass} onClick={() => onChange(1)} disabled={page === 1}>
          First
        </button>
        <button type="button" className={buttonClass} onClick={() => onChange(page - 1)} disabled={page === 1}>
          Prev
        </button>
        <span className={cn("px-2 font-semibold text-text-primary")}>
          {page} / {pageCount}
        </span>
        <button type="button" className={buttonClass} onClick={() => onChange(page + 1)} disabled={page >= pageCount}>
          Next
        </button>
        <button type="button" className={buttonClass} onClick={() => onChange(pageCount)} disabled={page >= pageCount}>
          Last
        </button>
      </div>
    </div>
  );
}
