"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemoAuth } from "@/context/DemoAuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useDemoAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("יש למלא אימייל וסיסמה.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const result = login(email, password);
      setIsSubmitting(false);

      if (!result.ok) {
        setError(result.error ?? "התחברות נכשלה.");
        return;
      }

      router.push("/");
    }, 450);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <p className="text-xs font-semibold text-slate-500">FitPlan Demo</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">כניסה למערכת</h1>
        <p className="mt-2 text-sm text-slate-500">התחברות דמו לפי תפקיד להצגת הרשאות בממשק</p>

        <div className="mt-6 grid gap-3">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">אימייל</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSubmitting}
              placeholder="admin@fitplan.co.il"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">סיסמה</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSubmitting}
              placeholder="123456"
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm font-semibold text-rose-700">{error}</p> : null}

        <button
          type="button"
          onClick={handleLogin}
          disabled={isSubmitting}
          className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "מתחבר..." : "כניסה למערכת"}
        </button>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">משתמשי דמו:</p>
          <ul className="mt-2 space-y-1">
            <li>admin@fitplan.co.il / 123456</li>
            <li>coach@fitplan.co.il / 123456</li>
            <li>nutritionist@fitplan.co.il / 123456</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
