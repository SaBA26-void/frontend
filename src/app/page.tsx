"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductTile } from "@/components/ProductTile";
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "@/lib/features/api/onlineShopApi";

export default function HomePage() {
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetCategoriesQuery();
  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
  } = useGetProductsQuery({ page: 1, pageSize: 8 });

  const featured = products?.items ?? [];
  const firstCategoryId = categories?.[0]?.id ?? 1;

  return (
    <main>
      <section className="relative min-h-[88vh] overflow-hidden">
        <Image
          src="https://picsum.photos/seed/atlas-hero/1800/1200"
          alt="Curated living space with modern products"
          fill
          priority
          sizes="100vw"
          className="animate-ken object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/45 to-ink/15" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
          <p className="animate-rise font-display text-6xl tracking-tight text-paper sm:text-7xl md:text-8xl">
            Atlas
          </p>
          <h1 className="animate-rise-delay mt-4 max-w-xl font-display text-3xl leading-tight text-paper sm:text-4xl">
            Everyday pieces, thoughtfully gathered.
          </h1>
          <p className="animate-rise-delay-2 mt-4 max-w-md text-base text-paper/80 sm:text-lg">
            Explore clothing, electronics, and home essentials in one calm storefront.
          </p>
          <div className="animate-rise-delay-2 mt-8">
            <Link
              href={`/category/${firstCategoryId}`}
              className="inline-block bg-paper px-6 py-3 text-sm uppercase tracking-[0.16em] text-ink transition hover:bg-mist"
            >
              Shop collections
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
            Main categories
          </h2>
          <p className="mt-3 text-ink-soft">
            Start with a department, then drill into the shelves that fit your day.
          </p>
        </div>

        {categoriesLoading && <p className="text-sm text-ink-soft">Loading categories…</p>}
        {categoriesError && (
          <p className="text-sm text-danger">
            Could not load categories. Confirm the API is running.
          </p>
        )}

        {categories && (
          <div className="grid gap-8 sm:grid-cols-3">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="animate-rise group block"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-mist-deep">
                  <Image
                    src={`https://picsum.photos/seed/cat-${category.id}/800/640`}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <h3 className="mt-4 font-display text-3xl tracking-tight transition group-hover:text-moss">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  {category.children.map((child) => child.name).join(" · ") ||
                    "Browse all"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-line/70 bg-paper/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
                Featured products
              </h2>
              <p className="mt-3 text-ink-soft">
                A rotating cut of what is ready to ship from the catalog.
              </p>
            </div>
          </div>

          {productsLoading && <p className="text-sm text-ink-soft">Loading products…</p>}
          {productsError && (
            <p className="text-sm text-danger">Could not load featured products.</p>
          )}

          {featured.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {featured.map((product, index) => (
                <ProductTile key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
