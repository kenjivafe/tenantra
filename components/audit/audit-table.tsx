"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyRow, TableShell, Td, Th } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

const PAGE_SIZE = 15;

export type AuditRow = {
  id: string;
  at: string;
  timestamp: string;
  actor: string;
  action: string;
  module: string;
  description: string;
  ip: string;
  success: boolean;
};

export function AuditTable({ rows }: { rows: AuditRow[] }) {
  const { push } = useToast();
  const [actor, setActor] = useState("all");
  const [action, setAction] = useState("all");
  const [module, setModule] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const actors = useMemo(() => Array.from(new Set(rows.map((row) => row.actor))), [rows]);
  const actions = useMemo(() => Array.from(new Set(rows.map((row) => row.action))), [rows]);
  const modules = useMemo(() => Array.from(new Set(rows.map((row) => row.module))), [rows]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const day = row.at.slice(0, 10);
      if (actor !== "all" && row.actor !== actor) return false;
      if (action !== "all" && row.action !== action) return false;
      if (module !== "all" && row.module !== module) return false;
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (!needle) return true;
      return row.description.toLowerCase().includes(needle);
    });
  }, [rows, actor, action, module, from, to, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportCsv = () => {
    const header = ["Timestamp", "User", "Action", "Module", "Description", "IP", "Result"];
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [
      header.join(","),
      ...filtered.map((row) =>
        [row.at, row.actor, row.action, row.module, row.description, row.ip, row.success ? "success" : "failed"]
          .map((value) => escape(String(value)))
          .join(","),
      ),
    ].join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `tenantra-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    push(`Exported ${filtered.length} log entries to CSV.`);
  };

  const selectClass =
    "h-11 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary";

  const reset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      <Card className="bg-panel" padding="md">
        <div className="flex flex-wrap items-center gap-3">
          <select aria-label="Filter by user" value={actor} onChange={(event) => reset(setActor)(event.target.value)} className={selectClass}>
            <option value="all">All Users</option>
            {actors.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select aria-label="Filter by action" value={action} onChange={(event) => reset(setAction)(event.target.value)} className={selectClass}>
            <option value="all">All Actions</option>
            {actions.map((name) => (
              <option key={name} value={name}>
                {name[0].toUpperCase() + name.slice(1)}
              </option>
            ))}
          </select>
          <select aria-label="Filter by module" value={module} onChange={(event) => reset(setModule)(event.target.value)} className={selectClass}>
            <option value="all">All Modules</option>
            {modules.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <input
            type="date"
            aria-label="From date"
            value={from}
            onChange={(event) => reset(setFrom)(event.target.value)}
            className={selectClass}
          />
          <input
            type="date"
            aria-label="To date"
            value={to}
            onChange={(event) => reset(setTo)(event.target.value)}
            className={selectClass}
          />
          <input
            type="search"
            value={query}
            onChange={(event) => reset(setQuery)(event.target.value)}
            placeholder="Search description"
            className="h-11 min-w-[14rem] flex-1 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary placeholder:text-text-muted"
          />
          <Button variant="secondary" onClick={exportCsv}>
            Export Logs
          </Button>
        </div>
      </Card>

      <Card className="bg-panel" padding="md">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold font-display text-text-primary">System Activity</h3>
          <p className="text-sm text-text-muted">
            {filtered.length} of {rows.length} entries
          </p>
        </div>

        <TableShell>
          <thead>
            <tr className="border-b border-border/40">
              <Th>Date</Th>
              <Th>User</Th>
              <Th>Action</Th>
              <Th>Module</Th>
              <Th>Description</Th>
              <Th>IP Address</Th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <EmptyRow colSpan={6} message="No log entries match these filters." />
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-b border-border/20">
                  <Td className="whitespace-nowrap">{row.timestamp}</Td>
                  <Td>{row.actor}</Td>
                  <Td>
                    <StatusBadge status={row.action} />
                  </Td>
                  <Td>{row.module}</Td>
                  <Td className={row.success ? "" : "text-status-danger"}>
                    {row.description}
                    {row.success ? null : <span className="ml-2 text-xs font-semibold">(failed)</span>}
                  </Td>
                  <Td className="whitespace-nowrap">{row.ip}</Td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>

        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </Card>
    </>
  );
}
