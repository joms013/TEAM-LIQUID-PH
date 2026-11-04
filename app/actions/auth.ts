"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionState = { error: string } | null;

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your work email and password." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "We couldn't sign you in with those details." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("account_profiles")
    .select("status, must_change_password")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { error: "We couldn't verify account access. Contact your administrator." };
  }

  if (profile.status !== "active") {
    await supabase.auth.signOut();
    return { error: "This account is blocked. Contact your administrator." };
  }

  if (profile.must_change_password) redirect("/set-password");
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function setFirstPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "Choose a password with at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "The passwords do not match." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile, error: profileError } = await supabase
    .from("account_profiles")
    .select("status, must_change_password")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirect("/");
  }
  if (!profile.must_change_password) redirect("/dashboard");

  const { error: passwordError } = await supabase.auth.updateUser({ password });
  if (passwordError) return { error: "We couldn't update your password. Please try again." };

  const { data: completed, error: completionError } = await supabase.rpc(
    "complete_first_login_password",
  );
  if (completionError || !completed) {
    return { error: "Your password was updated, but account setup is incomplete. Please try again." };
  }

  redirect("/dashboard");
}