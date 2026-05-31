"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { DemoSession, resolveDemoSession } from "@/lib/demoAuth";

type DemoAuthContextValue = {
  session: DemoSession | null;
  isHydrated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const SESSION_STORAGE_KEY = "fitplan_demo_session";

const DemoAuthContext = createContext<DemoAuthContextValue | undefined>(undefined);

type DemoAuthProviderProps = {
  children: ReactNode;
};

export function DemoAuthProvider({ children }: DemoAuthProviderProps) {
  const [session, setSession] = useState<DemoSession | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as DemoSession;
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  });
  const value = useMemo<DemoAuthContextValue>(
    () => ({
      session,
      isHydrated: true,
      login: (email: string, password: string) => {
        const resolvedSession = resolveDemoSession(email, password);

        if (!resolvedSession) {
          return { ok: false, error: "פרטי ההתחברות שגויים. נסה שוב." };
        }

        setSession(resolvedSession);
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(resolvedSession));
        return { ok: true };
      },
      logout: () => {
        setSession(null);
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      },
    }),
    [session]
  );

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);

  if (!context) {
    throw new Error("useDemoAuth must be used within DemoAuthProvider");
  }

  return context;
}
