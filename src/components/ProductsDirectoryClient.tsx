"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { CategoryExplorer } from "@/components/CategoryExplorer";
import { ProductCard } from "@/components/ProductCard";
import {
  ALL_FURNITURE_TYPES,
  ROOM_CATEGORY_TREE,
  matchesCategoryFilter,
} from "@/lib/catalog-utils";
import type { AuraProduct } from "@/lib/vondera";
import type { Category } from "vondera-sdk";

const ITEMS_PER_PAGE = 24;

export function ProductsDirectoryClient({
  categories,
  products,
  initialCategoryId,
}: {
  categories: Category[];
  products: AuraProduct[];
  initialCategoryId?: string;
}) {
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery,
    wishlist,
    selectedCategory,
    setSelectedCategory,
    currentPage,
    setCurrentPage,
    onlyWishlist,
    setOnlyWishlist,
  } = useStore();

  const [sortBy, setSortBy] = useState<
    "featured" | "price-asc" | "price-desc"
  >("featured");

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategory(initialCategoryId);
      setCurrentPage(1);
    }
  }, [initialCategoryId, setSelectedCategory, setCurrentPage]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    const nextUrl =
      catId && catId !== "ALL"
        ? `/products?category=${encodeURIComponent(catId)}`
        : "/products";
    router.replace(nextUrl, { scroll: false });
  };

  const activeCategoryLabel = useMemo(() => {
    if (!selectedCategory || selectedCategory === "ALL") {
      return "All Furniture & Pieces";
    }
    const room = ROOM_CATEGORY_TREE.find((r) => r.id === selectedCategory);
    if (room) return `${room.name} Collection`;
    const sub = ALL_FURNITURE_TYPES.find(
      (t) => t.id.toLowerCase() === selectedCategory.toLowerCase()
    );
    if (sub) return sub.name;
    const cat = categories.find((c) => c.id === selectedCategory);
    return cat?.name || selectedCategory;
  }, [selectedCategory, categories]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (onlyWishlist) {
      list = list.filter((p) => wishlist.includes(p.id));
    }

    if (selectedCategory !== "ALL") {
      list = list.filter((p) => matchesCategoryFilter(p, selectedCategory));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.nameAr?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy, onlyWishlist, wishlist]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  );
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, safePage]);

  const handlePageChange = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(target);
    const el = document.getElementById("products-grid-anchor");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="products-section" id="catalog">
      <div className="wrap">
        {/* Room Tree + Subcategory Tiles + Furniture Type Strip */}
        <CategoryExplorer
          products={products}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          showDedicatedPageLink={false}
        />

        {/* Results Header & Sort Bar */}
        <div
          id="products-grid-anchor"
          className="section-head scroll-mt-28 pt-2"
        >
          <div>
            <p className="eyebrow">Catalog Directory</p>
            <h1 className="display-title mt-1">{activeCategoryLabel}</h1>
            <p className="mt-1.5 text-sm text-[var(--muted-fg)]">
              Showing{" "}
              <strong className="text-[var(--fg)]">
                {filteredProducts.length > 0
                  ? `${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                      safePage * ITEMS_PER_PAGE,
                      filteredProducts.length
                    )}`
                  : "0"}
              </strong>{" "}
              of{" "}
              <strong className="text-[var(--fg)]">
                {filteredProducts.length}
              </strong>{" "}
              pieces
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {wishlist.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setOnlyWishlist((prev) => !prev);
                  setCurrentPage(1);
                }}
                className={`chip ${onlyWishlist ? "is-active" : ""}`}
              >
                Saved ({wishlist.length})
              </button>
            )}

            {(selectedCategory !== "ALL" || searchQuery || onlyWishlist) && (
              <button
                type="button"
                className="chip"
                onClick={() => {
                  handleSelectCategory("ALL");
                  setSearchQuery("");
                  setOnlyWishlist(false);
                }}
              >
                Reset Filters
              </button>
            )}

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as typeof sortBy);
                setCurrentPage(1);
              }}
              aria-label="Sort products"
              className="chip"
              style={{ paddingRight: "1.5rem" }}
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Top Pagination Bar */}
        {totalPages > 1 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
            <span className="text-xs uppercase tracking-widest text-[var(--muted-fg)]">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => handlePageChange(safePage - 1)}
                className="chip disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => handlePageChange(safePage + 1)}
                className="chip disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {paginatedProducts.length === 0 ? (
          <div className="empty-state">
            <p>No pieces match your current filter or search.</p>
            <button
              type="button"
              onClick={() => {
                handleSelectCategory("ALL");
                setSearchQuery("");
                setOnlyWishlist(false);
              }}
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="mp-expanded-grid">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom Numbered Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-widest text-[var(--muted-fg)]">
              Page {safePage} of {totalPages} ({filteredProducts.length}{" "}
              products)
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => handlePageChange(safePage - 1)}
                className="chip disabled:opacity-40"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - safePage) <= 2
                )
                .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
                  if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                    acc.push("ellipsis");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "ellipsis" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-xs text-[var(--muted-fg)]"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handlePageChange(item)}
                      className={`chip ${safePage === item ? "is-active" : ""}`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => handlePageChange(safePage + 1)}
                className="chip disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
