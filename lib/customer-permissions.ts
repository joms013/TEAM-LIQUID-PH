import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DashboardAccess } from "@/lib/dashboard-access";

export type CustomerPermissionCode =
  | "customer_add"
  | "customer_edit"
  | "customer_delete";

export async function getCustomerPermissions(
  access: DashboardAccess,
): Promise<Set<CustomerPermissionCode>> {
  if (access.role !== "user") {
    return new Set(["customer_add", "customer_edit", "customer_delete"]);
  }

  const admin = createSupabaseAdminClient();
  const { data: actions, error: actionsError } = await admin
    .from("permission_actions")
    .select("id, code")
    .in("code", ["customer_add", "customer_edit", "customer_delete"]);

  if (actionsError) {
    throw new Error(`Unable to load customer permissions: ${actionsError.message}`);
  }

  const codeById = new Map(
    (actions ?? []).map((action) => [action.id, action.code as CustomerPermissionCode]),
  );
  if (codeById.size === 0) return new Set();

  const { data: assignedRights, error: rightsError } = await admin
    .from("user_permissions")
    .select("permission_id")
    .eq("user_id", access.userId)
    .in("permission_id", [...codeById.keys()]);

  if (rightsError) {
    throw new Error(`Unable to load customer permissions: ${rightsError.message}`);
  }

  return new Set(
    (assignedRights ?? [])
      .map((right) => codeById.get(right.permission_id))
      .filter((code): code is CustomerPermissionCode => Boolean(code)),
  );
}