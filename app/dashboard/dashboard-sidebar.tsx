import {
  BarChart3,
  Briefcase,
  Boxes,
  LayoutDashboard,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import {
  DASHBOARD_MODULES,
  type DashboardAccess,
  type DashboardModuleKey,
} from "@/lib/dashboard-access";

export const moduleIcons: Record<DashboardModuleKey, LucideIcon> = {
  customer: Users,
  product: Boxes,
  human_resources: Briefcase,
  sales: ShoppingCart,
  reports: BarChart3,
};

export function DashboardSidebar({
  access,
  currentPath,
}: {
  access: DashboardAccess;
  currentPath: string;
}) {
  const modules = DASHBOARD_MODULES.filter((module) =>
    access.moduleKeys.includes(module.key),
  );

  return (
    <aside aria-label="Main navigation" className="users-sidebar">
      <a className="flex items-center gap-3 px-2 py-2 text-[#172a24] no-underline" href="/dashboard">
        <span className="grid size-10 place-items-center rounded-lg bg-[#315b48] text-lg font-bold text-white">H</span>
        <span>
          <span className="block text-sm font-bold">Hope, Inc. ERP</span>
          <span className="block text-xs text-[#69766f]">TEAM LIQUID PH</span>
        </span>
      </a>
      <p className="users-nav-label">Workspace</p>
      <a
        aria-current={currentPath === "/dashboard" ? "page" : undefined}
        className={`users-nav-link ${currentPath === "/dashboard" ? "users-nav-current" : ""}`}
        href="/dashboard"
      >
        <LayoutDashboard aria-hidden="true" size={18} />
        Home
      </a>
      {modules.map((module) => {
        const Icon = moduleIcons[module.key];
        return (
          <a
            aria-current={currentPath === module.href ? "page" : undefined}
            className={`users-nav-link ${currentPath === module.href ? "users-nav-current" : ""}`}
            href={module.href}
            key={module.key}
          >
            <Icon aria-hidden="true" size={18} />
            {module.name}
          </a>
        );
      })}
      {(access.role === "admin" || access.role === "superadmin") && (
        <>
          <p className="users-nav-label">Administration</p>
          <a
            aria-current={currentPath === "/dashboard/users" ? "page" : undefined}
            className={`users-nav-link ${currentPath === "/dashboard/users" ? "users-nav-current" : ""}`}
            href="/dashboard/users"
          >
            <Users aria-hidden="true" size={18} />
            Users
          </a>
        </>
      )}
      <div className="mt-auto rounded-xl border border-[#dce3dc] bg-[#f7f8f5] p-3">
        <span className="block truncate text-sm font-semibold">{access.email}</span>
        <span className="block text-xs capitalize text-[#69766f]">{access.role}</span>
        <form action={signOutAction} className="mt-3">
          <button className="text-xs font-semibold text-[#315b48] underline underline-offset-4" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
