import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

type ButtonSize = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap font-semibold transition focus-visible:outline-none";

  const sizes: Record<ButtonSize, string> = {
    sm: "h-9 rounded-control px-4 text-sm",
    md: "h-11 rounded-control px-5 text-sm",
  };

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-accent text-surface shadow-card hover:-translate-y-[1px] hover:shadow-lg",
    secondary:
      "border border-border bg-panel text-text-primary hover:bg-accentSoft",
    ghost: "text-text-primary hover:bg-accentSoft",
    destructive:
      "bg-status-danger text-surface shadow-card hover:-translate-y-[1px] hover:shadow-lg",
  };

  return (
    <button
      type={type}
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}

type ButtonLinkProps = {
  href: string;
  children: string;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
  size = "md",
}: ButtonLinkProps) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap font-semibold transition focus-visible:outline-none";

  const sizes: Record<ButtonSize, string> = {
    sm: "h-9 rounded-control px-4 text-sm",
    md: "h-11 rounded-control px-5 text-sm",
  };

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-accent text-surface shadow-card hover:-translate-y-[1px] hover:shadow-lg",
    secondary:
      "border border-border bg-panel text-text-primary hover:bg-accentSoft",
    ghost: "text-text-primary hover:bg-accentSoft",
    destructive:
      "bg-status-danger text-surface shadow-card hover:-translate-y-[1px] hover:shadow-lg",
  };

  return (
    <Link href={href} className={cn(base, sizes[size], variants[variant], className)}>
      {children}
    </Link>
  );
}
