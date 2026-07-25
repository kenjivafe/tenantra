import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type Tone = "default" | "success" | "warning" | "danger" | "accent";

const badgeVariant: Record<Tone, "subtle" | "success" | "warning" | "danger" | "accent"> = {
  default: "subtle",
  success: "success",
  warning: "warning",
  danger: "danger",
  accent: "accent",
};

export function StatCard({
  label,
  value,
  hint,
  badge,
  tone = "default",
  className,
  padding = "md",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  badge?: ReactNode;
  tone?: Tone;
  className?: string;
  padding?: "sm" | "md";
}) {
  return (
    <Card className={cn("bg-panel", className)} padding={padding}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">{label}</p>
          <p className="mt-4 truncate text-3xl font-semibold font-display text-text-primary">{value}</p>
          {hint ? <p className="mt-2 text-sm text-text-muted">{hint}</p> : null}
        </div>
        {badge ? <Badge variant={badgeVariant[tone]}>{badge}</Badge> : null}
      </div>
    </Card>
  );
}
