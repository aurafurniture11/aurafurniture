"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import type { ShowcaseCardItem, ShowcaseRow } from "@/data/homepage-showcase";
import type { AuraProduct } from "@/lib/vondera";

export function StarRating({
  rating,
  idPrefix,
}: {
  rating: number;
  idPrefix: string;
}) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.85;
  const roundedFull = rating - fullStars >= 0.85 ? fullStars + 1 : fullStars;

  return (
    <span className="mp-stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((starIdx) => {
        if (starIdx <= roundedFull) {
          return (
            <svg
              key={starIdx}
              width="13"
              height="13"
              viewBox="0 0 24 24"
              className="is-full"
            >
              <path
                fill="currentColor"
                d="M12 2.2l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.1l-5.84 3.07 1.11-6.5-4.72-4.6 6.53-.95L12 2.2z"
              />
            </svg>
          );
        }
        if (hasHalf && starIdx === fullStars + 1) {
          const gradId = `half-star-${idPrefix}-${starIdx}`;
          return (
            <svg
              key={starIdx}
              width="13"
              height="13"
              viewBox="0 0 24 24"
              className="is-half"
            >
              <defs>
                <linearGradient id={gradId}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="#d6d3cd" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#${gradId})`}
                d="M12 2.2l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.1l-5.84 3.07 1.11-6.5-4.72-4.6 6.53-.95L12 2.2z"
              />
            </svg>
          );
        }
        return (
          <svg
            key={starIdx}
            width="13"
            height="13"
            viewBox="0 0 24 24"
            className="is-empty"
          >
            <path
              fill="currentColor"
              d="M12 2.2l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.1l-5.84 3.07 1.11-6.5-4.72-4.6 6.53-.95L12 2.2z"
            />
          </svg>
        );
      })}
    </span>
  );
}

export function ShowcaseCard({ item }: { item: ShowcaseCardItem }) {
  const { toggleWishlist, isWished, addToCart } = useStore();
  const wished = isWished(item.id);
  const numPrice = Number(item.price) || 0;
  const numOld = item.oldPrice ? Number(item.oldPrice) : undefined;
  const isOut = Boolean(
    item.stockOut || item.stockTag?.toLowerCase().includes("out")
  );

  const asAuraProduct: AuraProduct = {
    id: item.id,
    name: item.title,
    price: numPrice,
    crossedPrice: numOld,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    mainImage: {
      originalSize: item.image,
      large: item.image,
      smallSize: item.image,
    },
    images: [item.image],
    isAvailable: !isOut,
  };

  return (
    <article className="mp-card">
      <div className="mp-card-media">
        <Link href={`/product/${item.id}`} className="block w-full h-full">
          <img
            alt={item.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            src={item.image}
          />
        </Link>
        {item.promoTag && (
          <span
            className={`mp-promo-tag ${
              item.promoType === "drop" ? "is-drop" : "is-code"
            }`}
          >
            {item.promoTag}
          </span>
        )}
        {item.stockTag && (
          <span className={`mp-stock-tag ${isOut ? "is-out" : ""}`}>
            {item.stockTag}
          </span>
        )}
        <button
          className="mp-save-btn"
          type="button"
          aria-pressed={wished ? "true" : "false"}
          aria-label={`Save ${item.title}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(item.id);
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
        <Link href={`/product/${item.id}`}>
          <h3 className="mp-card-title">{item.title}</h3>
        </Link>
        {item.rating !== undefined && (
          <p className="mp-rating-row">
            <span className="mp-rating-num">{item.rating}</span>
            <StarRating rating={Number(item.rating)} idPrefix={item.id} />
            {item.ratingCount !== undefined && (
              <span className="mp-rating-count">({item.ratingCount})</span>
            )}
          </p>
        )}
        <div className="mp-pricing-block">
          {item.startingFrom && <p className="mp-starting">Starting From</p>}
          <p className="mp-price-row">
            <span className="mp-currency">EGP</span>
            <span className="mp-price-now">
              {numPrice.toLocaleString("en-US")}
            </span>
            {numOld && (
              <s className="mp-price-old">{numOld.toLocaleString("en-US")}</s>
            )}
            {item.discountText && (
              <span className="mp-discount">{item.discountText}</span>
            )}
          </p>
        </div>
        {item.variantText && (
          <div className="mp-variant-box">{item.variantText}</div>
        )}
        <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={isOut}
            onClick={() => addToCart(asAuraProduct, 1)}
            className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--fg)] hover:opacity-65 transition-opacity cursor-pointer disabled:opacity-40"
          >
            + Add to bag
          </button>
          <Link
            href={`/product/${item.id}`}
            className="text-[11px] text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors"
          >
            View →
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ShowcaseCarouselBlock({
  row,
  searchQuery = "",
}: {
  row: ShowcaseRow;
  searchQuery?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const railRef = useRef<HTMLDivElement | null>(null);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return row.items;
    return row.items.filter((item) => item.title.toLowerCase().includes(q));
  }, [row.items, searchQuery]);

  const scrollRail = (dir: -1 | 1) => {
    const el = railRef.current;
    if (!el) return;
    const step = Math.max(280, Math.round(el.clientWidth * 0.78));
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (filteredItems.length === 0) return null;

  return (
    <div className="mp-showcase-block">
      <div className="mp-row-head">
        <h2>{row.title}</h2>
        <button
          type="button"
          className="mp-view-all"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <span>{expanded ? "Show Less" : "View All"}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
      <div className="mp-carousel-wrap">
        {!expanded && (
          <button
            type="button"
            className="mp-nav-arrow is-prev"
            aria-label={`Previous ${row.title}`}
            onClick={() => scrollRail(-1)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        <div
          ref={railRef}
          className={expanded ? "mp-expanded-grid" : "mp-rail no-scrollbar"}
        >
          {filteredItems.map((item) => (
            <ShowcaseCard key={item.id} item={item} />
          ))}
        </div>
        {!expanded && (
          <button
            type="button"
            className="mp-nav-arrow is-next"
            aria-label={`Next ${row.title}`}
            onClick={() => scrollRail(1)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
