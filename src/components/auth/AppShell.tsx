"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppLayout } from "@/components/dashboard/AppLayout";
import { useDemoAuth } from "@/context/DemoAuthContext";
import { isPathAllowedForRole, isPublicPath } from "@/lib/demoAuth";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isHydrated } = useDemoAuth();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!session && !isPublicPath(pathname)) {
      router.replace("/login");
      return;
    }

    if (session && pathname === "/login") {
      router.replace("/");
    }
  }, [isHydrated, pathname, router, session]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-800">טוען נתוני התחברות...</p>
          <p className="mt-2 text-sm text-slate-500">בודק סשן מקומי של משתמש דמו.</p>
        </div>
      </div>
    );
  }

  if (!session && !isPublicPath(pathname)) {
    return null;
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (session && !isPathAllowedForRole(pathname, session.role)) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-3xl" aria-hidden>
              ⛔
            </p>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">אין לך הרשאה לצפות במסך זה</h1>
            <p className="mt-2 text-sm text-slate-600">
              המסך שביקשת אינו זמין עבור התפקיד שלך במערכת הדמו.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              חזרה לדשבורד
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
