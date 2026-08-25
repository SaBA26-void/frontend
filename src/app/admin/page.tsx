"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  clearAdminPassword,
  isAdminAuthenticated,
  setAdminPassword,
} from "@/lib/adminAuth";
import {
  useCreateCategoryMutation,
  useCreateProductMutation,
  useDeleteCategoryMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetOrdersQuery,
  useGetProductsQuery,
  useLoginAdminMutation,
  useUpdateProductMutation,
} from "@/lib/features/api/onlineShopApi";
import { flattenCategoryOptions, formatPrice } from "@/lib/utils";
import type { ProductDto, ProductVariantInputDto } from "@/types/api";

type Tab = "orders" | "categories" | "products";

interface VariantFormRow {
  size: string;
  color: string;
  stockQuantity: number;
}

const emptyProductForm = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "0",
  categoryId: "",
  imageUrl: "https://picsum.photos/seed/new-product/600/600",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("orders");
  const [message, setMessage] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [variants, setVariants] = useState<VariantFormRow[]>([]);

  const [loginAdmin, { isLoading: loggingIn }] = useLoginAdminMutation();
  const { data: categories } = useGetCategoriesQuery(undefined, { skip: !authed });
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery(
    { page: 1, pageSize: 100 },
    { skip: !authed },
  );
  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = useGetOrdersQuery(undefined, { skip: !authed });

  const [createCategory, { isLoading: creatingCategory }] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [createProduct, { isLoading: creatingProduct }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updatingProduct }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  useEffect(() => {
    setAuthed(isAdminAuthenticated());
  }, []);

  const categoryOptions = useMemo(
    () => (categories ? flattenCategoryOptions(categories) : []),
    [categories],
  );

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError(null);

    try {
      await loginAdmin({ password }).unwrap();
      setAdminPassword(password);
      setAuthed(true);
      setPassword("");
    } catch {
      setLoginError("Invalid password.");
    }
  };

  const handleLogout = () => {
    clearAdminPassword();
    setAuthed(false);
    setMessage(null);
  };

  const handleCreateCategory = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    try {
      await createCategory({
        name: categoryName.trim(),
        parentCategoryId: parentCategoryId ? Number(parentCategoryId) : null,
      }).unwrap();
      setCategoryName("");
      setParentCategoryId("");
      setMessage("Category saved.");
    } catch {
      setMessage("Could not save category.");
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!window.confirm(`Delete category “${name}”?`)) return;
    setMessage(null);

    try {
      await deleteCategory(id).unwrap();
      setMessage("Category deleted.");
    } catch {
      setMessage("Could not delete category. Remove children/products first.");
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
    setVariants([]);
  };

  const startEditProduct = (product: ProductDto) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stockQuantity: String(product.stockQuantity),
      categoryId: String(product.categoryId),
      imageUrl: product.imageUrl,
    });
    setVariants(
      product.variants.map((variant) => ({
        size: variant.size ?? "",
        color: variant.color ?? "",
        stockQuantity: variant.stockQuantity,
      })),
    );
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveProduct = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const payloadVariants: ProductVariantInputDto[] = variants
      .filter((row) => row.size.trim() || row.color.trim() || row.stockQuantity > 0)
      .map((row) => ({
        size: row.size.trim() || null,
        color: row.color.trim() || null,
        stockQuantity: Number(row.stockQuantity) || 0,
      }));

    const body = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      stockQuantity: Number(productForm.stockQuantity) || 0,
      categoryId: Number(productForm.categoryId),
      imageUrl: productForm.imageUrl.trim(),
      variants: payloadVariants,
    };

    try {
      if (editingProductId) {
        await updateProduct({ id: editingProductId, body }).unwrap();
        setMessage("Product updated.");
      } else {
        await createProduct(body).unwrap();
        setMessage("Product created.");
      }
      resetProductForm();
    } catch {
      setMessage("Could not save product. Check fields and admin session.");
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`Delete product “${name}”?`)) return;
    setMessage(null);

    try {
      await deleteProduct(id).unwrap();
      if (editingProductId === id) resetProductForm();
      setMessage("Product deleted.");
    } catch {
      setMessage("Could not delete product.");
    }
  };

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <h1 className="font-display text-4xl tracking-tight">Admin</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Enter the admin password to manage catalog data.
        </p>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block uppercase tracking-[0.12em] text-ink-soft">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
              required
              autoComplete="current-password"
            />
          </label>
          {loginError && <p className="text-sm text-danger">{loginError}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-ink px-4 py-3 text-sm uppercase tracking-[0.14em] text-paper hover:bg-moss disabled:opacity-50"
          >
            {loggingIn ? "Checking…" : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Admin panel</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Manage orders, categories, products, and size/color options.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="border border-line px-4 py-2 text-sm uppercase tracking-[0.12em] hover:border-ink"
        >
          Sign out
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["orders", "products", "categories"] as Tab[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`px-4 py-2 text-sm uppercase tracking-[0.12em] ${
              tab === item ? "bg-ink text-paper" : "border border-line hover:border-ink"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {message && <p className="mb-6 text-sm text-moss">{message}</p>}

      {tab === "orders" && (
        <section className="border border-line p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl">Delivery orders</h2>
              <p className="text-sm text-ink-soft">
                Customer checkout submissions with delivery details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetchOrders()}
              className="border border-line px-3 py-1.5 text-xs uppercase tracking-[0.12em] hover:border-ink"
            >
              Refresh
            </button>
          </div>

          {ordersLoading && <p className="text-sm text-ink-soft">Loading orders…</p>}
          {ordersError && (
            <p className="text-sm text-danger">
              Could not load orders. Sign in again if your session expired.
            </p>
          )}
          {!ordersLoading && orders && orders.length === 0 && (
            <p className="text-sm text-ink-soft">No orders yet.</p>
          )}

          <ul className="space-y-4">
            {orders?.map((order) => {
              const expanded = expandedOrderId === order.id;
              return (
                <li key={order.id} className="border-b border-line/70 pb-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedOrderId(expanded ? null : order.id)
                    }
                    className="flex w-full flex-wrap items-start justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="font-medium">
                        #{order.id} · {order.firstName} {order.lastName}
                      </p>
                      <p className="text-sm text-ink-soft">
                        {order.city} · {order.address}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {new Date(order.createdAtUtc).toLocaleString()}
                      </p>
                    </div>
                    <p className="font-display text-xl">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </button>

                  {expanded && (
                    <div className="mt-3 space-y-2 bg-mist/40 p-3 text-sm">
                      <p>
                        <span className="text-ink-soft">Personal number:</span>{" "}
                        {order.personalNumber}
                      </p>
                      <p>
                        <span className="text-ink-soft">Address:</span>{" "}
                        {order.address}, {order.city}
                      </p>
                      {order.comment && (
                        <p>
                          <span className="text-ink-soft">Comment:</span>{" "}
                          {order.comment}
                        </p>
                      )}
                      <ul className="mt-2 space-y-1 border-t border-line/60 pt-2">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between gap-3">
                            <span>
                              {item.productName}
                              {[item.size, item.color].filter(Boolean).length > 0
                                ? ` (${[item.size, item.color].filter(Boolean).join(" / ")})`
                                : ""}{" "}
                              × {item.quantity}
                            </span>
                            <span>
                              {formatPrice(item.unitPrice * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {tab === "categories" && (
        <section className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <form onSubmit={handleCreateCategory} className="space-y-4 border border-line p-5">
            <h2 className="font-display text-2xl">Add category</h2>
            <p className="text-sm text-ink-soft">
              Leave parent empty for a top-level category, or pick a parent for a subcategory.
            </p>
            <label className="block text-sm">
              <span className="mb-1 block text-ink-soft">Name</span>
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-ink-soft">Parent category</span>
              <select
                value={parentCategoryId}
                onChange={(event) => setParentCategoryId(event.target.value)}
                className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
              >
                <option value="">None (top-level)</option>
                {categoryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={creatingCategory}
              className="bg-ink px-4 py-2 text-sm uppercase tracking-[0.12em] text-paper hover:bg-moss disabled:opacity-50"
            >
              {creatingCategory ? "Saving…" : "Add category"}
            </button>
          </form>

          <div className="border border-line p-5">
            <h2 className="mb-4 font-display text-2xl">Existing categories</h2>
            <ul className="space-y-3">
              {categoryOptions.map((option) => (
                <li
                  key={option.id}
                  className="flex items-center justify-between gap-3 border-b border-line/70 pb-3"
                >
                  <span className="text-sm">{option.label}</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteCategory(option.id, option.label.replace(/^—\s+/g, ""))
                    }
                    className="text-xs uppercase tracking-[0.12em] text-ink-soft hover:text-danger"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {tab === "products" && (
        <section className="space-y-10">
          <form onSubmit={handleSaveProduct} className="space-y-4 border border-line p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl">
                {editingProductId ? `Edit product #${editingProductId}` : "Add product"}
              </h2>
              {editingProductId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="text-sm uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm md:col-span-2">
                <span className="mb-1 block text-ink-soft">Name</span>
                <input
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                  required
                />
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="mb-1 block text-ink-soft">Description</span>
                <textarea
                  value={productForm.description}
                  onChange={(event) =>
                    setProductForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-24 w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-ink-soft">Price</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, price: event.target.value }))
                  }
                  className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-ink-soft">
                  Base stock (used when no variants)
                </span>
                <input
                  type="number"
                  min="0"
                  value={productForm.stockQuantity}
                  onChange={(event) =>
                    setProductForm((prev) => ({
                      ...prev,
                      stockQuantity: event.target.value,
                    }))
                  }
                  className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-ink-soft">Category</span>
                <select
                  value={productForm.categoryId}
                  onChange={(event) =>
                    setProductForm((prev) => ({
                      ...prev,
                      categoryId: event.target.value,
                    }))
                  }
                  className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-ink-soft">Image URL</span>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(event) =>
                    setProductForm((prev) => ({
                      ...prev,
                      imageUrl: event.target.value,
                    }))
                  }
                  className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                  required
                />
              </label>
            </div>

            <div className="border-t border-line pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">Options (size / color)</h3>
                  <p className="text-sm text-ink-soft">
                    Example: XL + Black, M + Navy. Leave empty for products without options.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setVariants((prev) => [
                      ...prev,
                      { size: "", color: "", stockQuantity: 0 },
                    ])
                  }
                  className="border border-line px-3 py-1.5 text-xs uppercase tracking-[0.12em] hover:border-ink"
                >
                  Add option
                </button>
              </div>

              {variants.length === 0 ? (
                <p className="text-sm text-ink-soft">No options yet.</p>
              ) : (
                <div className="space-y-3">
                  {variants.map((row, index) => (
                    <div
                      key={index}
                      className="grid gap-2 md:grid-cols-[1fr_1fr_120px_auto]"
                    >
                      <input
                        placeholder="Size (S, M, L, XL…)"
                        value={row.size}
                        onChange={(event) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, size: event.target.value } : item,
                            ),
                          )
                        }
                        className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
                      />
                      <input
                        placeholder="Color"
                        value={row.color}
                        onChange={(event) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, color: event.target.value } : item,
                            ),
                          )
                        }
                        className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Stock"
                        value={row.stockQuantity}
                        onChange={(event) =>
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    stockQuantity: Number(event.target.value) || 0,
                                  }
                                : item,
                            ),
                          )
                        }
                        className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setVariants((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="text-xs uppercase tracking-[0.12em] text-ink-soft hover:text-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={creatingProduct || updatingProduct}
              className="bg-ink px-5 py-3 text-sm uppercase tracking-[0.14em] text-paper hover:bg-moss disabled:opacity-50"
            >
              {creatingProduct || updatingProduct
                ? "Saving…"
                : editingProductId
                  ? "Update product"
                  : "Create product"}
            </button>
          </form>

          <div className="border border-line p-5">
            <h2 className="mb-4 font-display text-2xl">Catalog</h2>
            {productsLoading && <p className="text-sm text-ink-soft">Loading products…</p>}
            <ul className="space-y-4">
              {productsData?.items.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-wrap items-start justify-between gap-3 border-b border-line/70 pb-4"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-ink-soft">
                      {product.categoryName} · {formatPrice(product.price)} · stock{" "}
                      {product.stockQuantity}
                    </p>
                    {product.variants.length > 0 && (
                      <p className="mt-1 text-xs text-ink-soft">
                        Options:{" "}
                        {product.variants
                          .map(
                            (variant) =>
                              `${[variant.size, variant.color].filter(Boolean).join("/") || "—"} (${variant.stockQuantity})`,
                          )
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEditProduct(product)}
                      className="text-xs uppercase tracking-[0.12em] hover:text-moss"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="text-xs uppercase tracking-[0.12em] text-ink-soft hover:text-danger"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
