"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Field, InlineSubmit, SelectField, SubmitButton, TextField } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyRow, TableShell, Td, Th } from "@/components/ui/table";
import { useActionToast } from "@/components/ui/toast";
import { createUnitAction, deleteUnitAction, updateUnitAction } from "@/lib/actions/units";
import type { UnitRow } from "@/lib/data";
import { formatMoney, titleCase } from "@/lib/format";

const PAGE_SIZE = 12;
type CategoryFilter = "all" | "commercial" | "residential";
type StatusFilter = "all" | "occupied" | "vacant" | "maintenance";

export function UnitsTable({
  rows,
  locations,
}: {
  rows: UnitRow[];
  locations: Array<{ id: string; name: string }>;
}) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [location, setLocation] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<UnitRow | null>(null);

  const [createState, createAction] = useActionState(createUnitAction, null);
  const [updateState, updateAction] = useActionState(updateUnitAction, null);
  const [deleteState, deleteAction] = useActionState(deleteUnitAction, null);

  useActionToast(createState, () => setAdding(false));
  useActionToast(updateState, () => setEditing(null));
  useActionToast(deleteState);

  const counts = useMemo(
    () => ({
      all: rows.length,
      commercial: rows.filter((row) => row.category === "commercial").length,
      residential: rows.filter((row) => row.category === "residential").length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (category !== "all" && row.category !== category) return false;
      if (status !== "all" && row.status !== status) return false;
      if (location !== "all" && row.locationName !== location) return false;
      if (!needle) return true;
      return (
        row.code.toLowerCase().includes(needle) ||
        (row.tenantName?.toLowerCase().includes(needle) ?? false) ||
        row.electricMeterNo.toLowerCase().includes(needle) ||
        row.waterMeterNo.toLowerCase().includes(needle)
      );
    });
  }, [rows, category, status, location, query]);

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
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setAdding(true)}>Add Unit</Button>
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
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => reset(setStatus)(event.target.value as StatusFilter)}
            className="h-11 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary"
          >
            <option value="all">All Statuses</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => reset(setQuery)(event.target.value)}
          placeholder="Search unit, tenant, or meter #"
          className="h-11 min-w-[14rem] flex-1 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary placeholder:text-text-muted sm:max-w-xs sm:flex-none"
        />
      </div>

      <Card className="bg-panel" padding="md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold font-display text-text-primary">Units</h3>
          <FilterChips
            value={category}
            onChange={reset(setCategory)}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "commercial", label: "Commercial", count: counts.commercial },
              { value: "residential", label: "Residential", count: counts.residential },
            ]}
          />
        </div>

        <TableShell>
          <thead>
            <tr className="border-b border-border/40">
              <Th>Unit</Th>
              <Th>Location</Th>
              <Th>Type</Th>
              <Th>Rent</Th>
              <Th>Elec. Meter</Th>
              <Th>Water Meter</Th>
              <Th>Tenant</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <EmptyRow colSpan={9} message="No units match these filters." />
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-b border-border/20">
                  <Td label="Unit" className="font-medium">{row.code}</Td>
                  <Td label="Location">{row.locationName}</Td>
                  <Td label="Type">
                    {titleCase(row.category)}
                    <span className="block text-xs text-text-muted">{row.tenancy === "long-term" ? "Long-term" : "Short-term"}</span>
                  </Td>
                  <Td label="Rent">{formatMoney(row.rent)}</Td>
                  <Td label="Elec. meter" className="text-xs">{row.electricMeterNo}</Td>
                  <Td label="Water meter" className="text-xs">{row.waterMeterNo}</Td>
                  <Td label="Tenant">
                    {row.tenantId ? (
                      <Link href={`/tenants/${row.tenantId}`} className="text-accent hover:underline">
                        {row.tenantName}
                      </Link>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </Td>
                  <Td label="Status">
                    <StatusBadge status={row.status} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEditing(row)}
                        className="text-sm font-medium text-accent transition hover:underline"
                      >
                        Manage
                      </button>
                      <form action={deleteAction} className="inline">
                        <input type="hidden" name="unitId" value={row.id} />
                        <InlineSubmit tone="danger" pendingLabel="…">
                          Delete
                        </InlineSubmit>
                      </form>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>

        <Pagination page={safePage} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>

      {/* Add unit */}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add Unit" description="Create a unit in the inventory.">
        <form action={createAction} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location">
              <SelectField name="locationId" defaultValue={locations[0]?.id} required>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </SelectField>
            </Field>
            <Field label="Unit code" hint="e.g. 2A">
              <TextField name="code" placeholder="2A" required />
            </Field>
            <Field label="Category">
              <SelectField name="category" defaultValue="residential">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </SelectField>
            </Field>
            <Field label="Tenancy">
              <SelectField name="tenancy" defaultValue="long-term">
                <option value="long-term">Long-term (annual)</option>
                <option value="short-term">Short-term (monthly)</option>
              </SelectField>
            </Field>
            <Field label="Monthly rent">
              <TextField name="rent" type="number" min="1" step="500" defaultValue={12000} required />
            </Field>
            <Field label="Owner / Lessor">
              <TextField name="owner" placeholder="Deanne Keith Tan" />
            </Field>
            <Field label="Electric meter no.">
              <TextField name="electricMeterNo" placeholder="TUG-E00123" />
            </Field>
            <Field label="Water meter no.">
              <TextField name="waterMeterNo" placeholder="TUG-W00456" />
            </Field>
            <label className="flex items-center gap-3 text-sm text-text-secondary sm:col-span-2">
              <input type="checkbox" name="furnished" className="h-4 w-4 accent-[color:var(--color-accent)]" />
              Furnished (adds standard appliance inventory)
            </label>
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <SubmitButton pendingLabel="Adding…">Add unit</SubmitButton>
          </div>
        </form>
      </Modal>

      {/* Manage unit */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Unit ${editing.code}` : "Unit"}
        description={editing ? `${editing.locationName} · ${titleCase(editing.category)} · ${editing.tenancy}` : undefined}
      >
        {editing ? (
          <form action={updateAction} className="grid gap-4">
            <input type="hidden" name="unitId" value={editing.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Monthly rent">
                <TextField name="rent" type="number" min="1" step="500" defaultValue={editing.rent} required />
              </Field>
              <Field label="Status" hint="Vacant/maintenance releases the tenant.">
                <SelectField name="status" defaultValue={editing.status}>
                  <option value="occupied" disabled={!editing.tenantId}>
                    Occupied
                  </option>
                  <option value="vacant">Vacant</option>
                  <option value="maintenance">Maintenance</option>
                </SelectField>
              </Field>
              <Field label="Electric meter no.">
                <TextField name="electricMeterNo" defaultValue={editing.electricMeterNo} />
              </Field>
              <Field label="Water meter no.">
                <TextField name="waterMeterNo" defaultValue={editing.waterMeterNo} />
              </Field>
              <Field label="Owner / Lessor" className="sm:col-span-2">
                <TextField name="owner" defaultValue={editing.owner} />
              </Field>
            </div>
            {editing.tenantName ? (
              <p className="rounded-card bg-accentSoft px-4 py-3 text-sm text-text-secondary">
                Occupied by <strong>{editing.tenantName}</strong>.
              </p>
            ) : null}
            <div className="mt-2 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
