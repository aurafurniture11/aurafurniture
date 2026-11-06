"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import type { AuraProduct } from "@/lib/vondera";
import { getProductImageUrl } from "@/lib/catalog-utils";

export function ProductCard({ product }: { product: AuraProduct }) {
  const { locale, addToCart, toggleWishlist, isWished } = useStore();
  const isAr = locale === "ar";

  const imageUrl = getProductImageUrl(product);
  const price = Number(product.price ?? 0);
  const crossedPrice = Number(product.crossedPrice ?? 0);
  const hasDiscount = crossedPrice > price && price > 0;
  const discountPct = hasDiscount
    ? Math.round(((crossedPrice - price) / crossedPrice) * 100)
    : 0;
  const wished = isWished(product.id);
  const inStock = product.isAvailable !== false;

  const displayName =
    isAr && product.nameAr ? product.nameAr : product.name;

  const rawRating =
    typeof product.rating === "object" && product.rating !== null
      ? product.rating.average
      : product.rating;
  const rating = Number(rawRating || 4.6);

  return (
    <article className="mp-card group">
      <div className="mp-card-media">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayName || "Aura Furniture"}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs uppercase tracking-widest opacity-40">
              Aura Furniture
            </div>
          )}
        </Link>

        {hasDiscount ? (
          <span className="mp-promo-tag is-drop">Price Drop</span>
        ) : (
          <span className="mp-promo-tag is-code">Code: Save5</span>
        )}

        {!inStock && (
          <span className="mp-stock-tag is-out">Out of stock</span>
        )}

        <button
          className="mp-save-btn"
          type="button"
          aria-pressed={wished ? "true" : "false"}
          aria-label={`Save ${displayName}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={wished ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      <div className="mp-card-body">
        <Link href={`/product/${product.id}`} dir="auto">
          <h3 className="mp-card-title">{displayName}</h3>
        </Link>

        <p className="mp-rating-row">
          <span className="mp-rating-num">{rating.toFixed(1).replace(/\.0$/, "")}</span>
          <span className="mp-stars" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                width="13"
                height="13"
                viewBox="0 0 24 24"
                className={star <= Math.round(rating) ? "is-full" : "is-empty"}
              >
                <path
                  fill="currentColor"
                  d="M12 2.2l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.1l-5.84 3.07 1.11-6.5-4.72-4.6 6.53-.95L12 2.2z"
                />
              </svg>
            ))}
          </span>
          {product.categoryName && (
            <span className="mp-rating-count">· {product.categoryName}</span>
          )}
        </p>

        <div className="mp-pricing-block">
          <p className="mp-price-row">
            <span className="mp-currency">EGP</span>
            <span className="mp-price-now">{price.toLocaleString("en-US")}</span>
            {hasDiscount && (
              <>
                <s className="mp-price-old">
                  {crossedPrice.toLocaleString("en-US")}
                </s>
                <span className="mp-discount">- {discountPct}%</span>
              </>
            )}
          </p>
        </div>

        <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={!inStock}
            onClick={() => addToCart(product, 1)}
            className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--fg)] hover:opacity-65 transition-opacity cursor-pointer disabled:opacity-40"
          >
            {isAr ? "+ أضف للسلة" : "+ Add to bag"}
          </button>
          <Link
            href={`/product/${product.id}`}
            className="text-[11px] text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors"
          >
            {isAr ? "التفاصيل" : "View →"}
          </Link>
        </div>
      </div>
    </article>
  );
}
