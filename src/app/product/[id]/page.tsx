"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { useGetProductByIdQuery } from "@/lib/features/api/onlineShopApi";
import { useAppDispatch } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);

  const { data: product, isLoading, isError } = useGetProductByIdQuery(productId, {
    skip: !Number.isFinite(productId) || productId < 1,
  });

  if (!Number.isFinite(productId) || productId < 1) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-danger">Invalid product.</p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm text-ink-soft">Loading product…</p>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-danger">Product not found.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-moss underline">
          Back home
        </Link>
      </main>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-14">
      <div className="relative aspect-[4/5] animate-fade overflow-hidden bg-mist">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col justify-center animate-rise">
        <Link
          href={`/category/${product.categoryId}`}
          className="text-xs uppercase tracking-[0.16em] text-ink-soft transition hover:text-moss"
        >
          {product.categoryName}
        </Link>
        <h1 className="mt-3 font-display text-5xl leading-tight tracking-tight sm:text-6xl">
          {product.name}
        </h1>
        <p className="mt-4 font-display text-3xl text-moss">
          {formatPrice(product.price)}
        </p>
        <p className="mt-6 max-w-prose text-base leading-relaxed text-ink-soft">
          {product.description}
        </p>
        <p className="mt-4 text-sm text-ink-soft">
          {product.stockQuantity > 0
            ? `${product.stockQuantity} in stock`
            : "Currently out of stock"}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0}
            className="bg-ink px-7 py-3 text-sm uppercase tracking-[0.16em] text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add to cart
          </button>
          {added && (
            <span className="animate-fade text-sm text-moss">Added to cart</span>
          )}
        </div>
      </div>
    </main>
  );
}
