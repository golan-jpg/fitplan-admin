"use client";

import { ReactNode } from "react";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1700px]">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Header />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
