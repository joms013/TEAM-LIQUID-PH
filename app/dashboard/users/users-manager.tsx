"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  Check,
  CircleUserRound,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  UserRoundPlus,
  Users,
} from "lucide-react";
import {
  createManagedUser,
  setManagedUserStatus,
  updateManagedUser,
  type UserManagementResult,
  type UserRole,
} from "@/app/actions/users";

export type ManagedUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: "active" | "blocked";
  createdAt: string;
  mustChangePassword: boolean;
};

type Props = {
  actorId: string;
  actorRole: UserRole;
  currentEmail: string;
  users: ManagedUser[];
  onSignOut: () => Promise<void>;
};

type Filter = "all" | "active" | "blocked";
type DialogState =
  | { kind: "edit"; user: ManagedUser }
  | { kind: "status"; user: ManagedUser; nextStatus: "active" | "blocked" }
  | { kind: "create" };

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      aria-labelledby="user-dialog-title"
      className="user-dialog"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="user-dialog-content">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-[Newsreader,Georgia,serif] text-3xl text-[#172a24]" id="user-dialog-title">
            {title}
          </h2>
          <button
            aria-label="Close dialog"
            className="user-icon-button"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function UsersManager({
  actorId,
  actorRole,
  currentEmail,
  users,
  onSignOut,
}: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const isSuperadmin = actorRole === "superadmin";

  const searchedUsers = users.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const visibleUsers =
    filter === "all"
      ? searchedUsers
      : searchedUsers.filter((user) => user.status === filter);
  const counts = {
    all: searchedUsers.length,
    active: searchedUsers.filter((user) => user.status === "active").length,
    blocked: searchedUsers.filter((user) => user.status === "blocked").length,
  };

  function runAction(action: () => Promise<UserManagementResult>) {
    setErrorMessage("");
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }
      setDialog(null);
      router.refresh();
    });
  }

  function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dialog || (dialog.kind !== "create" && dialog.kind !== "edit")) return;
    const formData = new FormData(event.currentTarget);
    if (dialog.kind === "create") {
      runAction(() => createManagedUser(formData));
    } else {
      runAction(() => updateManagedUser(dialog.user.id, formData));
    }
  }

  const openEdit = (user: ManagedUser) => {
    setErrorMessage("");
    setDialog({ kind: "edit", user });
  };

  const openCreate = () => {
    setErrorMessage("");
    setDialog({ kind: "create" });
  };

  const rowActions = (user: ManagedUser) => {
    if (user.id === actorId) {
      return <span className="text-xs font-semibold text-[#69766f]">You</span>;
    }
    if (!isSuperadmin && user.role !== "user") {
      return (
        <span
          className="text-xs text-[#69766f]"
          title="Admins can manage user accounts only."
        >
          Read only
        </span>
      );
    }

    return (
      <div className="flex flex-wrap justify-end gap-2">
        <button
          aria-label={`Edit ${user.name}`}
          className="user-action-button"
          onClick={() => openEdit(user)}
          type="button"
        >
          <Pencil aria-hidden="true" size={15} />
          <span>Edit</span>
        </button>
        <button
          aria-label={`${user.status === "active" ? "Block" : "Unblock"} ${user.name}`}
          className={`user-action-button ${user.status === "active" ? "user-danger" : "user-success"}`}
          onClick={() =>
            setDialog({
              kind: "status",
              user,
              nextStatus: user.status === "active" ? "blocked" : "active",
            })
          }
          type="button"
        >
          {user.status === "active" ? (
            <Ban aria-hidden="true" size={15} />
          ) : (
            <Check aria-hidden="true" size={15} />
          )}
          <span>{user.status === "active" ? "Block" : "Unblock"}</span>
        </button>
      </div>
    );
  };

  const userSummary = (user: ManagedUser) => (
    <div className="flex min-w-0 items-center gap-3">
      <span className="user-avatar" aria-hidden="true">{initials(user.name)}</span>
      <span className="min-w-0">
        <span className="block truncate font-semibold text-[#172a24]">{user.name}</span>
        <span className="block truncate text-xs text-[#69766f]">{user.email}</span>
      </span>
    </div>
  );

  const rolePill = (role: UserRole) => (
    <span className={`user-role user-role-${role}`}>
      {role === "superadmin" && <ShieldCheck aria-hidden="true" size={13} />}
      {role}
    </span>
  );

  const statusPill = (status: ManagedUser["status"]) => (
    <span className={`user-status user-status-${status}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );

  return (
    <main className="min-h-screen bg-[#f3f6fc] text-[#172a24]">
      <aside className="users-sidebar">
        <a className="flex items-center gap-3 px-2 py-2 text-[#172a24] no-underline" href="/dashboard">
          <span className="grid size-10 place-items-center rounded-lg bg-[#315b48] text-lg font-bold text-white">H</span>
          <span>
            <span className="block text-sm font-bold">Hope, Inc. ERP</span>
            <span className="block text-xs text-[#69766f]">TEAM LIQUID PH</span>
          </span>
        </a>
        <p className="users-nav-label">Menu</p>
        {isSuperadmin && (
          <a className="users-nav-link" href="/dashboard">
            <ArrowLeft aria-hidden="true" size={18} />
            Home
          </a>
        )}
        <a aria-current="page" className="users-nav-link users-nav-current" href="/dashboard/users">
          <Users aria-hidden="true" size={18} />
          Users
          <span className="ml-auto rounded-md bg-white/15 px-2 py-0.5 text-xs">{users.length}</span>
        </a>
        <div className="mt-auto rounded-xl border border-[#dce3dc] bg-[#f7f8f5] p-3">
          <div className="flex items-center gap-2">
            <CircleUserRound aria-hidden="true" className="text-[#315b48]" size={20} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{currentEmail}</span>
              <span className="block text-xs capitalize text-[#69766f]">{actorRole}</span>
            </span>
          </div>
          <form action={onSignOut} className="mt-3">
            <button className="text-xs font-semibold text-[#315b48] underline underline-offset-4" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <section className="users-main">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#668171]">
              People &amp; access
            </p>
            <h1 className="font-[Newsreader,Georgia,serif] text-4xl leading-tight text-[#172a24]">
              User management
            </h1>
            <p className="mt-2 text-sm text-[#69766f]">
              Add team members, update their details, and manage account access.
            </p>
          </div>
          <button className="user-primary-button" onClick={openCreate} type="button">
            <Plus aria-hidden="true" size={18} />
            Add user
          </button>
        </header>

        {!isSuperadmin && (
          <p className="mt-5 flex items-center gap-2 rounded-lg border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-[#55657d]">
            <ShieldCheck aria-hidden="true" size={17} />
            You can manage user accounts only. Superadmin accounts are hidden.
          </p>
        )}

        {errorMessage && (
          <p aria-live="polite" className="mt-5 rounded-lg border border-[#ead7c9] bg-[#fff8f2] px-4 py-3 text-sm text-[#775344]">
            {errorMessage}
          </p>
        )}

        <section aria-label="User list" className="mt-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div aria-label="Filter users by status" className="user-filter-group" role="group">
              {(["all", "active", "blocked"] as const).map((value) => (
                <button
                  aria-pressed={filter === value}
                  className={`user-filter ${filter === value ? "user-filter-selected" : ""}`}
                  key={value}
                  onClick={() => setFilter(value)}
                  type="button"
                >
                  <span className="capitalize">{value}</span>
                  <span className="user-filter-count">{counts[value]}</span>
                </button>
              ))}
            </div>
            <label className="user-search">
              <Search aria-hidden="true" className="text-[#829087]" size={18} />
              <span className="sr-only">Search users by name or email</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or email"
                type="search"
                value={query}
              />
            </label>
          </div>

          <div className="user-table-shell">
            <table className="user-table">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Access</th>
                  <th className="text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{userSummary(user)}</td>
                    <td>{rolePill(user.role)}</td>
                    <td>{statusPill(user.status)}</td>
                    <td>
                      <span className="text-xs text-[#55657d]">
                        {user.role === "user" ? "Standard access" : "All modules"}
                      </span>
                    </td>
                    <td className="text-right">{rowActions(user)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {visibleUsers.map((user) => (
              <article className="user-mobile-card" key={`mobile-${user.id}`}>
                <div className="flex items-start justify-between gap-3">
                  {userSummary(user)}
                  {statusPill(user.status)}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  {rolePill(user.role)}
                  <span className="text-xs text-[#55657d]">
                    {user.role === "user" ? "Standard access" : "All modules"}
                  </span>
                </div>
                <div className="mt-4 border-t border-[#e7ecf1] pt-3">{rowActions(user)}</div>
              </article>
            ))}

            {visibleUsers.length === 0 && (
              <div className="user-empty-state">
                <UserRoundPlus aria-hidden="true" className="mx-auto text-[#8fa59a]" size={30} />
                <h2 className="mt-3 font-semibold text-[#172a24]">No users found</h2>
                <p className="mt-1 text-sm text-[#69766f]">
                  {query
                    ? "Try a different name or email."
                    : filter === "all"
                      ? "Add a user to get started."
                      : `There are no ${filter} accounts.`}
                </p>
                {!query && filter === "all" && (
                  <button className="user-primary-button mt-4" onClick={openCreate} type="button">
                    <Plus aria-hidden="true" size={17} />
                    Add user
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </section>

      {dialog?.kind === "create" && (
        <Modal onClose={() => setDialog(null)} title="Add a user">
          <form className="mt-5 space-y-4" onSubmit={submitUser}>
            <label className="user-field">
              <span>Full name</span>
              <input autoComplete="name" maxLength={100} minLength={2} name="name" required />
            </label>
            <label className="user-field">
              <span>Work email</span>
              <input autoComplete="email" name="email" required type="email" />
            </label>
            {isSuperadmin ? (
              <label className="user-field">
                <span>Role</span>
                <select defaultValue="user" name="role">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </label>
            ) : (
              <input name="role" type="hidden" value="user" />
            )}
            <p className="text-xs leading-5 text-[#69766f]">
              An invitation email will be sent so the person can set their password.
            </p>
            {errorMessage && <p aria-live="polite" className="user-form-error">{errorMessage}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button className="user-secondary-button" onClick={() => setDialog(null)} type="button">Cancel</button>
              <button className="user-primary-button" disabled={isPending} type="submit">
                <UserRoundPlus aria-hidden="true" size={17} />
                {isPending ? "Sending…" : "Send invitation"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {dialog?.kind === "edit" && (
        <Modal onClose={() => setDialog(null)} title="Edit user">
          <form className="mt-5 space-y-4" onSubmit={submitUser}>
            <label className="user-field">
              <span>Full name</span>
              <input defaultValue={dialog.user.name} maxLength={100} minLength={2} name="name" required />
            </label>
            <label className="user-field">
              <span>Work email</span>
              <input defaultValue={dialog.user.email} name="email" required type="email" />
            </label>
            {isSuperadmin ? (
              <label className="user-field">
                <span>Role</span>
                <select defaultValue={dialog.user.role} name="role">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </label>
            ) : (
              <input name="role" type="hidden" value="user" />
            )}
            <p className="text-xs leading-5 text-[#69766f]">
              If the email changes, the account owner may need to confirm the new address.
            </p>
            {errorMessage && <p aria-live="polite" className="user-form-error">{errorMessage}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button className="user-secondary-button" onClick={() => setDialog(null)} type="button">Cancel</button>
              <button className="user-primary-button" disabled={isPending} type="submit">
                <Check aria-hidden="true" size={17} />
                {isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {dialog?.kind === "status" && (
        <Modal
          onClose={() => setDialog(null)}
          title={dialog.nextStatus === "blocked" ? "Block this user?" : "Unblock this user?"}
        >
          <p className="mt-4 text-sm leading-6 text-[#55657d]">
            {dialog.nextStatus === "blocked"
              ? `${dialog.user.name} will no longer be able to sign in.`
              : `${dialog.user.name} will be able to sign in again.`}
          </p>
          {errorMessage && <p aria-live="polite" className="user-form-error mt-4">{errorMessage}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <button className="user-secondary-button" onClick={() => setDialog(null)} type="button">Cancel</button>
            <button
              className={`user-primary-button ${dialog.nextStatus === "blocked" ? "user-primary-danger" : ""}`}
              disabled={isPending}
              onClick={() =>
                runAction(() => setManagedUserStatus(dialog.user.id, dialog.nextStatus))
              }
              type="button"
            >
              {dialog.nextStatus === "blocked" ? <Ban aria-hidden="true" size={17} /> : <Check aria-hidden="true" size={17} />}
              {isPending ? "Updating…" : dialog.nextStatus === "blocked" ? "Block user" : "Unblock user"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
