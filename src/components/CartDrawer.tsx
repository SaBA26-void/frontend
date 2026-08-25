"use client";

import Link from "next/link";
import { CartItemRow } from "@/components/CartItemRow";
import { selectCartItems, selectCartTotal } from "@/lib/features/cart/cartSlice";
import { useAppSelector } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/35 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl">Your cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-ink-soft">Your cart is empty.</p>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <CartItemRow
                  key={`${item.productId}-${item.variantId ?? "base"}`}
                  item={item}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="uppercase tracking-[0.12em] text-ink-soft">Total</span>
            <span className="font-display text-xl">{formatPrice(total)}</span>
          </div>
          {items.length === 0 ? (
            <button
              type="button"
              disabled
              className="w-full bg-ink px-4 py-3 text-sm uppercase tracking-[0.14em] text-paper opacity-40"
            >
              Checkout
            </button>
          ) : (
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-ink px-4 py-3 text-center text-sm uppercase tracking-[0.14em] text-paper transition hover:bg-moss"
            >
              Checkout
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
