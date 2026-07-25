"use client";

import { cn } from "@/lib/cn";

export type ChipOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type Props<T extends string> = {
  options: Array<ChipOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function FilterChips<T extends string>({ options, value, onChange, className }: Props<T>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              active ? "bg-accent text-white" : "bg-border/20 text-text-muted hover:bg-border/40",
            )}
          >
            {option.label}
            {option.count === undefined ? null : (
              <span className={cn("ml-1.5", active ? "text-white/80" : "text-text-muted/70")}>{option.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
