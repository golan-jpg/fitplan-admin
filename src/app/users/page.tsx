"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { PageTitle } from "@/components/ui/PageTitle";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ToastMessage } from "@/components/ui/ToastMessage";
import { useDemoAuth } from "@/context/DemoAuthContext";
import { useAuditLogContext } from "@/context/AuditLogContext";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types";

const statusTabs = [
  { label: "הכול", value: "all" },
  { label: "פעילים", value: "active" },
  { label: "לא פעילים", value: "inactive" },
  { label: "בסיכון", value: "at_risk" },
];

const planTypeTabs = [
  { label: "הכול", value: "all" },
  { label: "אימון", value: "workout" },
  { label: "תזונה", value: "nutrition" },
];

const roleLabel: Record<User["role"], string> = {
  admin: "אדמין",
  coach: "מאמן",
  nutritionist: "תזונאי",
  user: "משתמש",
};

const planTypeLabel: Record<User["primaryPlanType"], string> = {
  workout: "אימון",
  nutrition: "תזונה",
};

const statusLabel: Record<User["status"], string> = {
  active: "פעיל",
  inactive: "לא פעיל",
  at_risk: "בסיכון",
};

type UserFormState = {
  fullName: string;
  email: string;
  role: User["role"];
  status: User["status"];
  primaryPlanType: User["primaryPlanType"];
};

const emptyForm: UserFormState = {
  fullName: "",
  email: "",
  role: "user",
  status: "active",
  primaryPlanType: "workout",
};

