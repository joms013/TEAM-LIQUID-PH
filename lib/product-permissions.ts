import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DashboardAccess } from "@/lib/dashboard-access";

export type ProductPermissionCode = "product_add" | "product_edit" | "product_delete";

export async function getProductPermissions(
  access: DashboardAccess,
): Promise<Set<ProductPermissionCode>> {
  if (access.role !== "user") {
    return new Set(["product_add", "product_edit", "product_delete"]);
  }

  const admin = createSupabaseAdminClient();
  const { data: actions, error: actionsError } = await admin
    .from("permission_actions")
    .select("id, code")
    .in("code", ["product_add", "product_edit", "product_delete"]);

  if (actionsError) {
    throw new Error(`Unable to load product permissions: ${actionsError.message}`);
  }

  const codeById = new Map(
    (actions ?? []).map((action) => [action.id, action.code as ProductPermissionCode]),
  );
  if (codeById.size === 0) return new Set();

  const { data: assignedRights, error: rightsError } = await admin
    .from("user_permissions")
    .select("permission_id")
    .eq("user_id", access.userId)
    .in("permission_id", [...codeById.keys()]);

  if (rightsError) {
    throw new Error(`Unable to load product permissions: ${rightsError.message}`);
  }

  return new Set(
    (assignedRights ?? [])
      .map((right) => codeById.get(right.permission_id))
      .filter((code): code is ProductPermissionCode => Boolean(code)),
  );
}
