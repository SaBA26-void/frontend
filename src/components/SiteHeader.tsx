"use client";

import Link from "next/link";
import { useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { selectCartItemCount } from "@/lib/features/cart/cartSlice";
import { useGetCategoriesQuery } from "@/lib/features/api/onlineShopApi";
import { useAppSelector } from "@/lib/hooks";

export function SiteHeader() {
  const { data: categories, isLoading, isError } = useGetCategoriesQuery();
  const cartCount = useAppSelector(selectCartItemCount);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="font-display text-3xl tracking-tight text-ink transition hover:text-moss"
          >
            Atlas
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Categories">
            {isLoading && (
              <span className="px-3 text-sm text-ink-soft">Loading…</span>
            )}
            {isError && (
              <span className="px-3 text-sm text-danger">Categories unavailable</span>
            )}
            {categories?.map((category) => (
              <div key={category.id} className="group relative">
                <Link
                  href={`/category/${category.id}`}
                  className="inline-block px-3 py-2 text-sm uppercase tracking-[0.12em] text-ink-soft transition hover:text-ink"
                >
                  {category.name}
                </Link>
                {category.children.length > 0 && (
                  <div className="invisible absolute left-0 top-full z-20 min-w-44 translate-y-1 bg-paper py-2 opacity-0 shadow-lg ring-1 ring-line transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/category/${child.id}`}
                        className="block px-4 py-2 text-sm text-ink-soft hover:bg-mist hover:text-ink"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="px-3 py-2 text-sm uppercase tracking-[0.12em] text-ink-soft transition hover:text-ink"
            >
              Admin
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative px-3 py-2 text-sm uppercase tracking-[0.12em] text-ink transition hover:text-moss"
              aria-label={`Open cart, ${cartCount} items`}
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center bg-moss px-1 text-[11px] font-medium text-paper">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="px-3 py-2 text-sm uppercase tracking-[0.12em] text-ink lg:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              Menu
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            id="mobile-nav"
            className="animate-fade border-t border-line bg-paper px-4 py-4 lg:hidden"
            aria-label="Mobile categories"
          >
            {categories?.map((category) => (
              <div key={category.id} className="mb-3">
                <Link
                  href={`/category/${category.id}`}
                  className="block py-1 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {category.name}
                </Link>
                <div className="ml-3 space-y-1">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/category/${child.id}`}
                      className="block py-1 text-sm text-ink-soft"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