export default function UsersPage() {
  const { session } = useDemoAuth();
  const { addAuditLog } = useAuditLogContext();
  const {
    users,
    isLoading: isUsersLoading,
    error,
    createUser,
    updateUser,
    updateUserStatus,
  } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planTypeFilter, setPlanTypeFilter] = useState("all");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingRiskUserId, setPendingRiskUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formState, setFormState] = useState<UserFormState>(emptyForm);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const statusMatch = statusFilter === "all" || user.status === statusFilter;
      const planTypeMatch = planTypeFilter === "all" || user.primaryPlanType === planTypeFilter;
      const searchMatch =
        normalizedSearch.length === 0 ||
        user.fullName.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        roleLabel[user.role].includes(searchTerm) ||
        planTypeLabel[user.primaryPlanType].includes(searchTerm);

      return statusMatch && planTypeMatch && searchMatch;
    });
  }, [searchTerm, statusFilter, planTypeFilter, users]);

  function openAddUserModal() {
    setEditingUserId(null);
    setFormState(emptyForm);
    setErrorMessage(null);
    setIsUserModalOpen(true);
  }

  function openEditUserModal(user: User) {
    setEditingUserId(user.id);
    setFormState({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      primaryPlanType: user.primaryPlanType,
    });
    setErrorMessage(null);
    setIsUserModalOpen(true);
  }

  function closeUserModal() {
    if (isSaving) {
      return;
    }

    setIsUserModalOpen(false);
  }

  function saveUser() {
    if (!formState.fullName.trim() || !formState.email.trim()) {
      setErrorMessage("יש למלא שם מלא ואימייל.");
      setToast({ type: "error", message: "לא ניתן לשמור: חסרים שדות חובה." });
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    setTimeout(async () => {
      if (editingUserId) {
        const previousUser = users.find((user) => user.id === editingUserId);
        const updated = await updateUser(editingUserId, formState);
        if (updated && session) {
          addAuditLog({
            actorName: session.name,
            actorRole: session.role,
            action: "עריכת משתמש",
            entityType: "users",
            entityName: formState.fullName,
            entityId: editingUserId,
            severity: "success",
            description: `עודכן משתמש: ${formState.fullName}.`,
          });

          if (previousUser && previousUser.status !== formState.status) {
            addAuditLog({
              actorName: session.name,
              actorRole: session.role,
              action: "שינוי סטטוס משתמש",
              entityType: "users",
              entityName: formState.fullName,
              entityId: editingUserId,
              severity: "warning",
              description: `סטטוס המשתמש "${formState.fullName}" שונה מ-${statusLabel[previousUser.status]} ל-${statusLabel[formState.status]}.`,
            });
          }
        }
        setToast({ type: "success", message: "המשתמש עודכן בהצלחה." });
      } else {
        const created = await createUser(formState);
        if (session) {
          addAuditLog({
            actorName: session.name,
            actorRole: session.role,
            action: "הוספת משתמש",
            entityType: "users",
            entityName: formState.fullName,
            entityId: created.id,
            severity: "success",
            description: `נוסף משתמש חדש: ${formState.fullName}.`,
          });
        }
        setToast({ type: "success", message: "המשתמש נוסף בהצלחה." });
      }

      setIsSaving(false);
      setIsUserModalOpen(false);
    }, 700);
  }

  function confirmRiskMark() {
    if (!pendingRiskUserId) {
      return;
    }

    setIsSaving(true);
    setTimeout(async () => {
      const targetUser = users.find((user) => user.id === pendingRiskUserId);
      const updated = await updateUserStatus(pendingRiskUserId, "at_risk");
      if (updated && session) {
        addAuditLog({
          actorName: session.name,
          actorRole: session.role,
          action: "סימון משתמש בסיכון",
          entityType: "users",
          entityName: updated.fullName,
          entityId: pendingRiskUserId,
          severity: "danger",
          description: `המשתמש ${updated.fullName} סומן כבסיכון.`,
        });

        if (targetUser && targetUser.status !== "at_risk") {
          addAuditLog({
            actorName: session.name,
            actorRole: session.role,
            action: "שינוי סטטוס משתמש",
            entityType: "users",
            entityName: updated.fullName,
            entityId: pendingRiskUserId,
            severity: "warning",
            description: `סטטוס המשתמש "${updated.fullName}" שונה מ-${statusLabel[targetUser.status]} ל-${statusLabel.at_risk}.`,
          });
        }
      }
      setPendingRiskUserId(null);
      setIsSaving(false);
      setToast({ type: "success", message: "המשתמש סומן כבסיכון." });
    }, 500);
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setPlanTypeFilter("all");
  }

  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      header: "שם משתמש",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.fullName}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "תפקיד",
      render: (row) => roleLabel[row.role],
    },
    {
      key: "plans",
      header: "תוכניות",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.assignedPlans}</p>
          <p className="text-xs text-slate-500">סוג: {planTypeLabel[row.primaryPlanType]}</p>
        </div>
      ),
    },
    {
      key: "adherence",
      header: "עמידה",
      render: (row) => `${row.adherenceScore}%`,
    },
    {
      key: "status",
      header: "סטטוס",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "פעולות",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEditUserModal(row)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            עריכה
          </button>
          <button
            type="button"
            onClick={() => setPendingRiskUserId(row.id)}
            className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
          >
            סימון בסיכון
          </button>
          <Link href={`/users/${row.id}`} className="text-xs font-semibold text-slate-700 hover:text-slate-900">
            פרופיל
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: "דשבורד", href: "/" }, { label: "משתמשים" }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="ניהול משתמשים" subtitle="חיפוש, סינון וצפייה במשתמשים במערכת" />
        <button
          type="button"
          onClick={openAddUserModal}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          הוספת משתמש
        </button>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="חיפוש לפי שם, אימייל, תפקיד או סוג תוכנית" />
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs tabs={statusTabs} activeValue={statusFilter} onChange={setStatusFilter} />
          <FilterTabs tabs={planTypeTabs} activeValue={planTypeFilter} onChange={setPlanTypeFilter} />
        </div>
      </div>

      <DataTable
        rows={filteredUsers}
        columns={columns}
        isLoading={isUsersLoading}
        emptyState={{
          emoji: "👥",
          title: "לא נמצאו משתמשים",
          description: "לא נמצאו תוצאות לפי החיפוש או הסינון שנבחר. אפשר לאפס פילטרים ולנסות שוב.",
          actionLabel: "איפוס חיפוש וסינון",
          onAction: clearFilters,
        }}
      />

      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}

      <AppModal
        isOpen={isUserModalOpen}
        title={editingUserId ? "עריכת משתמש" : "הוספת משתמש"}
        subtitle="השינויים נשמרים בזיכרון בלבד עד רענון העמוד"
        onClose={closeUserModal}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeUserModal}
              disabled={isSaving}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={saveUser}
              disabled={isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "שומר..." : "שמירה"}
            </button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">שם מלא *</span>
            <input
              value={formState.fullName}
              onChange={(event) => setFormState((prev) => ({ ...prev, fullName: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">אימייל *</span>
            <input
              value={formState.email}
              onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">תפקיד</span>
            <select
              value={formState.role}
              onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value as User["role"] }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="user">משתמש</option>
              <option value="coach">מאמן</option>
              <option value="nutritionist">תזונאי</option>
              <option value="admin">אדמין</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-700">סטטוס</span>
            <select
              value={formState.status}
              onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value as User["status"] }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="active">פעיל</option>
              <option value="at_risk">בסיכון</option>
              <option value="inactive">לא פעיל</option>
            </select>
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-semibold text-slate-700">סוג תוכנית ראשי</span>
            <select
              value={formState.primaryPlanType}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, primaryPlanType: event.target.value as User["primaryPlanType"] }))
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              disabled={isSaving}
            >
              <option value="workout">אימון</option>
              <option value="nutrition">תזונה</option>
            </select>
          </label>
        </div>
        {errorMessage ? <p className="mt-3 text-sm font-semibold text-rose-700">{errorMessage}</p> : null}
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(pendingRiskUserId)}
        title="סימון משתמש בסיכון"
        message="פעולה זו תסמן את המשתמש בסיכון ותשפיע על הדשבורד והדוחות. האם להמשיך?"
        confirmLabel="כן, לסמן"
        isLoading={isSaving && Boolean(pendingRiskUserId)}
        variant="danger"
        onCancel={() => setPendingRiskUserId(null)}
        onConfirm={confirmRiskMark}
      />

      {toast ? <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
