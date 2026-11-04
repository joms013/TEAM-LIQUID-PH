import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import type { UserRole } from "@/app/actions/users";
import { UsersManager, type ManagedUser } from "@/app/dashboard/users/users-manager";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function UserManagementPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile, error: profileError } = await supabase
    .from("account_profiles")
    .select("role, status, must_change_password")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirect("/");
  }
  if (profile.must_change_password) redirect("/set-password");
  if (profile.role !== "admin" && profile.role !== "superadmin") {
    redirect("/dashboard");
  }

  const admin = createSupabaseAdminClient();
  const [
    { data: authData, error: authError },
    { data: profileData, error: accountsError },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin
      .from("account_profiles")
      .select("user_id, role, status, created_at, must_change_password"),
  ]);

  if (authError) throw new Error(`Unable to load users: ${authError.message}`);
  if (accountsError) throw new Error(`Unable to load user profiles: ${accountsError.message}`);

  const accountById = new Map(
    (profileData ?? []).map((account) => [account.user_id, account]),
  );
  const managedUsers: ManagedUser[] = authData.users.flatMap((authUser) => {
    const account = accountById.get(authUser.id);
    if (!account || (profile.role === "admin" && account.role === "superadmin")) {
      return [];
    }

    return [{
      id: authUser.id,
      email: authUser.email ?? "",
      name:
        typeof authUser.user_metadata.full_name === "string"
          ? authUser.user_metadata.full_name
          : authUser.email?.split("@")[0] ?? "Unnamed user",
      role: account.role as UserRole,
      status: account.status as "active" | "blocked",
      createdAt: account.created_at,
      mustChangePassword: account.must_change_password,
    }];
  });

  managedUsers.sort((first, second) => first.name.localeCompare(second.name));

  return (
    <UsersManager
      actorId={user.id}
      actorRole={profile.role as UserRole}
      currentEmail={user.email ?? ""}
      onSignOut={signOutAction}
      users={managedUsers}
    />
  );
}
