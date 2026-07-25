import "./globals.css";

import type { Metadata } from "next";
import { Inter, Montagu_Slab } from "next/font/google";
import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/toast";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const display = Montagu_Slab({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: {
    default: "Tenantra Platform",
    template: "%s | Tenantra",
  },
  description: "Unified administration platform for Tenantra property operations.",
  // Icon is provided by the App Router file convention (app/icon.png), so no
  // manual /favicon.ico reference — that path 404s and can surface in the
  // dev overlay as a stray "[object Event]" error.
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
