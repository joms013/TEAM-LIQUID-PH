"use client";

import {
  ArrowLeft,
  Check,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createCustomer,
  deleteCustomer,
  restoreCustomer,
  updateCustomer,
  type CustomerMutationResult,
} from "@/app/actions/customers";

export type CustomerRecord = {
  custno: string;
  custname: string | null;
  address: string | null;
  payterm: "COD" | "30D" | "45D" | null;
  is_deleted: boolean;
};

type PaymentFilter = "all" | NonNullable<CustomerRecord["payterm"]>;
type CustomerStatusFilter = "active" | "inactive" | "all";

const paymentFilters: { value: PaymentFilter; label: string }[] = [
  { value: "all", label: "All terms" },
  { value: "COD", label: "COD" },
  { value: "30D", label: "30 days" },
  { value: "45D", label: "45 days" },
];

export function CustomerList({
  customers,
  canAdd,
  canEdit,
  canDelete,
}: {
  customers: CustomerRecord[];
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>("active");
  const [dialog, setDialog] = useState<"create" | CustomerRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isCreate = dialog === "create";
  const selectedCustomer = dialog !== null && dialog !== "create" ? dialog : null;

  useEffect(() => {
    if (dialog) dialogRef.current?.showModal();
  }, [dialog]);
  const normalizedQuery = query.trim().toLowerCase();
  const statusCustomers = customers.filter((customer) => {
    if (!canDelete || statusFilter === "active") return !customer.is_deleted;
    if (statusFilter === "inactive") return customer.is_deleted;
    return true;
  });
  const searchedCustomers = statusCustomers.filter((customer) =>
    `${customer.custno} ${customer.custname ?? ""} ${customer.address ?? ""} ${customer.payterm ?? ""}`
      .toLowerCase()
      .includes(normalizedQuery),
  );
  const visibleCustomers =
    paymentFilter === "all"
      ? searchedCustomers
      : searchedCustomers.filter((customer) => customer.payterm === paymentFilter);
  const counts = Object.fromEntries(
    paymentFilters.map(({ value }) => [
      value,
      value === "all"
        ? searchedCustomers.length
        : searchedCustomers.filter((customer) => customer.payterm === value).length,
    ]),
  ) as Record<PaymentFilter, number>;

  function submitCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dialog) return;

    const formData = new FormData(event.currentTarget);
    setErrorMessage("");
    startTransition(async () => {
      const result: CustomerMutationResult =
        dialog === "create"
          ? await createCustomer(formData)
          : await updateCustomer(dialog.custno, formData);
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }
      setDialog(null);
      router.refresh();
    });
  }

  function openDialog(nextDialog: "create" | CustomerRecord) {
    setErrorMessage("");
    setDialog(nextDialog);
  }

  function changeCustomerStatus(customer: CustomerRecord, restore: boolean) {
    if (
      !restore &&
      !window.confirm(
        `Move ${customer.custname || customer.custno} to inactive customers?`,
      )
    ) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const result: CustomerMutationResult = restore
        ? await restoreCustomer(customer.custno)
        : await deleteCustomer(customer.custno);
      if (result.error) {
        setFeedback({ message: result.error, isError: true });
        return;
      }
      setFeedback({ message: result.success ?? "", isError: false });
      router.refresh();
    });
  }

  return (
    <section className="users-main">
      <a
        className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#315b48] no-underline hover:underline"
        href="/dashboard"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        All modules
      </a>

      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#668171]">
            Customer management
          </p>
          <h1 className="font-[Newsreader,Georgia,serif] text-4xl leading-tight text-[#172a24]">
            Customers
          </h1>
          <p className="mt-2 text-sm text-[#69766f]">
            Browse customer accounts and payment terms.
          </p>
        </div>
        <p className="text-sm font-semibold text-[#55657d]">
          {visibleCustomers.length} of {statusCustomers.length} customers
        </p>
        {canAdd && (
          <button className="user-primary-button" onClick={() => openDialog("create")} type="button">
            <Plus aria-hidden="true" size={17} />
            Add customer
          </button>
        )}
      </header>

      {feedback && (
        <p
          aria-live={feedback.isError ? "assertive" : "polite"}
          className={`mb-4 text-sm ${feedback.isError ? "text-red-700" : "text-[#315b48]"}`}
          role={feedback.isError ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}
      {canDelete && (
        <div
          aria-label="Filter customers by status"
          className="user-filter-group mb-4"
          role="group"
        >
          {([
            ["active", "Active"],
            ["inactive", "Inactive"],
            ["all", "All"],
          ] as const).map(([value, label]) => (
            <button
              aria-pressed={statusFilter === value}
              className={`user-filter ${statusFilter === value ? "user-filter-selected" : ""}`}
              key={value}
              onClick={() => setStatusFilter(value)}
              type="button"
            >
              <span>{label}</span>
              <span className="user-filter-count">
                {customers.filter((customer) =>
                  value === "all" ? true : customer.is_deleted === (value === "inactive"),
                ).length}
              </span>
            </button>
          ))}
        </div>
      )}

      <section aria-label="Customer list">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div aria-label="Filter customers by payment terms" className="user-filter-group" role="group">
            {paymentFilters.map(({ value, label }) => (
              <button
                aria-pressed={paymentFilter === value}
                className={`user-filter ${paymentFilter === value ? "user-filter-selected" : ""}`}
                key={value}
                onClick={() => setPaymentFilter(value)}
                type="button"
              >
                <span>{label}</span>
                <span className="user-filter-count">{counts[value]}</span>
              </button>
            ))}
          </div>
          <label className="user-search">
            <Search aria-hidden="true" className="text-[#829087]" size={18} />
            <span className="sr-only">Search customers by number, name, address, or payment terms</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customers"
              type="search"
              value={query}
            />
          </label>
        </div>

        <div className="user-table-shell">
          <table className="user-table">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Address</th>
                <th scope="col">Payment terms</th>
                {(canEdit || canDelete) && <th scope="col"><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody>
              {visibleCustomers.map((customer) => (
                <tr key={customer.custno}>
                  <td>
                    <span className="block font-semibold text-[#172a24]">
                      {customer.custname || "Unnamed customer"}
                      {customer.is_deleted && (
                        <span className="ml-2 text-xs font-medium text-[#8c4b35]">Inactive</span>
                      )}
                    </span>
                    <span className="mt-1 block text-xs text-[#69766f]">{customer.custno}</span>
                  </td>
                  <td className="text-[#55657d]">{customer.address || "Not provided"}</td>
                  <td>
                    <span className="user-role">{customer.payterm || "Not set"}</span>
                  </td>
                  {(canEdit || canDelete) && (
                    <td className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {canEdit && !customer.is_deleted && (
                          <button
                            aria-label={`Edit ${customer.custname || customer.custno}`}
                            className="user-action-button"
                            onClick={() => openDialog(customer)}
                            type="button"
                          >
                            <Pencil aria-hidden="true" size={15} />
                            <span>Edit</span>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            aria-label={`${customer.is_deleted ? "Restore" : "Delete"} ${customer.custname || customer.custno}`}
                            className="user-action-button"
                            disabled={isPending}
                            onClick={() => changeCustomerStatus(customer, customer.is_deleted)}
                            type="button"
                          >
                            {customer.is_deleted ? (
                              <RotateCcw aria-hidden="true" size={15} />
                            ) : (
                              <Trash2 aria-hidden="true" size={15} />
                            )}
                            <span>{customer.is_deleted ? "Restore" : "Delete"}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {visibleCustomers.map((customer) => (
            <article className="user-mobile-card" key={`mobile-${customer.custno}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-[#172a24]">
                    {customer.custname || "Unnamed customer"}
                  </h2>
                  {customer.is_deleted && (
                    <span className="mt-1 block text-xs font-medium text-[#8c4b35]">Inactive</span>
                  )}
                  <p className="mt-1 text-xs text-[#69766f]">{customer.custno}</p>
                </div>
                <span className="user-role">{customer.payterm || "Not set"}</span>
              </div>
              <p className="mt-3 text-sm leading-5 text-[#55657d]">
                {customer.address || "Address not provided"}
              </p>
              {(canEdit || canDelete) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {canEdit && !customer.is_deleted && (
                    <button
                      aria-label={`Edit ${customer.custname || customer.custno}`}
                      className="user-action-button"
                      onClick={() => openDialog(customer)}
                      type="button"
                    >
                      <Pencil aria-hidden="true" size={15} />
                      <span>Edit</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      aria-label={`${customer.is_deleted ? "Restore" : "Delete"} ${customer.custname || customer.custno}`}
                      className="user-action-button"
                      disabled={isPending}
                      onClick={() => changeCustomerStatus(customer, customer.is_deleted)}
                      type="button"
                    >
                      {customer.is_deleted ? (
                        <RotateCcw aria-hidden="true" size={15} />
                      ) : (
                        <Trash2 aria-hidden="true" size={15} />
                      )}
                      <span>{customer.is_deleted ? "Restore" : "Delete"}</span>
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}

          {visibleCustomers.length === 0 && (
            <div className="user-empty-state">
              <Users aria-hidden="true" className="mx-auto text-[#8fa59a]" size={30} />
              <h2 className="mt-3 font-semibold text-[#172a24]">No customers found</h2>
              <p className="mt-1 text-sm text-[#69766f]">
                {normalizedQuery || paymentFilter !== "all"
                  ? "Try a different search or payment-term filter."
                  : "Customer records will appear here when available."}
              </p>
            </div>
          )}
        </div>
      </section>
      {dialog && (
        <dialog
          aria-labelledby="customer-dialog-title"
          className="user-dialog"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
          onClose={() => setDialog(null)}
          ref={dialogRef}
        >
          <div className="user-dialog-content">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-[Newsreader,Georgia,serif] text-3xl text-[#172a24]" id="customer-dialog-title">
                {isCreate ? "Add customer" : "Edit customer"}
              </h2>
              <button
                aria-label="Close dialog"
                className="user-icon-button"
                onClick={() => setDialog(null)}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <form className="mt-5 space-y-4" key={selectedCustomer?.custno ?? "create"} onSubmit={submitCustomer}>
              <label className="user-field">
                <span>Customer number</span>
                <input readOnly value={selectedCustomer?.custno ?? "Assigned automatically"} />
              </label>
              <label className="user-field">
                <span>Name</span>
                <input
                  autoFocus
                  defaultValue={selectedCustomer?.custname ?? ""}
                  maxLength={20}
                  name="custname"
                  required
                />
              </label>
              <label className="user-field">
                <span>Address</span>
                <input
                  defaultValue={selectedCustomer?.address ?? ""}
                  maxLength={50}
                  name="address"
                />
              </label>
              <label className="user-field">
                <span>Payment terms</span>
                <select defaultValue={selectedCustomer?.payterm ?? "30D"} name="payterm" required>
                  <option value="30D">30 days</option>
                  <option value="45D">45 days</option>
                  <option value="COD">Cash on delivery</option>
                </select>
              </label>
              {errorMessage && <p aria-live="polite" className="user-form-error">{errorMessage}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="user-secondary-button"
                  onClick={() => setDialog(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="user-primary-button" disabled={isPending} type="submit">
                  {isCreate ? <Plus aria-hidden="true" size={17} /> : <Check aria-hidden="true" size={17} />}
                  {isPending ? "Saving..." : isCreate ? "Add customer" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </section>
  );
}