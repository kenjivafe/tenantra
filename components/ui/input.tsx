import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = "text", ...props }: Props) {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full rounded-control border border-border bg-panel px-4 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-accent/40",
        className,
      )}
      {...props}
    />
  );
}
