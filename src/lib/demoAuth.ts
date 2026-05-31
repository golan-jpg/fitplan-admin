export type DemoRole = "admin" | "coach" | "nutritionist";

export type DemoSession = {
  name: string;
  email: string;
  role: DemoRole;
};

type DemoCredential = DemoSession & {
  password: string;
};

type NavItem = {
  href: string;
  label: string;
  roles: DemoRole[];
};

export const demoCredentials: DemoCredential[] = [
  {
    name: "מנהל מערכת",
    email: "admin@fitplan.co.il",
    password: "123456",
    role: "admin",
  },
  {
    name: "מאמן ראשי",
    email: "coach@fitplan.co.il",
    password: "123456",
    role: "coach",
  },
  {
    name: "תזונאית ראשית",
    email: "nutritionist@fitplan.co.il",
    password: "123456",
    role: "nutritionist",
  },
];

export const roleLabel: Record<DemoRole, string> = {
  admin: "אדמין",
  coach: "מאמן",
  nutritionist: "תזונאי",
};

export const navItems: NavItem[] = [
  { href: "/", label: "סקירה כללית", roles: ["admin", "coach", "nutritionist"] },
  { href: "/users", label: "ניהול משתמשים", roles: ["admin", "coach", "nutritionist"] },
  { href: "/workout-plans", label: "תוכניות אימון", roles: ["admin", "coach"] },
  { href: "/exercises", label: "ספריית תרגילים", roles: ["admin", "coach"] },
  { href: "/nutrition-plans", label: "תוכניות תזונה", roles: ["admin", "nutritionist"] },
  { href: "/recipes", label: "מאגר ארוחות ומתכונים", roles: ["admin", "nutritionist"] },
  { href: "/progress", label: "מעקב התקדמות", roles: ["admin", "coach", "nutritionist"] },
  { href: "/analytics", label: "אנליטיקות", roles: ["admin"] },
  { href: "/settings", label: "הגדרות", roles: ["admin"] },
];

const roleAllowedPrefixes: Record<DemoRole, string[]> = {
  admin: ["/", "/users", "/workout-plans", "/exercises", "/nutrition-plans", "/recipes", "/progress", "/analytics", "/settings"],
  coach: ["/", "/users", "/workout-plans", "/exercises", "/progress"],
  nutritionist: ["/", "/users", "/nutrition-plans", "/recipes", "/progress"],
};

const publicPaths = ["/login"];

export function isPublicPath(pathname: string): boolean {
  return publicPaths.includes(pathname);
}

export function getNavItemsForRole(role: DemoRole): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role));
}

export function isPathAllowedForRole(pathname: string, role: DemoRole): boolean {
  const allowedPrefixes = roleAllowedPrefixes[role];
  return allowedPrefixes.some((prefix) => (prefix === "/" ? pathname === "/" : pathname.startsWith(prefix)));
}

export function resolveDemoSession(email: string, password: string): DemoSession | null {
  const normalizedEmail = email.trim().toLowerCase();
  const credential = demoCredentials.find(
    (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
  );

  if (!credential) {
    return null;
  }

  return {
    name: credential.name,
    email: credential.email,
    role: credential.role,
  };
}
