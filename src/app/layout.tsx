import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ThemeRegistry from "@/components/theme/ThemeRegistry";
import ToasterProvider from "@/components/layout/ToasterProvider";
import AppShell from "@/components/layout/AppShell";
import ColorSchemeInit from "@/components/theme/ColorSchemeInit";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Orders App",
  description: "Orders Management App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeInit />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeRegistry>
          <ToasterProvider />
          <AppShell>{children}</AppShell>
        </ThemeRegistry>
      </body>
    </html>
  );
}