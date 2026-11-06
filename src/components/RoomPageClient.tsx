"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";
import {
  ROOM_CATEGORY_TREE,
  matchesCategoryFilter,
} from "@/lib/catalog-utils";
import type { AuraProduct } from "@/lib/vondera";

const LIVING_COMPLETE_CARDS = [
  {
    title: "Sofas",
    alt: "Warm minimalist living room with beige sofa",
    image: "/images/homepage/home-asset-17.jpg",
    categoryId: "sofa",
  },
  {
    title: "Chairs",
    alt: "Sculptural wooden lounge chair in sunlit corner",
    image: "/images/homepage/home-asset-18.jpg",
    categoryId: "chairs",
  },
  {
    title: "Tv units",
    alt: "Modern walnut and matte white TV media console",
    image: "/images/homepage/home-asset-19.jpg",
    categoryId: "tv-table",
  },
  {
    title: "Center Table",
    alt: "Round travertine and oak nesting coffee tables",
    image: "/images/homepage/home-asset-20.jpg",
    categoryId: "center-table",
  },
  {
    title: "Living room set",
    alt: "Complete cream bouclé living room sofa and armchair set",
    image: "/images/homepage/home-asset-21.jpg",
    categoryId: "living-rooms",
  },
  {
    title: "Recliner",
    alt: "Plush oatmeal linen recliner armchair",
    image: "/images/homepage/home-asset-22.jpg",
    categoryId: "recliner",
  },
  {
    title: "Side tables",
    alt: "Brushed brass C-shaped marble-top side table beside sofa",
    image: "/images/homepage/home-asset-23.jpg",
    categoryId: "tables",
  },
  {
    title: "Shoe Racks",
    alt: "Entryway and living room shoe storage cabinet",
    image: "/images/homepage/home-asset-24.jpg",
    categoryId: "shoe-rack",
  },
];

const BEDROOM_ESSENTIALS_CARDS = [
  {
    title: "Beds",
    alt: "Upholstered beige double bed flanked by walnut nightstands and warm glowing lamps",
    image: "/images/homepage/home-asset-33.jpg",
    categoryId: "beds",
  },
  {
    title: "Wardrobes",
    alt: "Modern 3-door sliding bedroom wardrobe with matte white panels and center mirror",
    image: "/images/homepage/home-asset-34.jpg",
    categoryId: "wardrobe",
  },
  {
    title: "Makeup vanity",
    alt: "Warm walnut and cream makeup vanity desk with LED-backlit mirror and drawers",
    image: "/images/homepage/home-asset-35.jpg",
    categoryId: "dressing-table",
  },
  {
    title: "Commodes",
    alt: "Minimalist warm walnut 2-drawer commode chest in sunlit bedroom",
    image: "/images/homepage/home-asset-36.jpg",
    categoryId: "commode-&-drawer-units",
  },
];

const ROOM_CONFIGS: Record<
  string,
  {
    slug: string;
    title: string;
    eyebrow: string;
    subtitle: string;
    bannerImage: string;
    bannerHeadline: string;
    bannerSubline: string;
    treeRoomId: string;
    showcaseRowIndices: number[];
  }
