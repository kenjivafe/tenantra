import "./globals.css";

import type { Metadata } from "next";
import { Inter, Montagu_Slab } from "next/font/google";
import type { ReactNode } from "react";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const display = Montagu_Slab({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: {
    default: "Tenantra Platform",
    template: "%s | Tenantra",
  },
  description: "Unified administration platform for Tenantra property operations.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
