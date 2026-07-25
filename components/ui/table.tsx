import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function TableShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("-mx-2 overflow-x-auto px-2", className)}>
      <table className="w-full min-w-[44rem] text-sm">{children}</table>
    </div>
  );
}

export function Th({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("whitespace-nowrap px-4 py-3 text-left font-medium text-text-muted", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 text-text-primary", className)} {...props}>
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-text-muted">
        {message}
      </td>
    </tr>
  );
}
