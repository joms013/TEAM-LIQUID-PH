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
    .select("role, status, must_change_password")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirect("/");
  }
  if (profile.must_change_password) redirect("/set-password");
  if (profile.role === "admin") redirect("/dashboard/users");

  return (
    <main className="min-h-screen bg-[#f3f6fc] px-6 py-12">
      <section className="mx-auto w-full max-w-3xl border-t-4 border-[#315b48] bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#668171]">Hope, Inc. Workspace</p>
            <h1 className="mt-3 font-[Newsreader,Georgia,serif] text-4xl text-[#172a24]">
              Welcome back
            </h1>
            <p className="mt-3 text-sm text-[#69766f]">Signed in as {user.email}</p>
          </div>
          <form action={signOutAction}>
            <button className="rounded-[5px] border border-[#dce3dc] px-4 py-2 text-sm font-semibold text-[#315b48] hover:bg-[#f1f4ef]" type="submit">
              Sign out
            </button>
          </form>
        </div>
        {profile.role === "superadmin" && (
          <a
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#315b48] px-5 py-3 text-sm font-semibold text-white no-underline hover:bg-[#234536]"
            href="/dashboard/users"
          >
            Manage users
          </a>
        )}
      </section>
    </main>
  );
}