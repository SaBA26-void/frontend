"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductDto } from "@/types/api";
import { formatPrice } from "@/lib/utils";

interface ProductTileProps {
  product: ProductDto;
  index?: number;
}

export function ProductTile({ product, index = 0 }: ProductTileProps) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group animate-rise block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-moss"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-mist">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs uppercase tracking-[0.14em] text-ink-soft/70">
          {product.categoryName}
        </p>
        <h3 className="font-display text-xl leading-tight text-ink transition group-hover:text-moss">
          {product.name}
        </h3>
        <p className="text-sm text-ink-soft">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