> = {
  "living-room": {
    slug: "living-room",
    title: "Living Room",
    eyebrow: "Room Edit · 01",
    subtitle:
      "Sofas, media consoles, coffee tables, lounge chairs, and complete living sets crafted for everyday gathering.",
    bannerImage: "/images/homepage/base44-1.png",
    bannerHeadline: "Find the pieces that make it home.",
    bannerSubline:
      "Warm bouclé, solid oak and considered proportions across 11 living room categories.",
    treeRoomId: "living-room",
    showcaseRowIndices: [2, 3],
  },
  bedroom: {
    slug: "bedroom",
    title: "Bedroom",
    eyebrow: "Room Edit · 02",
    subtitle:
      "Platform beds, sliding and hinged wardrobes, dressing vanities, commodes, and nursery furniture.",
    bannerImage: "/images/homepage/home-asset-32.jpg",
    bannerHeadline: "Create Your Perfect Bedroom",
    bannerSubline:
      "Discover bedroom furniture designed for restful, uncluttered mornings.",
    treeRoomId: "bedroom",
    showcaseRowIndices: [4, 5],
  },
  "dining-room": {
    slug: "dining-room",
    title: "Dining Room",
    eyebrow: "Room Edit · 03",
    subtitle:
      "Dining tables, upholstered dining chairs, sideboards, and complete dining sets made for long dinners.",
    bannerImage: "/images/homepage/home-asset-50.jpg",
    bannerHeadline: "Designed for Every Gathering",
    bannerSubline:
      "Complete your dining area with furniture that blends warmth, durability, and style.",
    treeRoomId: "dining-room",
    showcaseRowIndices: [6, 7],
  },
  "kitchen-room": {
    slug: "kitchen-room",
    title: "Kitchen Room",
    eyebrow: "Room Edit · 04",
    subtitle:
      "Modular kitchen units, cabinetry, and functional culinary storage solutions.",
    bannerImage: "/images/homepage/home-asset-11.jpg",
    bannerHeadline: "Considered Kitchen Spaces",
    bannerSubline:
      "Practical kitchen cabinetry and modular units built for modern Egyptian homes.",
    treeRoomId: "kitchen-room",
    showcaseRowIndices: [],
  },
  "storage-unit": {
    slug: "storage-unit",
    title: "Storage & Organization",
    eyebrow: "Room Edit · 05",
    subtitle:
      "Wardrobes, shoe racks, commodes, bookcases, and multi-purpose storage cabinets.",
    bannerImage: "/images/homepage/home-asset-2.jpg",
    bannerHeadline: "Quiet Storage for Every Room",
    bannerSubline:
      "Thoughtfully proportioned wardrobes, drawer units, and display shelving.",
    treeRoomId: "living-room",
    showcaseRowIndices: [3],
  },
};

const ITEMS_PER_PAGE = 24;

