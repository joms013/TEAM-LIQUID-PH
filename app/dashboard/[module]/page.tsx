import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { DashboardSidebar } from "@/app/dashboard/dashboard-sidebar";
import {
  DASHBOARD_MODULES,
  getDashboardAccess,
  hasModuleAccess,
} from "@/lib/dashboard-access";

export const dynamic = "force-dynamic";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleKey } = await params;
  const module = DASHBOARD_MODULES.find((item) => item.key === moduleKey);
  if (!module) notFound();

  const access = await getDashboardAccess();
  if (!hasModuleAccess(access, module.key)) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[#f3f6fc] text-[#172a24]">
      <DashboardSidebar access={access} currentPath={module.href} />
      <section className="users-main">
        <a
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#315b48] no-underline hover:underline"
          href="/dashboard"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          All modules
        </a>
        <div className="max-w-3xl border-t-4 border-[#315b48] bg-white p-7 shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#668171]">
            {module.name}
          </p>
          <h1 className="mt-3 font-[Newsreader,Georgia,serif] text-4xl text-[#172a24]">
            {module.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#69766f]">
            {module.description} Your account has permission to open this module.
          </p>
        </div>
      </section>
    </main>
  );
}
