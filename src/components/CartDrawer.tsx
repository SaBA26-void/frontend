"use client";

import Image from "next/image";
import {
  removeFromCart,
  selectCartItems,
  selectCartTotal,
  updateQuantity,
} from "@/lib/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const dispatch = useAppDispatch();
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
                <li key={item.productId} className="flex gap-3">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-mist">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-sm text-ink-soft">{formatPrice(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="h-7 w-7 border border-line text-sm hover:border-ink"
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: item.productId,
                              quantity: item.quantity - 1,
                            }),
                          )
                        }
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        className="h-7 w-7 border border-line text-sm hover:border-ink"
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: item.productId,
                              quantity: item.quantity + 1,
                            }),
                          )
                        }
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ml-auto text-xs uppercase tracking-[0.12em] text-ink-soft hover:text-danger"
                        onClick={() => dispatch(removeFromCart(item.productId))}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="uppercase tracking-[0.12em] text-ink-soft">Total</span>
            <span className="font-display text-xl">{formatPrice(total)}</span>
          </div>
          <button
            type="button"
            disabled={items.length === 0}
            className="w-full bg-ink px-4 py-3 text-sm uppercase tracking-[0.14em] text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-40"
          >
            Checkout soon
          </button>
        </div>
      </aside>
    </>
  );
}
