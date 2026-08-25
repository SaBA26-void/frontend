"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductTile } from "@/components/ProductTile";
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "@/lib/features/api/onlineShopApi";
import { findCategoryById } from "@/lib/utils";

function CategoryPageContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const categoryId = Number(params.id);
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const pageSize = 8;

  const { data: categories } = useGetCategoriesQuery();
  const {
    data: products,
    isLoading,
    isError,
    isFetching,
  } = useGetProductsQuery(
    { categoryId, page, pageSize },
    { skip: !Number.isFinite(categoryId) || categoryId < 1 },
  );

  const category =
    categories && Number.isFinite(categoryId)
      ? findCategoryById(categories, categoryId)
      : undefined;

  const totalPages = products
    ? Math.max(1, Math.ceil(products.totalCount / products.pageSize))
    : 1;

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
          <p className="mb-6 text-sm text-ink-soft">
            {products.totalCount} product{products.totalCount === 1 ? "" : "s"}
            {isFetching ? " · Updating…" : ""}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {products.items.map((product, index) => (
              <ProductTile key={product.id} product={product} index={index} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <Link
                href={`/category/${categoryId}?page=${Math.max(1, page - 1)}`}
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
                href={`/category/${categoryId}?page=${Math.min(totalPages, page + 1)}`}
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
