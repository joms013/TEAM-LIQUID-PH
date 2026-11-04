import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const DASHBOARD_MODULES = [
  {
    key: "customer",
    name: "Customer",
    title: "Customer management",
    description: "Manage customer records and relationships.",
    href: "/dashboard/customer",
  },
  {
    key: "product",
    name: "Product",
    title: "Products",
    description: "Maintain products, pricing, and product information.",
    href: "/dashboard/product",
  },
  {
    key: "human_resources",
    name: "Human Resources",
    title: "Human resources",
    description: "Manage employees, departments, jobs, and job history.",
    href: "/dashboard/human_resources",
  },
  {
    key: "sales",
    name: "Sales",
    title: "Sales",
    description: "Manage sales and their line-item details.",
    href: "/dashboard/sales",
  },
  {
    key: "reports",
    name: "Reports",
    title: "Reports",
    description: "View reports available to your account.",
    href: "/dashboard/reports",
  },
] as const;

export type DashboardModuleKey = (typeof DASHBOARD_MODULES)[number]["key"];
export type DashboardRole = "superadmin" | "admin" | "user";
export type DashboardAccess = {
  userId: string;
  email: string;
  role: DashboardRole;
  moduleKeys: DashboardModuleKey[];
};

function isDashboardRole(role: string): role is DashboardRole {
  return role === "superadmin" || role === "admin" || role === "user";
}

function isDashboardModuleKey(key: string): key is DashboardModuleKey {
  return DASHBOARD_MODULES.some((module) => module.key === key);
}

export async function getDashboardAccess(): Promise<DashboardAccess> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/");

  const { data: profile, error: profileError } = await supabase
    .from("account_profiles")
    .select("role, status, must_change_password")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to verify dashboard access: ${profileError.message}`);
  }
  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirect("/");
  }
  if (profile.must_change_password) redirect("/set-password");
  if (!isDashboardRole(profile.role)) {
    throw new Error("The account has an unsupported role.");
  }

  if (profile.role === "admin" || profile.role === "superadmin") {
    return {
      userId: user.id,
      email: user.email ?? "",
      role: profile.role,
      moduleKeys: DASHBOARD_MODULES.map((module) => module.key),
    };
  }

  const admin = createSupabaseAdminClient();
  const [
    { data: modules, error: modulesError },
    { data: actions, error: actionsError },
    { data: assignedRights, error: rightsError },
  ] = await Promise.all([
    admin.from("permission_modules").select("id, key"),
    admin.from("permission_actions").select("id, module_id"),
    admin.from("user_permissions").select("permission_id").eq("user_id", user.id),
  ]);

  if (modulesError) throw new Error(`Unable to load permission modules: ${modulesError.message}`);
  if (actionsError) throw new Error(`Unable to load permission actions: ${actionsError.message}`);
  if (rightsError) throw new Error(`Unable to load assigned permissions: ${rightsError.message}`);

  const moduleKeyById = new Map(
    (modules ?? []).flatMap((module) =>
      isDashboardModuleKey(module.key) ? [[module.id, module.key] as const] : [],
    ),
  );
  const moduleKeyByActionId = new Map<number, DashboardModuleKey>();
  for (const action of actions ?? []) {
    const moduleKey = moduleKeyById.get(action.module_id);
    if (moduleKey) moduleKeyByActionId.set(action.id, moduleKey);
  }

  const accessibleModuleKeys = new Set<DashboardModuleKey>();
  for (const right of assignedRights ?? []) {
    const moduleKey = moduleKeyByActionId.get(right.permission_id);
    if (!moduleKey) {
      throw new Error("An assigned permission is missing from the permission catalog.");
    }
    accessibleModuleKeys.add(moduleKey);
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    role: profile.role,
    moduleKeys: DASHBOARD_MODULES
      .filter((module) => accessibleModuleKeys.has(module.key))
      .map((module) => module.key),
  };
}

export function hasModuleAccess(
  access: DashboardAccess,
  moduleKey: DashboardModuleKey,
): boolean {
  return access.role !== "user" || access.moduleKeys.includes(moduleKey);
}
