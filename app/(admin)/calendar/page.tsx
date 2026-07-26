import { MonthCalendar } from "@/components/calendar/month-calendar";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { currentPeriod, getCalendarEvents, today } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const params = await searchParams;
  const month = params.month && /^\d{4}-\d{2}$/.test(params.month) ? params.month : currentPeriod();
  const events = getCalendarEvents(month);
  const asOf = today();
  const upcoming = events.filter((event) => event.date >= asOf).slice(0, 10);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <MonthCalendar month={month} events={events} today={asOf} />

      <Card className="bg-panel" padding="md">
        <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Coming up this month</h3>
        {upcoming.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">Nothing scheduled for the rest of the month.</p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((event, index) => (
              <li key={index} className="flex items-start justify-between gap-3 border-b border-border/20 pb-3 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-text-primary">{event.label}</p>
                  <p className="text-xs text-text-muted">{event.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-text-muted">{formatDate(event.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
