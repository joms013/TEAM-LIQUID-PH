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
  const canDelete = permissions.has("product_delete");
  let productQuery = createSupabaseAdminClient()
    .from("product")
    .select("prodcode, description, unit, is_deleted")
    .order("prodcode");
  if (!canDelete) productQuery = productQuery.eq("is_deleted", false);
  const { data, error } = await productQuery;

  if (error) throw new Error(`Unable to load products: ${error.message}`);

  return (
    <main className="min-h-screen bg-[#f3f6fc] text-[#172a24]">
      <DashboardSidebar access={access} currentPath="/dashboard/product" />
      <ProductList
        canAdd={permissions.has("product_add")}
        canEdit={permissions.has("product_edit")}
        canDelete={canDelete}
        products={(data ?? []) as ProductRecord[]}
      />
    </main>
  );
}
