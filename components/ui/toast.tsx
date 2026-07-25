"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { ActionResult } from "@/lib/types";

type Toast = { id: number; message: string; tone: "success" | "error" };

type ToastContextValue = {
  push: (message: string, tone?: Toast["tone"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const push = useCallback((message: string, tone: Toast["tone"] = "success") => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4500);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex w-[min(24rem,calc(100vw-3rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "flex items-start gap-3 rounded-card border px-4 py-3 text-sm shadow-card backdrop-blur-md",
              toast.tone === "success"
                ? "border-status-success/40 bg-[#f0faf6] text-text-primary"
                : "border-status-danger/40 bg-[#fdf1f1] text-text-primary",
            )}
          >
            <span
              className={cn(
                "mt-1 h-2 w-2 shrink-0 rounded-full",
                toast.tone === "success" ? "bg-status-success" : "bg-status-danger",
              )}
            />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
              className="text-text-muted transition hover:text-text-primary"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside a ToastProvider");
  return context;
}

/**
 * Surfaces a server action result as a toast. `onSuccess` runs once per successful
 * submission, which is how dialogs know to close themselves.
 */
export function useActionToast(state: ActionResult | null, onSuccess?: () => void) {
  const { push } = useToast();
  const lastSeen = useRef<number | undefined>(undefined);
  const successRef = useRef(onSuccess);

  useEffect(() => {
    successRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!state?.at || state.at === lastSeen.current) return;
    lastSeen.current = state.at;
    push(state.message, state.ok ? "success" : "error");
    if (state.ok) successRef.current?.();
  }, [state, push]);
}
