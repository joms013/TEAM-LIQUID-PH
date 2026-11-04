"use client";

import {
  ArrowLeft,
  Check,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  deleteProduct,
  restoreProduct,
  updateProduct,
  type ProductMutationResult,
} from "@/app/actions/products";

export type ProductRecord = {
  prodcode: string;
  description: string | null;
  unit: "pc" | "ea" | "mtr" | "pkg" | "ltr" | null;
  is_deleted: boolean;
};

type ProductStatusFilter = "active" | "inactive" | "all";

const unitLabels: Record<NonNullable<ProductRecord["unit"]>, string> = {
  pc: "Piece",
  ea: "Each",
  mtr: "Meter",
  pkg: "Package",
  ltr: "Litre",
};

export function ProductList({
  products,
  canAdd,
  canEdit,
  canDelete,
}: {
  products: ProductRecord[];
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("active");
  const [dialog, setDialog] = useState<"create" | ProductRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isCreate = dialog === "create";
  const selectedProduct = dialog !== null && dialog !== "create" ? dialog : null;

  useEffect(() => {
    if (dialog) dialogRef.current?.showModal();
  }, [dialog]);

  const normalizedQuery = query.trim().toLowerCase();
  const statusProducts = products.filter((product) => {
    if (!canDelete || statusFilter === "active") return !product.is_deleted;
    if (statusFilter === "inactive") return product.is_deleted;
    return true;
  });
  const visibleProducts = statusProducts.filter((product) => {
    const matchesQuery = `${product.prodcode} ${product.description ?? ""} ${product.unit ?? ""}`
      .toLowerCase()
      .includes(normalizedQuery);
    return matchesQuery && (unitFilter === "all" || product.unit === unitFilter);
  });

  function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dialog) return;

    const formData = new FormData(event.currentTarget);
    setErrorMessage("");
    startTransition(async () => {
      const result: ProductMutationResult =
        dialog === "create"
          ? await createProduct(formData)
          : await updateProduct(dialog.prodcode, formData);
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }
      setDialog(null);
      router.refresh();
    });
  }

  function openDialog(nextDialog: "create" | ProductRecord) {
    setErrorMessage("");
    setDialog(nextDialog);
  }

  function changeProductStatus(product: ProductRecord, restore: boolean) {
    if (
      !restore &&
      !window.confirm(`Move ${product.description || product.prodcode} to inactive products?`)
    ) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const result: ProductMutationResult = restore
        ? await restoreProduct(product.prodcode)
        : await deleteProduct(product.prodcode);
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
            Product management
          </p>
          <h1 className="font-[Newsreader,Georgia,serif] text-4xl leading-tight text-[#172a24]">
            Products
          </h1>
          <p className="mt-2 text-sm text-[#69766f]">
            Manage product codes, descriptions, and units.
          </p>
        </div>
        <p className="text-sm font-semibold text-[#55657d]">
          {visibleProducts.length} of {statusProducts.length} products
        </p>
        {canAdd && (
          <button className="user-primary-button" onClick={() => openDialog("create")} type="button">
            <Plus aria-hidden="true" size={17} />
            Add product
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
          aria-label="Filter products by status"
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
                {products.filter((product) =>
                  value === "all" ? true : product.is_deleted === (value === "inactive"),
                ).length}
              </span>
            </button>
          ))}
        </div>
      )}

      <section aria-label="Product list">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div aria-label="Filter products by unit" className="user-filter-group" role="group">
            {[
              ["all", "All units"],
              ...Object.entries(unitLabels).map(([value, label]) => [value, label] as const),
            ].map(([value, label]) => (
              <button
                aria-pressed={unitFilter === value}
                className={`user-filter ${unitFilter === value ? "user-filter-selected" : ""}`}
                key={value}
                onClick={() => setUnitFilter(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <label className="user-search">
            <Search aria-hidden="true" className="text-[#829087]" size={18} />
            <span className="sr-only">Search products by code, description, or unit</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              type="search"
              value={query}
            />
          </label>
        </div>

        <div className="user-table-shell">
          <table className="user-table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Unit</th>
                {(canEdit || canDelete) && <th scope="col"><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product.prodcode}>
                  <td>
                    <span className="block font-semibold text-[#172a24]">
                      {product.description || "Unnamed product"}
                      {product.is_deleted && (
                        <span className="ml-2 text-xs font-medium text-[#8c4b35]">Inactive</span>
                      )}
                    </span>
                    <span className="mt-1 block text-xs text-[#69766f]">{product.prodcode}</span>
                  </td>
                  <td>
                    <span className="user-role">
                      {product.unit ? `${product.unit} · ${unitLabels[product.unit]}` : "Not set"}
                    </span>
                  </td>
                  {(canEdit || canDelete) && (
                    <td className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {canEdit && !product.is_deleted && (
                          <button
                            aria-label={`Edit ${product.description || product.prodcode}`}
                            className="user-action-button"
                            onClick={() => openDialog(product)}
                            type="button"
                          >
                            <Pencil aria-hidden="true" size={15} />
                            <span>Edit</span>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            aria-label={`${product.is_deleted ? "Restore" : "Delete"} ${product.description || product.prodcode}`}
                            className="user-action-button"
                            disabled={isPending}
                            onClick={() => changeProductStatus(product, product.is_deleted)}
                            type="button"
                          >
                            {product.is_deleted ? (
                              <RotateCcw aria-hidden="true" size={15} />
                            ) : (
                              <Trash2 aria-hidden="true" size={15} />
                            )}
                            <span>{product.is_deleted ? "Restore" : "Delete"}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {visibleProducts.length === 0 && (
            <div className="user-empty-state">
              <ShoppingBag aria-hidden="true" className="mx-auto text-[#8fa59a]" size={30} />
              <h2 className="mt-3 font-semibold text-[#172a24]">No products found</h2>
              <p className="mt-1 text-sm text-[#69766f]">
                {normalizedQuery || unitFilter !== "all"
                  || statusFilter !== "active"
                  ? "Try a different search, unit, or status filter."
                  : "Product records will appear here when available."}
              </p>
            </div>
          )}
        </div>
      </section>

      {dialog && (
        <dialog
          aria-labelledby="product-dialog-title"
          className="user-dialog"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
          onClose={() => setDialog(null)}
          ref={dialogRef}
        >
          <div className="user-dialog-content">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-[Newsreader,Georgia,serif] text-3xl text-[#172a24]" id="product-dialog-title">
                {isCreate ? "Add product" : "Edit product"}
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
            <form
              className="mt-5 space-y-4"
              key={selectedProduct?.prodcode ?? "create"}
              onSubmit={submitProduct}
            >
              <label className="user-field">
                <span>Product code</span>
                <input
                  autoCapitalize="characters"
                  defaultValue={selectedProduct?.prodcode ?? ""}
                  maxLength={6}
                  name="prodcode"
                  pattern="[A-Za-z]{2}[0-9]{4}"
                  placeholder="e.g. AK0001"
                  readOnly={!isCreate}
                  required
                />
              </label>
              <label className="user-field">
                <span>Description</span>
                <input
                  autoFocus
                  defaultValue={selectedProduct?.description ?? ""}
                  maxLength={30}
                  name="description"
                  required
                />
              </label>
              <label className="user-field">
                <span>Unit</span>
                <select defaultValue={selectedProduct?.unit ?? "pc"} name="unit" required>
                  {Object.entries(unitLabels).map(([value, label]) => (
                    <option key={value} value={value}>{value} · {label}</option>
                  ))}
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
                  {isPending ? "Saving..." : isCreate ? "Add product" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </section>
  );
}
