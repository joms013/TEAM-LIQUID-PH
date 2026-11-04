import { redirect } from "next/navigation";
import { ProductList, type ProductRecord } from "@/app/dashboard/product/product-list";
import { DashboardSidebar } from "@/app/dashboard/dashboard-sidebar";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDashboardAccess, hasModuleAccess } from "@/lib/dashboard-access";
import { getProductPermissions } from "@/lib/product-permissions";

export const dynamic = "force-dynamic";

export default async function ProductPage() {
  const access = await getDashboardAccess();
  if (!hasModuleAccess(access, "product")) redirect("/dashboard");

  const permissions = await getProductPermissions(access);
  const { data, error } = await createSupabaseAdminClient()
    .from("product")
    .select("prodcode, description, unit, is_deleted")
    .eq("is_deleted", false)
    .order("prodcode");

  if (error) throw new Error(`Unable to load products: ${error.message}`);

  return (
    <main className="min-h-screen bg-[#f3f6fc] text-[#172a24]">
      <DashboardSidebar access={access} currentPath="/dashboard/product" />
      <ProductList
        canAdd={permissions.has("product_add")}
        canEdit={permissions.has("product_edit")}
        products={(data ?? []) as ProductRecord[]}
      />
    </main>
  );
}
