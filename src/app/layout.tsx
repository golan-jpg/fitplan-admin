import type { Metadata } from "next";
import { AppShell } from "@/components/auth/AppShell";
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
          <AppShell>{children}</AppShell>
        </DemoAuthProvider>
      </body>
    </html>
  );
}
