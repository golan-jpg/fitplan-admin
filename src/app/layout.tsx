import type { Metadata } from "next";
import { AppShell } from "@/components/auth/AppShell";
import { AuditLogProvider } from "@/context/AuditLogContext";
import { DemoAuthProvider } from "@/context/DemoAuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "פיטפלאן - לוח ניהול",
  description: "לוח ניהול למאמנים ותזונאים",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="min-h-full">
        <DemoAuthProvider>
          <AuditLogProvider>
            <AppShell>{children}</AppShell>
          </AuditLogProvider>
        </DemoAuthProvider>
      </body>
    </html>
  );
}
