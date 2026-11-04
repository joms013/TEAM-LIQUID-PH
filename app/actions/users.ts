"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserRole = "superadmin" | "admin" | "user";
export type UserManagementResult = { error?: string; success?: string };

type Manager = {
  id: string;
  role: UserRole;
};

async function getManager(): Promise<Manager | UserManagementResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: "Sign in to manage users." };

  const { data: profile, error } = await supabase
    .from("account_profiles")
    .select("role, status, must_change_password")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return { error: "Unable to verify your user-management access." };
  }
  if (profile.status !== "active" || profile.must_change_password) {
    return { error: "Your account is not permitted to manage users." };
  }
  if (profile.role !== "admin" && profile.role !== "superadmin") {
    return { error: "You do not have permission to manage users." };
  }

  return { id: user.id, role: profile.role };
}

function isManager(value: Manager | UserManagementResult): value is Manager {
  return "id" in value;
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mayManageRole(manager: Manager, targetRole: UserRole) {
  return manager.role === "superadmin" || targetRole === "user";
}

async function getTargetRole(userId: string): Promise<UserRole | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("account_profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error("Unable to load the target user's role.");
  return data?.role === "admin" || data?.role === "superadmin" ? data.role : data ? "user" : null;
}

export async function createManagedUser(
  formData: FormData,
): Promise<UserManagementResult> {
  const manager = await getManager();
  if (!isManager(manager)) return manager;

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "user") as UserRole;

  if (name.length < 2 || name.length > 100) {
    return { error: "Enter a name between 2 and 100 characters." };
  }
  if (!validEmail(email)) return { error: "Enter a valid email address." };
  if (!["user", "admin", "superadmin"].includes(role)) {
    return { error: "Choose a valid role." };
  }
  if (!mayManageRole(manager, role)) {
    return { error: "Admins can create user accounts only." };
  }

  const admin = createSupabaseAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  let redirectTo: string | undefined;
  if (siteUrl) {
    try {
      const base = new URL(siteUrl);
      if (base.protocol === "https:" || base.hostname === "localhost") {
        redirectTo = new URL("/auth/callback?next=/set-password", base).toString();
      }
    } catch {
      return { error: "The configured application URL is invalid." };
    }
  }

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: name },
    ...(redirectTo ? { redirectTo } : {}),
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Unable to invite this user." };
  }

  const { error: profileError } = await admin
    .from("account_profiles")
    .update({ role })
    .eq("user_id", data.user.id);

  if (profileError) {
    return {
      error:
        "The invitation was sent, but the account role could not be saved. Contact your administrator before the user accepts.",
    };
  }

  revalidatePath("/dashboard/users");
  return { success: "Invitation sent." };
}

export async function updateManagedUser(
  userId: string,
  formData: FormData,
): Promise<UserManagementResult> {
  const manager = await getManager();
  if (!isManager(manager)) return manager;
  if (!userId || userId === manager.id) {
    return { error: "You cannot edit your own account here." };
  }

  const targetRole = await getTargetRole(userId);
  if (!targetRole || !mayManageRole(manager, targetRole)) {
    return { error: "You do not have permission to edit this account." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? targetRole) as UserRole;

  if (name.length < 2 || name.length > 100) {
    return { error: "Enter a name between 2 and 100 characters." };
  }
  if (!validEmail(email)) return { error: "Enter a valid email address." };
  if (!["user", "admin", "superadmin"].includes(role)) {
    return { error: "Choose a valid role." };
  }
  if (!mayManageRole(manager, role)) {
    return { error: "Admins can assign the user role only." };
  }

  const admin = createSupabaseAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    email,
    user_metadata: { full_name: name },
  });
  if (authError) return { error: authError.message };

  const { error: profileError } = await admin
    .from("account_profiles")
    .update({ role })
    .eq("user_id", userId);
  if (profileError) {
    return {
      error:
        "The profile details were saved, but the role could not be updated. Contact your administrator.",
    };
  }

  revalidatePath("/dashboard/users");
  return { success: "User updated." };
}

export async function setManagedUserStatus(
  userId: string,
  status: "active" | "blocked",
): Promise<UserManagementResult> {
  const manager = await getManager();
  if (!isManager(manager)) return manager;
  if (!userId || userId === manager.id) {
    return { error: "You cannot change your own account status." };
  }
  if (status !== "active" && status !== "blocked") {
    return { error: "Choose a valid account status." };
  }

  const role = await getTargetRole(userId);
  if (!role || !mayManageRole(manager, role)) {
    return { error: "You do not have permission to change this account." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("account_profiles")
    .update({ status })
    .eq("user_id", userId);

  if (error) return { error: "Unable to update this user's status." };
  revalidatePath("/dashboard/users");
  return { success: status === "blocked" ? "User blocked." : "User unblocked." };
}
