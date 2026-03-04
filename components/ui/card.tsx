import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  padding?: "sm" | "md";
};

export function Card({ className, padding = "md", ...props }: Props) {
  const paddings = {
    sm: "p-5",
    md: "p-7",
  } as const;

  return (
    <div
      className={cn(
        "border backdrop-blur-md rounded-card border-border/60 shadow-card",
        paddings[padding],
        className,
      )}
      {...props}
    />
  );
}
