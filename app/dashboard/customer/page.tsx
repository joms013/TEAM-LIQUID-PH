import { redirect } from "next/navigation";
import { CustomerList, type CustomerRecord } from "@/app/dashboard/customer/customer-list";
import { DashboardSidebar } from "@/app/dashboard/dashboard-sidebar";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDashboardAccess, hasModuleAccess } from "@/lib/dashboard-access";
import { getCustomerPermissions } from "@/lib/customer-permissions";

export const dynamic = "force-dynamic";

export default async function CustomerPage() {
  const access = await getDashboardAccess();
  if (!hasModuleAccess(access, "customer")) redirect("/dashboard");

  const [permissions, result] = await Promise.all([
    getCustomerPermissions(access),
    createSupabaseAdminClient()
      .from("customer")
      .select("custno, custname, address, payterm")
      .order("custno"),
  ]);
  const { data, error } = result;

  if (error) throw new Error(`Unable to load customers: ${error.message}`);

  return (
    <main className="min-h-screen bg-[#f3f6fc] text-[#172a24]">
      <DashboardSidebar access={access} currentPath="/dashboard/customer" />
      <CustomerList
        canAdd={permissions.has("customer_add")}
        canEdit={permissions.has("customer_edit")}
        customers={(data ?? []) as CustomerRecord[]}
      />
    </main>
  );
}