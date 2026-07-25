"use client";

import { useActionState, useMemo, useState } from "react";

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
import { formatMoney } from "@/lib/format";

const PAGE_SIZE = 12;
const TYPES = ["Studio", "1BR", "2BR", "3BR"] as const;
const STATUSES = ["occupied", "vacant", "reserved", "maintenance"] as const;

type StatusFilter = "all" | (typeof STATUSES)[number];

export function UnitsTable({
  rows,
  properties,
}: {
  rows: UnitRow[];
  properties: Array<{ id: string; name: string }>;
}) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [propertyId, setPropertyId] = useState("all");
  const [type, setType] = useState("all");
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
      occupied: rows.filter((row) => row.status === "occupied").length,
      vacant: rows.filter((row) => row.status === "vacant").length,
      reserved: rows.filter((row) => row.status === "reserved").length,
      maintenance: rows.filter((row) => row.status === "maintenance").length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (propertyId !== "all" && row.propertyId !== propertyId) return false;
      if (type !== "all" && row.type !== type) return false;
      if (!needle) return true;
      return (
        row.code.toLowerCase().includes(needle) ||
        (row.residentName?.toLowerCase().includes(needle) ?? false) ||
        row.propertyName.toLowerCase().includes(needle)
      );
    });
  }, [rows, status, propertyId, type, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const withReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setAdding(true)}>Add Unit</Button>
          <select
            aria-label="Filter by property"
            value={propertyId}
            onChange={(event) => withReset(setPropertyId)(event.target.value)}
            className="h-11 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary"
          >
            <option value="all">All Properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by unit type"
            value={type}
            onChange={(event) => withReset(setType)(event.target.value)}
            className="h-11 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary"
          >
            <option value="all">All Types</option>
            {TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => withReset(setQuery)(event.target.value)}
          placeholder="Search unit or tenant"
          className="h-11 min-w-[14rem] flex-1 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary placeholder:text-text-muted sm:max-w-xs sm:flex-none"
        />
      </div>

      <Card className="bg-panel" padding="md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold font-display text-text-primary">Units Inventory</h3>
          <FilterChips
            value={status}
            onChange={withReset(setStatus)}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "occupied", label: "Occupied", count: counts.occupied },
              { value: "vacant", label: "Vacant", count: counts.vacant },
              { value: "reserved", label: "Reserved", count: counts.reserved },
              { value: "maintenance", label: "Maintenance", count: counts.maintenance },
            ]}
          />
        </div>

        <TableShell>
          <thead>
            <tr className="border-b border-border/40">
              <Th>Unit</Th>
              <Th>Property</Th>
              <Th>Type</Th>
              <Th>Floor</Th>
              <Th>Rent</Th>
              <Th>Status</Th>
              <Th>Tenant</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <EmptyRow colSpan={8} message="No units match these filters." />
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-b border-border/20">
                  <Td className="font-medium">{row.code}</Td>
                  <Td>{row.propertyName}</Td>
                  <Td>{row.type}</Td>
                  <Td>{row.floor}</Td>
                  <Td>
                    {formatMoney(row.rent)}
                    <span className="block text-xs text-text-muted">+{formatMoney(row.dues)} dues</span>
                  </Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                  <Td className={row.residentName ? "" : "text-text-muted"}>{row.residentName ?? "—"}</Td>
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
                        <InlineSubmit tone="danger" pendingLabel="Removing…">
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

        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add Unit" description="Create a new unit in the inventory.">
        <form action={createAction} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Property" className="sm:col-span-2">
              <SelectField name="propertyId" defaultValue={properties[0]?.id} required>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </SelectField>
            </Field>
            <Field label="Unit code" hint="e.g. 12B">
              <TextField name="code" placeholder="12B" required />
            </Field>
            <Field label="Floor">
              <TextField name="floor" type="number" min="1" defaultValue={1} required />
            </Field>
            <Field label="Type">
              <SelectField name="type" defaultValue="1BR">
                {TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
            </Field>
            <Field label="Monthly rent">
              <TextField name="rent" type="number" min="1" step="100" defaultValue={13500} required />
            </Field>
            <Field label="Association dues" hint="Leave 0 to derive 8% of rent." className="sm:col-span-2">
              <TextField name="dues" type="number" min="0" step="50" defaultValue={0} />
            </Field>
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <SubmitButton pendingLabel="Adding…">Add unit</SubmitButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Unit ${editing.code}` : "Unit"}
        description={editing ? `${editing.propertyName} · ${editing.type} · Floor ${editing.floor}` : undefined}
      >
        {editing ? (
          <form action={updateAction} className="grid gap-4">
            <input type="hidden" name="unitId" value={editing.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Monthly rent">
                <TextField name="rent" type="number" min="1" step="100" defaultValue={editing.rent} required />
              </Field>
              <Field label="Association dues">
                <TextField name="dues" type="number" min="0" step="50" defaultValue={editing.dues} required />
              </Field>
              <Field
                label="Status"
                className="sm:col-span-2"
                hint="Marking a unit vacant or under maintenance releases its current occupant."
              >
                <SelectField name="status" defaultValue={editing.status}>
                  {STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {option[0].toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </SelectField>
              </Field>
            </div>
            {editing.residentName ? (
              <p className="rounded-card bg-accentSoft px-4 py-3 text-sm text-text-secondary">
                Currently occupied by <strong>{editing.residentName}</strong>.
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
    </>
  );
}
