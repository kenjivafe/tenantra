import type { SelectHTMLAttributes } from "react";

export function CustomSelect({ children, className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative inline-block">
      <select
        className={`pl-3 pr-10 h-11 text-sm border border-border/60 rounded-control bg-panel text-text-primary appearance-none cursor-pointer ${className || ''}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export function CustomSelectSmall({ children, className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative inline-block">
      <select
        className={`pl-3 pr-10 h-11 text-sm border border-border/60 rounded-control bg-panel text-text-primary appearance-none cursor-pointer ${className || ''}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
