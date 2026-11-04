"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionState =
  | { error?: string; message?: string; success?: boolean }
  | null;

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) return { error: "Enter your work email address." };
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      error: "Password recovery is not configured. Contact your administrator.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return {
      error: "Password recovery is not configured. Contact your administrator.",
    };
  }

  let redirectTo: string;
  try {
    const appUrl = new URL(siteUrl);
    if (appUrl.protocol !== "https:" && appUrl.hostname !== "localhost") {
      return {
        error: "Password recovery is not configured. Contact your administrator.",
      };
    }

    const callbackUrl = new URL("/auth/callback", appUrl);
    callbackUrl.searchParams.set("next", "/set-password?recovery=1");
    redirectTo = callbackUrl.toString();
  } catch {
    return {
      error: "Password recovery is not configured. Contact your administrator.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return {
      error: "Unable to send reset instructions. Please try again.",
    };
  }

  return {
    message: "If an account exists for that email, reset instructions have been sent.",
    success: true,
  };
}

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

export async function setRecoveredPasswordAction(
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const { error: passwordError } = await supabase.auth.updateUser({ password });
  if (passwordError) {
    return {
      error: "Unable to update your password. The reset link may have expired; request a new one and try again.",
    };
  }

  if (profile.must_change_password) {
    const { data: completed, error: completionError } = await supabase.rpc(
      "complete_first_login_password",
    );
    if (completionError || !completed) {
      return {
        error: "Your password was updated, but account setup is incomplete. Please try again.",
      };
    }
  }

  redirect("/dashboard");
}