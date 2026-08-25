"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  changeCartItemVariant,
  removeFromCart,
  updateQuantity,
  type CartItem,
} from "@/lib/features/cart/cartSlice";
import { useGetProductByIdQuery } from "@/lib/features/api/onlineShopApi";
import { useAppDispatch } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";
import type { ProductVariantDto } from "@/types/api";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const dispatch = useAppDispatch();
  const { data: product } = useGetProductByIdQuery(item.productId);

  const variants = product?.variants ?? [];

  const sizes = useMemo(() => {
    return [
      ...new Set(
        variants
          .map((variant) => variant.size)
          .filter((size): size is string => Boolean(size)),
      ),
    ];
  }, [variants]);

  const colorsForSelectedSize = useMemo(() => {
    const relevant = item.size
      ? variants.filter((variant) => variant.size === item.size)
      : variants;

    return [
      ...new Set(
        relevant
          .map((variant) => variant.color)
          .filter((color): color is string => Boolean(color)),
      ),
    ];
  }, [variants, item.size]);

  const hasOptions = sizes.length > 0 || colorsForSelectedSize.length > 0;

  const switchToVariant = (toVariant: ProductVariantDto) => {
    if (toVariant.id === item.variantId) return;

    dispatch(
      changeCartItemVariant({
        productId: item.productId,
        fromVariantId: item.variantId,
        toVariant,
      }),
    );
  };

  const onSizeChange = (nextSize: string) => {
    const preferred =
      variants.find(
        (variant) => variant.size === nextSize && variant.color === item.color,
      ) ?? variants.find((variant) => variant.size === nextSize);

    if (preferred) {
      switchToVariant(preferred);
    }
  };

  const onColorChange = (nextColor: string) => {
    const preferred =
      variants.find(
        (variant) => variant.color === nextColor && variant.size === item.size,
      ) ?? variants.find((variant) => variant.color === nextColor);

    if (preferred) {
      switchToVariant(preferred);
    }
  };

  return (
    <li className="flex gap-3">
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
        <p className="truncate font-medium">{item.productName || item.name}</p>
        <p className="text-sm text-ink-soft">{formatPrice(item.price)}</p>

        {hasOptions && (
          <div className="mt-2 space-y-2">
            {sizes.length > 0 && (
              <label className="block text-xs text-ink-soft">
                Size
                <select
                  value={item.size ?? ""}
                  onChange={(event) => onSizeChange(event.target.value)}
                  className="mt-1 w-full border border-line bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-ink"
                >
                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {colorsForSelectedSize.length > 0 && (
              <label className="block text-xs text-ink-soft">
                Color
                <select
                  value={item.color ?? ""}
                  onChange={(event) => onColorChange(event.target.value)}
                  className="mt-1 w-full border border-line bg-paper px-2 py-1.5 text-sm text-ink outline-none focus:border-ink"
                >
                  {colorsForSelectedSize.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="h-7 w-7 border border-line text-sm hover:border-ink"
            onClick={() =>
              dispatch(
                updateQuantity({
                  productId: item.productId,
                  variantId: item.variantId,
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
                  variantId: item.variantId,
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
            onClick={() =>
              dispatch(
                removeFromCart({
                  productId: item.productId,
                  variantId: item.variantId,
                }),
              )
            }
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
