"use client";

import { useActionState } from "react";

import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/form";
import { useActionToast } from "@/components/ui/toast";
import { sendBulkRemindersAction } from "@/lib/actions/billing";
import { formatMoney, formatPeriod } from "@/lib/format";

export function BulkReminder({ period, count, amount }: { period: string; count: number; amount: number }) {
  const [state, action] = useActionState(sendBulkRemindersAction, null);
  useActionToast(state);

  if (count === 0) {
    return (
      <Card className="border border-status-success/30 bg-status-success/10" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary">
          No overdue invoices for {formatPeriod(period)}
        </h3>
        <p className="mt-1 text-sm text-text-muted">Collections are fully up to date for this period.</p>
      </Card>
    );
  }

  return (
    <Card className="border border-status-danger/30 bg-status-danger/10" padding="md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold font-display text-text-primary">
            {count} overdue invoice{count === 1 ? "" : "s"}
          </h3>
          <p className="mt-1 text-sm text-text-muted">Total outstanding: {formatMoney(amount)}</p>
        </div>
        <form action={action}>
          <input type="hidden" name="period" value={period} />
          <SubmitButton pendingLabel="Sending reminders…">Send Bulk Reminder</SubmitButton>
        </form>
      </div>
    </Card>
  );
}
