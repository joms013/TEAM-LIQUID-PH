import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PasswordForm from "./password-form";

export const dynamic = "force-dynamic";

export default async function SetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile, error } = await supabase
    .from("account_profiles")
    .select("status, must_change_password")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirect("/");
  }
  if (!profile.must_change_password) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md bg-white p-8 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase text-[#668171]">Account security</p>
        <h1 className="mt-3 font-[Newsreader,Georgia,serif] text-4xl text-[#172a24]">
          Set your password
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#69766f]">
          Choose a new password to finish setting up your account.
        </p>
        <PasswordForm />
      </section>
    </main>
  );
}