export function RoomPageClient({
  roomSlug,
  products,
}: {
  roomSlug: string;
  products: AuraProduct[];
}) {
  const { searchQuery } = useStore();
  const config = ROOM_CONFIGS[roomSlug] || ROOM_CONFIGS["living-room"];

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">(
    "featured"
  );
  const [currentPage, setCurrentPage] = useState(1);

  const treeRoom = useMemo(() => {
    if (roomSlug === "storage-unit") {
      return {
        id: "storage-unit",
        name: "Storage & Organization",
        subcategories: [
          { id: "wardrobe", name: "Wardrobe" },
          { id: "shoe-rack", name: "Shoe Rack" },
          { id: "commode-&-drawer-units", name: "Commode & Drawer Units" },
          { id: "storage-units", name: "Storage Units" },
          { id: "display-&-book-cases", name: "Display & Book Cases" },
          { id: "clothes-hangers", name: "Clothes Hangers" },
        ],
      };
    }
    return (
      ROOM_CATEGORY_TREE.find((r) => r.id === config.treeRoomId) ||
      ROOM_CATEGORY_TREE[0]
    );
  }, [roomSlug, config.treeRoomId]);

  const activeFilterId =
    selectedSubcategory === "ALL" ? config.slug : selectedSubcategory;

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => matchesCategoryFilter(p, activeFilterId));

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
  }, [products, activeFilterId, searchQuery, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  );
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, safePage]);

  const handleSelectSub = (subId: string) => {
    setSelectedSubcategory(subId);
    setCurrentPage(1);
    const el = document.getElementById("room-catalog-grid");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    const el = document.getElementById("room-catalog-grid");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main>
      {/* Room Switcher Bar */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          background: "#faf8f4",
        }}
      >
        <div
          className="wrap"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            paddingTop: "0.85rem",
            paddingBottom: "0.85rem",
            flexWrap: "wrap",
          }}
        >
          <div className="flex items-center gap-2 text-xs text-[var(--muted-fg)]">
            <Link href="/" className="hover:text-[var(--fg)]">
              Home
            </Link>
            <span>›</span>
            <Link href="/products" className="hover:text-[var(--fg)]">
              Rooms
            </Link>
            <span>›</span>
            <span className="text-[var(--fg)] font-medium">{config.title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {Object.values(ROOM_CONFIGS).map((r) => (
              <Link
                key={r.slug}
                href={`/rooms/${r.slug}`}
                className={`chip ${r.slug === config.slug ? "is-active" : ""}`}
              >
                {r.title}
              </Link>
            ))}
            <Link href="/products" className="chip">
              All {products.length} Products →
            </Link>
          </div>
        </div>
      </div>

      {/* Room Hero Banner */}
      <section className="story" style={{ paddingTop: "2.25rem", paddingBottom: "1.5rem" }}>
        <div className="wrap">
          <div className="mb-5">
            <p className="eyebrow">{config.eyebrow}</p>
            <h1 className="display-title mt-1">{config.title}</h1>
            <p className="mt-2 text-sm text-[var(--muted-fg)] max-w-2xl">
              {config.subtitle}
            </p>
          </div>

          <div
            className={`bedroom-hero-banner ${
              config.slug === "dining-room" ? "dining-hero-banner" : ""
            }`}
            style={{ cursor: "default" }}
          >
            <img
              alt={config.title}
              referrerPolicy="no-referrer"
              src={config.bannerImage}
            />
            <span
              className={`bedroom-hero-overlay ${
                config.slug === "dining-room" ? "dining-hero-overlay" : ""
              }`}
            >
              <span className="bedroom-hero-title">{config.bannerHeadline}</span>
              <span className="bedroom-hero-sub">{config.bannerSubline}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Room-Specific Visual Category Cards */}
      {config.slug === "living-room" && (
        <section className="products-section" style={{ paddingTop: "1rem" }}>
          <div className="wrap">
            <h2 className="living-complete-heading">
              Complete Your Living Room
            </h2>
            <div className="living-complete-grid">
              {LIVING_COMPLETE_CARDS.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  className="living-complete-card"
                  onClick={() => handleSelectSub(card.categoryId)}
                >
                  <img
                    alt={card.alt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    src={card.image}
                  />
                  <span className="living-complete-title">{card.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {config.slug === "bedroom" && (
        <section className="products-section" style={{ paddingTop: "1rem" }}>
          <div className="wrap">
            <h2 className="living-complete-heading">Bedroom Essentials</h2>
            <div className="bedroom-essentials-grid">
              {BEDROOM_ESSENTIALS_CARDS.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  className="living-complete-card"
                  onClick={() => handleSelectSub(card.categoryId)}
                >
                  <img
                    alt={card.alt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    src={card.image}
                  />
                  <span className="living-complete-title">{card.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Room Catalog Products Grid with Subcategory Filter Pills */}
      <section
        id="room-catalog-grid"
        className="products-section scroll-mt-24"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">{config.title} Catalog</p>
              <h2 className="display-title mt-1">
                {selectedSubcategory === "ALL"
                  ? `All ${config.title} Pieces`
                  : treeRoom.subcategories.find(
                      (s) => s.id === selectedSubcategory
                    )?.name || selectedSubcategory}
              </h2>
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
              {selectedSubcategory !== "ALL" && (
                <button
                  type="button"
                  className="chip"
                  onClick={() => handleSelectSub("ALL")}
                >
                  Show All {config.title}
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

          {/* Subcategory Filter Strip */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectSub("ALL")}
              className={`chip ${
                selectedSubcategory === "ALL" ? "is-active" : ""
              }`}
            >
              All {config.title}
            </button>
            {treeRoom.subcategories.map((sub) => {
              const count = products.filter((p) =>
                matchesCategoryFilter(p, sub.id)
              ).length;
              const active = selectedSubcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSelectSub(active ? "ALL" : sub.id)}
                  className={`chip ${active ? "is-active" : ""}`}
                >
                  {sub.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          {paginatedProducts.length === 0 ? (
            <div className="empty-state">
              <p>No pieces match your current filter in {config.title}.</p>
              <button type="button" onClick={() => handleSelectSub("ALL")}>
                View all {config.title} pieces
              </button>
            </div>
          ) : (
            <div className="mp-expanded-grid">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`chip ${safePage === page ? "is-active" : ""}`}
                    >
                      {page}
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
    </main>
  );
}
