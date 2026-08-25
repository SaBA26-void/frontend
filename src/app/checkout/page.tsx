"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearCart,
  selectCartItems,
  selectCartTotal,
} from "@/lib/features/cart/cartSlice";
import { useCreateOrderMutation } from "@/lib/features/api/onlineShopApi";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";

const emptyForm = {
  firstName: "",
  lastName: "",
  personalNumber: "",
  address: "",
  city: "",
  comment: "",
};

/** Letters, spaces, hyphens, apostrophes — no digits. */
const NAME_PATTERN = /^[\p{L}][\p{L}\s\-']*$/u;

function sanitizeNameInput(value: string) {
  return value.replace(/[0-9]/g, "");
}

function isValidPersonName(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 && NAME_PATTERN.test(trimmed);
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const personalNumberValid = useMemo(
    () => /^\d{11}$/.test(form.personalNumber.trim()),
    [form.personalNumber],
  );

  const namesValid = useMemo(
    () => isValidPersonName(form.firstName) && isValidPersonName(form.lastName),
    [form.firstName, form.lastName],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!isValidPersonName(form.firstName) || !isValidPersonName(form.lastName)) {
      setError("First and last name must use letters only (no numbers).");
      return;
    }

    if (!personalNumberValid) {
      setError("Personal number must be exactly 11 digits.");
      return;
    }

    try {
      const order = await createOrder({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        personalNumber: form.personalNumber.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        comment: form.comment.trim() || null,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName || item.name,
          size: item.size,
          color: item.color,
          unitPrice: item.price,
          quantity: item.quantity,
        })),
      }).unwrap();

      dispatch(clearCart());
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch {
      setError("Could not place the order. Please check the form and try again.");
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl tracking-tight">Checkout</h1>
        <p className="mt-3 text-ink-soft">Your cart is empty.</p>
        <Link href="/" className="mt-6 inline-block text-sm text-moss underline">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.2fr_0.8fr]">
      <section>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Checkout</h1>
        <p className="mt-3 text-ink-soft">
          Fill in your delivery details to place the order.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-ink-soft">First name</span>
              <input
                required
                autoComplete="given-name"
                value={form.firstName}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    firstName: sanitizeNameInput(event.target.value),
                  }))
                }
                className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                placeholder="Letters only"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-ink-soft">Last name</span>
              <input
                required
                autoComplete="family-name"
                value={form.lastName}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    lastName: sanitizeNameInput(event.target.value),
                  }))
                }
                className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
                placeholder="Letters only"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-soft">Personal number (11 digits)</span>
            <input
              required
              inputMode="numeric"
              pattern="\d{11}"
              maxLength={11}
              value={form.personalNumber}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  personalNumber: event.target.value.replace(/\D/g, "").slice(0, 11),
                }))
              }
              className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
              placeholder="12345678901"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-soft">Address</span>
            <input
              required
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, address: event.target.value }))
              }
              className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-soft">City</span>
            <input
              required
              value={form.city}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, city: event.target.value }))
              }
              className="w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-ink-soft">Delivery comment (optional)</span>
            <textarea
              value={form.comment}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, comment: event.target.value }))
              }
              className="min-h-28 w-full border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
              placeholder="Gate code, leave at door, call on arrival…"
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !personalNumberValid || !namesValid}
            className="bg-ink px-6 py-3 text-sm uppercase tracking-[0.14em] text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? "Placing order…" : "Place order"}
          </button>
        </form>
      </section>

      <aside className="h-fit border border-line bg-paper/70 p-5">
        <h2 className="font-display text-2xl">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.variantId ?? "base"}`}
              className="flex justify-between gap-3 border-b border-line/70 pb-3 text-sm"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-ink-soft">Qty {item.quantity}</p>
              </div>
              <p>{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.12em] text-ink-soft">Total</span>
          <span className="font-display text-2xl">{formatPrice(total)}</span>
        </div>
      </aside>
    </main>
  );
}
