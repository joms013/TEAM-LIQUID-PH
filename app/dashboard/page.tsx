import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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
  if (profile.must_change_password) redirect("/set-password");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-lg border-t-4 border-[#315b48] bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase text-[#668171]">Hope, Inc. Workspace</p>
        <h1 className="mt-3 font-[Newsreader,Georgia,serif] text-4xl text-[#172a24]">
          Welcome back
        </h1>
        <p className="mt-3 text-sm text-[#69766f]">Signed in as {user.email}</p>
        <form action={signOutAction} className="mt-8">
          <button className="rounded-[5px] bg-[#315b48] px-5 py-3 text-sm font-semibold text-white hover:bg-[#234536]" type="submit">
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}