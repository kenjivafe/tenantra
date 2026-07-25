"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-1.5", className)}>
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</span>
      {children}
      {hint ? <span className="text-xs text-text-muted">{hint}</span> : null}
    </label>
  );
}

const controlClass =
  "h-11 w-full rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-accent/60";

export function TextField({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function SelectField({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, "cursor-pointer appearance-none pr-10", className)} {...props}>
      {children}
    </select>
  );
}

export function TextAreaField({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-card border border-border/60 bg-panel px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:border-accent/60",
        className,
      )}
      {...props}
    />
  );
}

type SubmitProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md";
  pendingLabel?: string;
};

/** Submit button that disables and relabels itself while its form is in flight. */
export function SubmitButton({ children, pendingLabel, ...props }: SubmitProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={cn(pending && "opacity-70")} {...props}>
      {pending ? (pendingLabel ?? "Working…") : children}
    </Button>
  );
}

/** Inline table action rendered as a link-styled submit button. */
export function InlineSubmit({
  children,
  tone = "accent",
  pendingLabel = "…",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "accent" | "danger"; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "text-sm font-medium transition hover:underline disabled:opacity-50",
        tone === "danger" ? "text-status-danger" : "text-accent",
        className,
      )}
      {...props}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Toggle({ checked, name, onChange }: { checked: boolean; name: string; onChange?: (next: boolean) => void }) {
  return (
    // The knob is a sibling of the input so `peer-checked:` can reach it.
    <label className="relative inline-flex h-6 w-12 cursor-pointer items-center">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
        className="peer sr-only"
      />
      <span className="absolute inset-0 rounded-full bg-border/40 transition peer-checked:bg-accent" />
      <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-6" />
    </label>
  );
}
