"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductTile } from "@/components/ProductTile";
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "@/lib/features/api/onlineShopApi";
import { findCategoryById } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

function CategoryPageContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = Number(params.id);
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const sort = searchParams.get("sort") ?? "name_asc";
  const pageSize = 8;

  const { data: categories } = useGetCategoriesQuery();
  const {
    data: products,
    isLoading,
    isError,
    isFetching,
  } = useGetProductsQuery(
    { categoryId, page, pageSize, sort },
    { skip: !Number.isFinite(categoryId) || categoryId < 1 },
  );

  const category =
    categories && Number.isFinite(categoryId)
      ? findCategoryById(categories, categoryId)
      : undefined;

  const totalPages = products
    ? Math.max(1, Math.ceil(products.totalCount / products.pageSize))
    : 1;

  const buildCategoryHref = (nextPage: number, nextSort = sort) => {
    const query = new URLSearchParams();
    query.set("page", String(nextPage));
    query.set("sort", nextSort);
    return `/category/${categoryId}?${query.toString()}`;
  };

  const onSortChange = (nextSort: string) => {
    router.push(buildCategoryHref(1, nextSort));
  };

  if (!Number.isFinite(categoryId) || categoryId < 1) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-danger">Invalid category.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 max-w-2xl animate-rise">
        <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">Category</p>
        <h1 className="mt-2 font-display text-5xl tracking-tight sm:text-6xl">
          {category?.name ?? `Category ${categoryId}`}
        </h1>
        <p className="mt-3 text-ink-soft">
          Products in this category and its subcategories.
        </p>

        {category && category.children.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.id}`}
                className="border border-line px-3 py-1.5 text-sm text-ink-soft transition hover:border-ink hover:text-ink"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {isLoading && <p className="text-sm text-ink-soft">Loading products…</p>}
      {isError && (
        <p className="text-sm text-danger">Could not load products for this category.</p>
      )}

      {!isLoading && products && products.items.length === 0 && (
        <p className="text-sm text-ink-soft">No products found in this category.</p>
      )}

      {products && products.items.length > 0 && (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ink-soft">
              {products.totalCount} product{products.totalCount === 1 ? "" : "s"}
              {isFetching ? " · Updating…" : ""}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-xs uppercase tracking-[0.12em] text-ink-soft">
                Sort
              </span>
              <select
                value={sort}
                onChange={(event) => onSortChange(event.target.value)}
                className="border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {products.items.map((product, index) => (
              <ProductTile key={product.id} product={product} index={index} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <Link
                href={buildCategoryHref(Math.max(1, page - 1))}
                aria-disabled={page <= 1}
                className={`border border-line px-4 py-2 text-sm uppercase tracking-[0.12em] ${
                  page <= 1 ? "pointer-events-none opacity-40" : "hover:border-ink"
                }`}
              >
                Previous
              </Link>
              <span className="text-sm text-ink-soft">
                Page {page} of {totalPages}
              </span>
              <Link
                href={buildCategoryHref(Math.min(totalPages, page + 1))}
                aria-disabled={page >= totalPages}
                className={`border border-line px-4 py-2 text-sm uppercase tracking-[0.12em] ${
                  page >= totalPages
                    ? "pointer-events-none opacity-40"
                    : "hover:border-ink"
                }`}
              >
                Next
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-sm text-ink-soft">Loading category…</p>
        </main>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}
