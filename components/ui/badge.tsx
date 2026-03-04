import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "accent" | "subtle" | "success" | "warning" | "danger";

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: Props) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-panel text-text-secondary border border-border/50",
    accent: "bg-accentSoft text-accent",
    subtle: "bg-surface text-text-secondary border border-border/50",
    success: "bg-status-success/15 text-status-success",
    warning: "bg-status-warning/15 text-status-warning",
    danger: "bg-status-danger/15 text-status-danger",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-control px-3 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
