import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/**
 * On desktop this is a normal scrollable table. On phones (<768px) the
 * `responsive-table` class (see globals.css) restyles rows into stacked cards,
 * using each cell's `label` as its field name. Pass `responsive={false}` to keep
 * a horizontally scrolling table on mobile instead.
 */
export function TableShell({
  children,
  className,
  responsive = true,
}: {
  children: ReactNode;
  className?: string;
  responsive?: boolean;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className={cn("w-full text-sm", responsive ? "responsive-table md:min-w-[44rem]" : "min-w-[44rem]")}>
        {children}
      </table>
    </div>
  );
}

export function Th({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("whitespace-nowrap px-4 py-3 text-left font-medium text-text-muted", className)} {...props}>
      {children}
    </th>
  );
}

type TdProps = TdHTMLAttributes<HTMLTableCellElement> & {
  /** Field name shown beside the value in the mobile stacked-card layout. */
  label?: string;
};

export function Td({ label, className, children, ...props }: TdProps) {
  return (
    <td data-label={label} className={cn("px-4 py-3 text-text-primary", className)} {...props}>
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr className="table-empty-row">
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-text-muted">
        {message}
      </td>
    </tr>
  );
}
