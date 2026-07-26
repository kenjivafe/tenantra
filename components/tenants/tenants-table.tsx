"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyRow, TableShell, Td, Th } from "@/components/ui/table";
import type { TenantRow } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";

const PAGE_SIZE = 12;
type StatusFilter = "all" | "current" | "overdue" | "ended";

export function TenantsTable({
  rows,
  locations,
}: {
  rows: TenantRow[];
  locations: Array<{ id: string; name: string }>;
}) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [location, setLocation] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const counts = useMemo(
    () => ({
      all: rows.length,
      current: rows.filter((row) => row.status === "current").length,
      overdue: rows.filter((row) => row.status === "overdue").length,
      ended: rows.filter((row) => row.status === "ended").length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (location !== "all" && row.locationName !== location) return false;
      if (!needle) return true;
      return (
        row.name.toLowerCase().includes(needle) ||
        row.email.toLowerCase().includes(needle) ||
        (row.unitCode?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [rows, status, location, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const reset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ButtonLink href="/tenants/new">Add Tenant</ButtonLink>
        <input
          type="search"
          value={query}
          onChange={(event) => reset(setQuery)(event.target.value)}
          placeholder="Search tenant, email, or unit"
          className="h-11 min-w-[15rem] flex-1 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary placeholder:text-text-muted sm:max-w-xs sm:flex-none"
        />
      </div>

      <Card className="bg-panel" padding="md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <FilterChips
            value={status}
            onChange={reset(setStatus)}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "current", label: "Current", count: counts.current },
              { value: "overdue", label: "Overdue", count: counts.overdue },
              { value: "ended", label: "Ended", count: counts.ended },
            ]}
          />
          <select
            aria-label="Filter by location"
            value={location}
            onChange={(event) => reset(setLocation)(event.target.value)}
            className="h-11 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary"
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <TableShell>
          <thead>
            <tr className="border-b border-border/40">
              <Th>Tenant</Th>
              <Th>Unit</Th>
              <Th>Rent</Th>
              <Th>Lease Ends</Th>
              <Th>Next Due</Th>
              <Th>Electric</Th>
              <Th>Water</Th>
              <Th>Balance</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <EmptyRow colSpan={10} message="No tenants match these filters." />
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-b border-border/20">
                  <Td className="font-medium">
                    {row.name}
                    <span className="block text-xs text-text-muted">{row.email}</span>
                  </Td>
                  <Td>
                    {row.unitCode ?? "—"}
                    {row.locationName ? <span className="block text-xs text-text-muted">{row.locationName}</span> : null}
                  </Td>
                  <Td>{formatMoney(row.monthlyRent)}</Td>
                  <Td>{formatDate(row.leaseEnd)}</Td>
                  <Td>
                    {row.nextDueDate ? (
                      <>
                        {formatDate(row.nextDueDate)}
                        <span className="block text-xs text-text-muted">{formatMoney(row.nextDueAmount)}</span>
                      </>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </Td>
                  <Td>{formatMoney(row.currentElectric)}</Td>
                  <Td>{formatMoney(row.currentWater)}</Td>
                  <Td className={row.balance > 0 ? "font-semibold text-status-danger" : ""}>{formatMoney(row.balance)}</Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                  <Td>
                    <Link href={`/tenants/${row.id}`} className="text-sm font-medium text-accent transition hover:underline">
                      View
                    </Link>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>

        <Pagination page={safePage} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>
    </div>
  );
}
