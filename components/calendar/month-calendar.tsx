import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { CalendarEvent } from "@/lib/data";
import { cn } from "@/lib/cn";

const KIND_STYLES: Record<CalendarEvent["kind"], string> = {
  bill: "bg-accentSoft text-accent",
  cheque: "bg-status-warning/15 text-status-warning",
  "lease-start": "bg-status-success/15 text-status-success",
  "lease-end": "bg-status-danger/15 text-status-danger",
  improvement: "bg-surface text-text-secondary border border-border/50",
};

const KIND_LABEL: Record<CalendarEvent["kind"], string> = {
  bill: "Rent due",
  cheque: "PDC deposit",
  "lease-start": "Lease start",
  "lease-end": "Lease end",
  improvement: "Improvement",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, m - 1, 1)),
  );
}

function shiftMonth(month: string, delta: number) {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, m - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function MonthCalendar({
  month,
  events,
  today,
}: {
  month: string;
  events: CalendarEvent[];
  today: string;
}) {
  const [year, m] = month.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, m - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, m, 0)).getUTCDate();

  const byDay = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const list = byDay.get(event.date) ?? [];
    list.push(event);
    byDay.set(event.date, list);
  }

  const cells: Array<{ date: string; day: number } | null> = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, date: `${month}-${String(day).padStart(2, "0")}` });
  }

  return (
    <Card className="bg-panel" padding="md">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/calendar?month=${shiftMonth(month, -1)}`}
          className="rounded-control border border-border/60 px-3 py-1.5 text-sm font-semibold text-text-primary transition hover:bg-accentSoft"
        >
          ← Prev
        </Link>
        <h3 className="text-lg font-semibold font-display text-text-primary">{monthLabel(month)}</h3>
        <Link
          href={`/calendar?month=${shiftMonth(month, 1)}`}
          className="rounded-control border border-border/60 px-3 py-1.5 text-sm font-semibold text-text-primary transition hover:bg-accentSoft"
        >
          Next →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[44rem]">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-text-muted">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, index) => {
              if (!cell) return <div key={`empty-${index}`} className="min-h-24 rounded-lg" />;
              const dayEvents = byDay.get(cell.date) ?? [];
              const isToday = cell.date === today;
              return (
                <div
                  key={cell.date}
                  className={cn(
                    "min-h-24 rounded-lg border p-1.5",
                    isToday ? "border-accent bg-accentSoft/40" : "border-border/40 bg-surface/40",
                  )}
                >
                  <div className={cn("mb-1 text-xs font-semibold", isToday ? "text-accent" : "text-text-muted")}>
                    {cell.day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <div
                        key={i}
                        title={`${KIND_LABEL[event.kind]}: ${event.label} — ${event.detail}`}
                        className={cn("truncate rounded px-1.5 py-0.5 text-[11px] font-medium", KIND_STYLES[event.kind])}
                      >
                        {event.label}
                      </div>
                    ))}
                    {dayEvents.length > 3 ? (
                      <div className="px-1.5 text-[11px] text-text-muted">+{dayEvents.length - 3} more</div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {(Object.keys(KIND_LABEL) as Array<CalendarEvent["kind"]>).map((kind) => (
          <div key={kind} className="flex items-center gap-2 text-xs text-text-muted">
            <span className={cn("h-3 w-3 rounded", KIND_STYLES[kind].split(" ")[0])} />
            {KIND_LABEL[kind]}
          </div>
        ))}
      </div>
    </Card>
  );
}
