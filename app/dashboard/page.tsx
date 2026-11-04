import { ArrowUpRight, ShieldCheck, Users } from "lucide-react";
import { DashboardSidebar, moduleIcons } from "@/app/dashboard/dashboard-sidebar";
import { getDashboardAccess, DASHBOARD_MODULES } from "@/lib/dashboard-access";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const access = await getDashboardAccess();

  const modules = DASHBOARD_MODULES.filter((module) =>
    access.moduleKeys.includes(module.key),
  );
  const canManageUsers = access.role === "admin" || access.role === "superadmin";

  return (
    <main className="min-h-screen bg-[#f3f6fc] text-[#172a24]">
      <DashboardSidebar access={access} currentPath="/dashboard" />
      <section className="users-main">
        <header className="mb-9 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#668171]">
              Hope, Inc. Workspace
            </p>
            <h1 className="font-[Newsreader,Georgia,serif] text-4xl leading-tight text-[#172a24]">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[#69766f]">
              Choose a workspace to continue.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dce3dc] bg-white px-3 py-2 text-xs font-semibold capitalize text-[#315b48]">
            <ShieldCheck aria-hidden="true" size={15} />
            {access.role}
          </span>
        </header>

        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-[Newsreader,Georgia,serif] text-2xl text-[#172a24]">
              Your modules
            </h2>
            <p className="mt-1 text-sm text-[#69766f]">
              Available modules are based on your account access.
            </p>
          </div>
          <span className="hidden text-xs font-medium text-[#69766f] sm:block">
            {modules.length} available
          </span>
        </div>

        {modules.length > 0 || canManageUsers ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => {
              const Icon = moduleIcons[module.key];
              return (
                <a
                  className="dashboard-module-card group"
                  href={module.href}
                  key={module.key}
                >
                  <span className="dashboard-module-icon">
                    <Icon aria-hidden="true" size={21} />
                  </span>
                  <span className="mt-5 flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-semibold text-[#172a24]">
                        {module.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-[#69766f]">
                        {module.description}
                      </span>
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-[#668171] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      size={18}
                    />
                  </span>
                </a>
              );
            })}
            {canManageUsers && (
              <a className="dashboard-module-card group" href="/dashboard/users">
                <span className="dashboard-module-icon">
                  <Users aria-hidden="true" size={21} />
                </span>
                <span className="mt-5 flex items-start justify-between gap-3">
                  <span>
                    <span className="block font-semibold text-[#172a24]">
                      User management
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[#69766f]">
                      Manage accounts, roles, and module permissions.
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-[#668171] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    size={18}
                  />
                </span>
              </a>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#cbd7d0] bg-white px-6 py-10 text-center">
            <h3 className="font-semibold text-[#172a24]">No modules assigned yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#69766f]">
              Contact an administrator to request access to the modules you need.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
