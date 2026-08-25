"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-moss">Order placed</p>
      <h1 className="mt-3 font-display text-5xl tracking-tight">Thank you</h1>
      <p className="mt-4 text-ink-soft">
        Your delivery request was received
        {orderId ? (
          <>
            {" "}
            as order <span className="font-medium text-ink">#{orderId}</span>
          </>
        ) : null}
        . We’ll prepare it for shipping.
      </p>
      <Link
        href="/"
        className="mt-10 inline-block bg-ink px-6 py-3 text-sm uppercase tracking-[0.14em] text-paper transition hover:bg-moss"
      >
        Back to shop
      </Link>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm text-ink-soft">Loading…</p>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
