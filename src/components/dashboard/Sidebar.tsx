"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemoAuth } from "@/context/DemoAuthContext";
import { getNavItemsForRole, roleLabel } from "@/lib/demoAuth";

export function Sidebar() {
  const pathname = usePathname();
  const { session } = useDemoAuth();

  if (!session) {
    return null;
  }

  const navItems = getNavItemsForRole(session.role);

  return (
    <aside className="sticky top-0 h-screen w-72 shrink-0 border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-500">פיטפלאן</p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">ניהול מאמנים</h2>
        <div className="mt-3 rounded-xl bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-800">{session.name}</p>
          <p className="mt-1 text-xs text-slate-600">{roleLabel[session.role]}</p>
        </div>
      </div>
      <nav className="space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
