"use server";

import { revalidatePath } from "next/cache";
import { getDashboardAccess, hasModuleAccess } from "@/lib/dashboard-access";
import {
  getProductPermissions,
  type ProductPermissionCode,
} from "@/lib/product-permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ProductMutationResult = { error?: string; success?: string };

type ProductFields = {
  description: string;
  unit: "pc" | "ea" | "mtr" | "pkg" | "ltr";
};

const PRODUCT_CODE = /^[A-Z]{2}\d{4}$/;
const PRODUCT_UNITS = ["pc", "ea", "mtr", "pkg", "ltr"] as const;

async function mayManageProduct(
  permission: ProductPermissionCode,
): Promise<boolean> {
  const access = await getDashboardAccess();
  if (!hasModuleAccess(access, "product")) return false;
  const permissions = await getProductPermissions(access);
  return permissions.has(permission);
}

function readProductFields(formData: FormData): ProductFields | string {
  const description = String(formData.get("description") ?? "").trim();
  const unit = String(formData.get("unit") ?? "");

  if (description.length < 1 || description.length > 30) {
    return "Enter a product description between 1 and 30 characters.";
  }
  if (!PRODUCT_UNITS.includes(unit as ProductFields["unit"])) {
    return "Choose a valid product unit.";
  }

  return { description, unit: unit as ProductFields["unit"] };
}

export async function createProduct(
  formData: FormData,
): Promise<ProductMutationResult> {
  if (!(await mayManageProduct("product_add"))) {
    return { error: "You do not have permission to add products." };
  }

  const prodcode = String(formData.get("prodcode") ?? "").trim().toUpperCase();
  if (!PRODUCT_CODE.test(prodcode)) {
    return { error: "Use a product code with 2 letters followed by 4 digits." };
  }
  const fields = readProductFields(formData);
  if (typeof fields === "string") return { error: fields };

  const { error } = await createSupabaseAdminClient()
    .from("product")
    .insert({ prodcode, ...fields });

  if (error) {
    if (error.code === "23505") return { error: "That product code already exists." };
    return { error: "Unable to add this product." };
  }

  revalidatePath("/dashboard/product");
  return { success: `Product ${prodcode} added.` };
}

export async function updateProduct(
  prodcode: string,
  formData: FormData,
): Promise<ProductMutationResult> {
  if (!(await mayManageProduct("product_edit"))) {
    return { error: "You do not have permission to edit products." };
  }
  if (!PRODUCT_CODE.test(prodcode)) return { error: "Choose a valid product record." };

  const fields = readProductFields(formData);
  if (typeof fields === "string") return { error: fields };

  const { data, error } = await createSupabaseAdminClient()
    .from("product")
    .update(fields)
    .eq("prodcode", prodcode)
    .eq("is_deleted", false)
    .select("prodcode")
    .maybeSingle();

  if (error) return { error: "Unable to save this product." };
  if (!data) return { error: "This product is inactive or no longer exists." };

  revalidatePath("/dashboard/product");
  return { success: "Product changes saved." };
}

export async function deleteProduct(
  prodcode: string,
): Promise<ProductMutationResult> {
  if (!(await mayManageProduct("product_delete"))) {
    return { error: "You do not have permission to delete products." };
  }
  if (!PRODUCT_CODE.test(prodcode)) return { error: "Choose a valid product record." };

  const { data, error } = await createSupabaseAdminClient()
    .from("product")
    .update({ is_deleted: true })
    .eq("prodcode", prodcode)
    .eq("is_deleted", false)
    .select("prodcode")
    .maybeSingle();

  if (error) {
    if (error.code === "P0001") {
      return { error: "This product has active sales or price history and cannot be deleted." };
    }
    return { error: "Unable to delete this product." };
  }
  if (!data) return { error: "This product is already inactive or no longer exists." };

  revalidatePath("/dashboard/product");
  return { success: `Product ${prodcode} moved to inactive.` };
}

export async function restoreProduct(
  prodcode: string,
): Promise<ProductMutationResult> {
  if (!(await mayManageProduct("product_delete"))) {
    return { error: "You do not have permission to restore products." };
  }
  if (!PRODUCT_CODE.test(prodcode)) return { error: "Choose a valid product record." };

  const { data, error } = await createSupabaseAdminClient()
    .from("product")
    .update({ is_deleted: false })
    .eq("prodcode", prodcode)
    .eq("is_deleted", true)
    .select("prodcode")
    .maybeSingle();

  if (error) return { error: "Unable to restore this product." };
  if (!data) return { error: "This product is already active or no longer exists." };

  revalidatePath("/dashboard/product");
  return { success: `Product ${prodcode} restored.` };
}
