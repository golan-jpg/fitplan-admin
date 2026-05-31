"use client";

import { usePathname, useRouter } from "next/navigation";
import { useDemoAuth } from "@/context/DemoAuthContext";

const titleByPathPrefix: Array<{ prefix: string; title: string }> = [
  { prefix: "/users", title: "ניהול משתמשים" },
  { prefix: "/workout-plans", title: "ניהול תוכניות אימון" },
  { prefix: "/nutrition-plans", title: "ניהול תוכניות תזונה" },
  { prefix: "/exercises", title: "ספריית תרגילים" },
  { prefix: "/recipes", title: "מאגר מתכונים" },
  { prefix: "/progress", title: "מעקב התקדמות" },
  { prefix: "/analytics", title: "אנליטיקות בסיסיות" },
  { prefix: "/settings", title: "הגדרות מערכת" },
];

function resolveTitle(pathname: string): string {
  if (pathname === "/") {
    return "סקירה כללית";
  }

  const match = titleByPathPrefix.find((item) => pathname.startsWith(item.prefix));
  return match?.title ?? "לוח הניהול";
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useDemoAuth();
  const title = resolveTitle(pathname);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-8 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">לוח ניהול</p>
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            מחובר כ: {session?.name ?? "-"}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            התנתקות
          </button>
        </div>
      </div>
    </header>
  );
}
