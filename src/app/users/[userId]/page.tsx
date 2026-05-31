"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageTitle } from "@/components/ui/PageTitle";
import { UserDetailsSkeleton } from "@/components/ui/Skeletons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { useNutritionPlans } from "@/hooks/useNutritionPlans";
import { useProgressReports } from "@/hooks/useProgressReports";
import { useUsers } from "@/hooks/useUsers";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";

const roleLabel = {
  admin: "אדמין",
  coach: "מאמן",
  nutritionist: "תזונאי",
  user: "משתמש",
};

const levelLabel = {
  beginner: "מתחילים",
  intermediate: "בינוני",
  advanced: "מתקדם",
};

const goalLabel = {
  fat_loss: "ירידה בשומן",
  muscle_gain: "עלייה במסת שריר",
  maintenance: "שמירה על משקל",
};

type UserModalType = "edit" | "message" | "new_plan" | null;

export default function UserDetailsPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const {
    users,
    isLoading: isUsersLoading,
    updateUser,
  } = useUsers();
  const { workoutPlans, isLoading: isWorkoutLoading } = useWorkoutPlans();
  const { nutritionPlans, isLoading: isNutritionLoading } = useNutritionPlans();
  const { progressReports, isLoading: isProgressLoading } = useProgressReports();

  const userState = users.find((entry) => entry.id === userId) ?? null;
  const [modalType, setModalType] = useState<UserModalType>(null);
  const [pendingRiskConfirm, setPendingRiskConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
  });
  const [messageText, setMessageText] = useState("");
  const [planTitle, setPlanTitle] = useState("");

  const latestProgress = useMemo(
    () => progressReports.find((report) => report.userId === userState?.id),
    [progressReports, userState?.id]
  );
  const activeWorkoutPlan = workoutPlans.find((plan) => plan.status === "active");
  const activeNutritionPlan = nutritionPlans.find((plan) => plan.status === "active");
  const attentionLevel =
    userState && userState.adherenceScore >= 85
      ? "נמוכה"
      : userState && userState.adherenceScore >= 70
        ? "בינונית"
        : "גבוהה";

  if (!isUsersLoading && !userState) {
    return (
      <div className="space-y-4">
        <PageTitle title="המשתמש לא נמצא" subtitle="לא נמצאו פרטים עבור מזהה המשתמש שנבחר" />
        <Link href="/users" className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          חזרה לרשימת משתמשים
        </Link>
      </div>
    );
  }

  if (isUsersLoading || isWorkoutLoading || isNutritionLoading || isProgressLoading) {
    return <UserDetailsSkeleton />;
  }

  if (!userState) {
    return null;
  }

  function runDemoSave(onDone: () => void) {
    setIsSaving(true);
    setTimeout(() => {
      onDone();
      setIsSaving(false);
    }, 650);
  }

  function saveUserEdit() {
    if (!editForm.fullName.trim() || !editForm.email.trim()) {
      setToast({ type: "error", message: "לא ניתן לשמור: חסרים שם מלא או אימייל." });
      return;
    }

    runDemoSave(() => {
      void updateUser(userId, { fullName: editForm.fullName, email: editForm.email });
      setModalType(null);
      setToast({ type: "success", message: "פרטי המשתמש עודכנו בהצלחה." });
    });
  }

  function saveMessageAction() {
    if (!messageText.trim()) {
      setToast({ type: "error", message: "יש להזין תוכן הודעה לפני שליחה." });
      return;
    }

    runDemoSave(() => {
      setModalType(null);
      setMessageText("");
      setToast({ type: "success", message: "ההודעה נשלחה (דמו)." });
    });
  }

  function saveNewPlanAction() {
    if (!planTitle.trim()) {
      setToast({ type: "error", message: "יש להזין שם לתוכנית החדשה." });
      return;
    }

    runDemoSave(() => {
      setModalType(null);
      setPlanTitle("");
      setToast({ type: "success", message: "תוכנית חדשה נוצרה (דמו)." });
    });
  }

  function markUserAsRisk() {
    if (!userState) {
      return;
    }

    runDemoSave(() => {
      void updateUser(userId, {
        status: "at_risk",
        adherenceScore: Math.min(userState.adherenceScore, 65),
      });
      setPendingRiskConfirm(false);
      setToast({ type: "success", message: "המשתמש סומן כמשתמש בסיכון." });
    });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "דשבורד", href: "/" },
          { label: "משתמשים", href: "/users" },
          { label: "פרטי משתמש" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title={`פרופיל משתמש: ${userState.fullName}`} subtitle="תצוגה מרוכזת של התקדמות, תוכניות וסטטוס" />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditForm({ fullName: userState.fullName, email: userState.email });
              setModalType("edit");
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            עריכת משתמש
          </button>
          <button
            type="button"
            onClick={() => setPendingRiskConfirm(true)}
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
          >
            סימון כמשתמש בסיכון
          </button>
          <button
            type="button"
            onClick={() => setModalType("message")}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            שליחת הודעה
          </button>
          <button
            type="button"
            onClick={() => setModalType("new_plan")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            בניית תכנית חדשה
          </button>
          <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            תיאום שיחה
          </button>
          <Link href="/users" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            חזרה לרשימה
          </Link>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">פרטי משתמש</p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">{userState.fullName}</h3>
          <p className="mt-1 text-sm text-slate-600">{userState.email}</p>
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge status={userState.status} />
            <span className="text-sm text-slate-600">{roleLabel[userState.role]}</span>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">עמידה נוכחית</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{userState.adherenceScore}%</p>
          <p className="mt-2 text-sm text-slate-600">תוכניות פעילות: {userState.assignedPlans}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">פעילות אחרונה</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{userState.lastActive}</p>
          <p className="mt-2 text-sm text-slate-600">עודכן ממעקב האפליקציה</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">רמת תשומת לב</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{attentionLevel}</p>
          <p className="mt-2 text-sm text-slate-600">מבוסס על מדדי עמידה שבועיים</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-slate-900">תוכנית אימון נוכחית</h2>
          {activeWorkoutPlan ? (
            <div>
              <p className="font-semibold text-slate-900">{activeWorkoutPlan.title}</p>
              <p className="mt-1 text-sm text-slate-600">משך: {activeWorkoutPlan.durationWeeks} שבועות</p>
              <p className="mt-1 text-sm text-slate-600">רמה: {levelLabel[activeWorkoutPlan.level]}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">לא נמצאה תוכנית אימון פעילה.</p>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-slate-900">תוכנית תזונה נוכחית</h2>
          {activeNutritionPlan ? (
            <div>
              <p className="font-semibold text-slate-900">{activeNutritionPlan.title}</p>
              <p className="mt-1 text-sm text-slate-600">יעד קלורי: {activeNutritionPlan.caloriesTarget} קקל</p>
              <p className="mt-1 text-sm text-slate-600">מטרה: {goalLabel[activeNutritionPlan.goal]}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">לא נמצאה תוכנית תזונה פעילה.</p>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-slate-900">הערות מאמן</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="rounded-xl bg-slate-50 p-2">להגדיל עומס באימון רגליים בשבוע הבא.</li>
            <li className="rounded-xl bg-slate-50 p-2">לעקוב אחרי צריכת חלבון בימים ללא אימון.</li>
            <li className="rounded-xl bg-slate-50 p-2">תזכורת לביצוע שקילה ביום ראשון בבוקר.</li>
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-slate-900">דוח התקדמות אחרון</h2>
        {latestProgress ? (
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">שבוע</p>
              <p className="mt-1 font-semibold text-slate-900">{latestProgress.weekLabel}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">אימונים</p>
              <p className="mt-1 font-semibold text-slate-900">{latestProgress.workoutsCompleted}/{latestProgress.workoutsPlanned}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">עמידה תזונתית</p>
              <p className="mt-1 font-semibold text-slate-900">{latestProgress.nutritionAdherence}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">שינוי משקל</p>
              <p className="mt-1 font-semibold text-slate-900">{latestProgress.weightChangeKg} קג</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">אין דוח התקדמות זמין למשתמש זה.</p>
        )}
      </section>

      <AppModal
        isOpen={modalType === "edit"}
        title="עריכת משתמש"
        subtitle="עדכון פרטים נשמר מקומית בלבד"
        onClose={() => !isSaving && setModalType(null)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              disabled={isSaving}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={saveUserEdit}
              disabled={isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "שומר..." : "שמירה"}
            </button>
          </div>
        }
      >
        <div className="grid gap-3">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">שם מלא *</span>
            <input
              value={editForm.fullName}
              onChange={(event) => setEditForm((prev) => ({ ...prev, fullName: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">אימייל *</span>
            <input
              value={editForm.email}
              onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            />
          </label>
        </div>
      </AppModal>

      <AppModal
        isOpen={modalType === "message"}
        title="שליחת הודעה למשתמש"
        subtitle="פעולת דמו ללא שליחה אמיתית"
        onClose={() => !isSaving && setModalType(null)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              disabled={isSaving}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={saveMessageAction}
              disabled={isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "שולח..." : "שליחה"}
            </button>
          </div>
        }
      >
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-slate-700">תוכן הודעה *</span>
          <textarea
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            className="min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2"
            disabled={isSaving}
          />
        </label>
      </AppModal>

      <AppModal
        isOpen={modalType === "new_plan"}
        title="בניית תוכנית חדשה"
        subtitle="יצירת תוכנית דמו למשתמש"
        onClose={() => !isSaving && setModalType(null)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              disabled={isSaving}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={saveNewPlanAction}
              disabled={isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "יוצר..." : "יצירת תוכנית"}
            </button>
          </div>
        }
      >
        <label className="space-y-1 text-sm">
          <span className="font-semibold text-slate-700">שם תוכנית *</span>
          <input
            value={planTitle}
            onChange={(event) => setPlanTitle(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            disabled={isSaving}
          />
        </label>
      </AppModal>

      <ConfirmDialog
        isOpen={pendingRiskConfirm}
        title="סימון משתמש בסיכון"
        message="פעולה זו תסמן את המשתמש במצב בסיכון ותקפיץ אותו בדוחות מעקב. האם לאשר?"
        confirmLabel="כן, לסמן"
        isLoading={isSaving}
        variant="danger"
        onCancel={() => setPendingRiskConfirm(false)}
        onConfirm={markUserAsRisk}
      />

      {toast ? <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
