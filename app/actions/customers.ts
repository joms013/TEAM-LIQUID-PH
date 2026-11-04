"use server";

import { revalidatePath } from "next/cache";
import { getDashboardAccess, hasModuleAccess } from "@/lib/dashboard-access";
import {
  getCustomerPermissions,
  type CustomerPermissionCode,
} from "@/lib/customer-permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type CustomerMutationResult = { error?: string; success?: string };

type CustomerFields = {
  custname: string;
  address: string;
  payterm: "COD" | "30D" | "45D";
};

async function mayManageCustomer(
  permission: CustomerPermissionCode,
): Promise<boolean> {
  const access = await getDashboardAccess();
  if (!hasModuleAccess(access, "customer")) return false;
  const permissions = await getCustomerPermissions(access);
  return permissions.has(permission);
}

function readCustomerFields(formData: FormData): CustomerFields | string {
  const custname = String(formData.get("custname") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const payterm = String(formData.get("payterm") ?? "");

  if (custname.length < 1 || custname.length > 20) {
    return "Enter a customer name between 1 and 20 characters.";
  }
  if (address.length > 50) return "Address must be 50 characters or fewer.";
  if (payterm !== "COD" && payterm !== "30D" && payterm !== "45D") {
    return "Choose a valid payment term.";
  }

  return { custname, address, payterm };
}

async function nextCustomerNumber(): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("customer").select("custno");
  if (error) throw new Error("Unable to assign a customer number.");

  const usedNumbers = new Set((data ?? []).map((customer) => customer.custno));
  for (let number = 1; number <= 9999; number += 1) {
    const candidate = `C${String(number).padStart(4, "0")}`;
    if (!usedNumbers.has(candidate)) return candidate;
  }

  return null;
}

export async function createCustomer(
  formData: FormData,
): Promise<CustomerMutationResult> {
  if (!(await mayManageCustomer("customer_add"))) {
    return { error: "You do not have permission to add customers." };
  }

  const fields = readCustomerFields(formData);
  if (typeof fields === "string") return { error: fields };

  const admin = createSupabaseAdminClient();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const custno = await nextCustomerNumber();
    if (!custno) return { error: "No customer numbers are available." };

    const { error } = await admin.from("customer").insert({ custno, ...fields });
    if (!error) {
      revalidatePath("/dashboard/customer");
      return { success: `Customer ${custno} added.` };
    }
    if (error.code !== "23505") return { error: "Unable to add this customer." };
  }

  return { error: "A customer was added at the same time. Please submit again." };
}

export async function updateCustomer(
  custno: string,
  formData: FormData,
): Promise<CustomerMutationResult> {
  if (!(await mayManageCustomer("customer_edit"))) {
    return { error: "You do not have permission to edit customers." };
  }
  if (!/^C\d{4}$/.test(custno)) return { error: "Choose a valid customer record." };

  const fields = readCustomerFields(formData);
  if (typeof fields === "string") return { error: fields };

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("customer")
    .update(fields)
    .eq("custno", custno)
    .select("custno")
    .maybeSingle();

  if (error) return { error: "Unable to save this customer." };
  if (!data) return { error: "This customer no longer exists." };

  revalidatePath("/dashboard/customer");
  return { success: "Customer changes saved." };
}