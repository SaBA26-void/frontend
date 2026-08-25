"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { useGetProductByIdQuery } from "@/lib/features/api/onlineShopApi";
import { useAppDispatch } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const { data: product, isLoading, isError } = useGetProductByIdQuery(productId, {
    skip: !Number.isFinite(productId) || productId < 1,
  });

  const sizes = useMemo(() => {
    if (!product?.variants.length) return [] as string[];
    return [
      ...new Set(
        product.variants
          .map((variant) => variant.size)
          .filter((size): size is string => Boolean(size)),
      ),
    ];
  }, [product]);

  const colors = useMemo(() => {
    if (!product?.variants.length) return [] as string[];
    return [
      ...new Set(
        product.variants
          .map((variant) => variant.color)
          .filter((color): color is string => Boolean(color)),
      ),
    ];
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants.length) return null;

    return (
      product.variants.find((variant) => {
        const sizeOk = !sizes.length || variant.size === selectedSize;
        const colorOk = !colors.length || variant.color === selectedColor;
        return sizeOk && colorOk;
      }) ?? null
    );
  }, [product, sizes, colors, selectedSize, selectedColor]);

  const availableStock = selectedVariant
    ? selectedVariant.stockQuantity
    : (product?.stockQuantity ?? 0);

  const optionsReady =
    !product?.variants.length ||
    ((!sizes.length || selectedSize) && (!colors.length || selectedColor) && selectedVariant);

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
    if (!optionsReady || availableStock <= 0) return;

    dispatch(addToCart({ product, variant: selectedVariant }));
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

        {sizes.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-ink-soft">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-12 border px-3 py-2 text-sm transition ${
                    selectedSize === size
                      ? "border-ink bg-ink text-paper"
                      : "border-line hover:border-ink"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-ink-soft">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`border px-3 py-2 text-sm transition ${
                    selectedColor === color
                      ? "border-ink bg-ink text-paper"
                      : "border-line hover:border-ink"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-ink-soft">
          {product.variants.length > 0 && !optionsReady
            ? "Select options to see stock."
            : availableStock > 0
              ? `${availableStock} in stock`
              : "Currently out of stock"}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!optionsReady || availableStock <= 0}
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
