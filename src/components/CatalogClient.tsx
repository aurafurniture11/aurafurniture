"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";
import type { AuraProduct, AuraStoreInfo } from "@/lib/vondera";
import type { Category } from "vondera-sdk";

interface CatalogClientProps {
  store: AuraStoreInfo | null;
  categories: Category[];
  products: AuraProduct[];
  initialCategoryId?: string;
}

const HERO_SLIDES = [
  {
    image: "/images/homepage/base44-1.png",
    alt: "Living room in warm neutral tones",
    eyebrow: "New season · Living",
    title: "Find the pieces that make it home.",
    subtitle:
      "Discover considered pieces from independent furniture makers and trusted sellers across Egypt.",
    cta: "Explore the living edit",
    href: "/rooms/living-room",
  },
  {
    image: "/images/homepage/base44-2.png",
    alt: "Softly furnished bedroom",
    eyebrow: "The bedroom edit",
    title: "Sleep, quietly furnished.",
    subtitle:
      "Low platform beds, washed linen and soft morning light — our calmest collection yet.",
    cta: "Shop the bedroom edit",
    href: "/rooms/bedroom",
  },
  {
    image: "/images/homepage/base44-3.png",
    alt: "Dining room in oak and cane",
    eyebrow: "The dining room",
    title: "Gather around something solid.",
    subtitle:
      "Solid oak, woven cane and hand-thrown ceramics, made for long dinners that run late.",
    cta: "Shop the dining edit",
    href: "/rooms/dining-room",
  },
];

const SHOP_BY_CATEGORY_RAIL = [
  {
    label: "Sofa",
    image: "/images/homepage/home-asset-1.jpg",
    categoryId: "sofa",
  },
  {
    label: "Wardrobe",
    image: "/images/homepage/home-asset-2.jpg",
    categoryId: "wardrobe",
  },
  {
    label: "TV Table",
    image: "/images/homepage/home-asset-3.jpg",
    categoryId: "tv-table",
  },
  {
    label: "Shoe Rack",
    image: "/images/homepage/home-asset-4.jpg",
    categoryId: "shoe-rack",
  },
  {
    label: "Beds",
    image: "/images/homepage/home-asset-5.jpg",
    categoryId: "beds",
  },
  {
    label: "Center Table",
    image: "/images/homepage/home-asset-6.jpg",
    categoryId: "center-table",
  },
  {
    label: "Desks",
    image: "/images/homepage/home-asset-7.jpg",
    categoryId: "laptop-&-computer-tables",
  },
  {
    label: "Commode & Drawers",
    image: "/images/homepage/home-asset-8.jpg",
    categoryId: "commode-&-drawer-units",
  },
];

const PROMO_TRIO_CARDS = [
  {
    title: "Living Room",
    alt: "Bright modern living room with curved cream bouclé sofa, lounge chairs, and area rug",
    image: "/images/homepage/home-asset-9.jpg",
    href: "/rooms/living-room",
  },
  {
    title: "Bedroom",
    alt: "Minimalist sunlit bedroom with platform bed and neutral bedding",
    image: "/images/homepage/home-asset-10.jpg",
    href: "/rooms/bedroom",
  },
  {
    title: "Dining Room",
    alt: "Warm contemporary dining room with wooden table, upholstered chairs, and display cabinet",
    image: "/images/homepage/home-asset-11.jpg",
    href: "/rooms/dining-room",
  },
];

export function CatalogClient({
  store: _store,
  categories: _categories,
  products,
}: CatalogClientProps) {
  const { searchQuery } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);
  const categoryRailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const scrollCategoryRail = (dir: -1 | 1) => {
    if (!categoryRailRef.current) return;
    categoryRailRef.current.scrollBy({
      left: dir * 280,
      behavior: "smooth",
    });
  };

  const featuredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.nameAr?.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q)
    );
  });

  return (
    <main>
      {/* 1. HERO CAROUSEL */}
      <section
        className="hero"
        aria-roledescription="carousel"
        aria-label="Featured collections"
      >
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === activeSlide;
          return (
            <div
              key={slide.title}
              className={`slide ${isActive ? "is-active" : ""}`}
              aria-hidden={isActive ? "false" : "true"}
            >
              <img
                alt={slide.alt}
                referrerPolicy="no-referrer"
                src={slide.image}
              />
              <div className="hero-copy">
                <div className="wrap">
                  <p className="hero-eyebrow">{slide.eyebrow}</p>
                  <h1>{slide.title}</h1>
                  <p>{slide.subtitle}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={slide.href} className="btn-ghost-light">
                      {slide.cta}
                    </Link>
                    <Link
                      href="/products"
                      className="btn-ghost-light"
                      style={{ opacity: 0.85 }}
                    >
                      All {products.length} Pieces →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="hero-controls">
          <div className="hero-dots">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.title}
                className={`hero-dot ${index === activeSlide ? "is-active" : ""}`}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
          <div className="hero-arrows">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() =>
                setActiveSlide(
                  (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                )
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() =>
                setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY CIRCULAR RAIL */}
      <section className="rail-section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Browse by Type</p>
              <h2 className="display-title mt-2">Shop by category</h2>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/products" className="chip">
                All 24 Categories →
              </Link>
              <div className="rail-buttons">
                <button
                  type="button"
                  aria-label="Scroll categories left"
                  onClick={() => scrollCategoryRail(-1)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Scroll categories right"
                  onClick={() => scrollCategoryRail(1)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div ref={categoryRailRef} className="rail-track no-scrollbar">
            {SHOP_BY_CATEGORY_RAIL.map((cat) => (
              <Link
                key={cat.label}
                className="cat"
                href={`/products?category=${encodeURIComponent(cat.categoryId)}`}
              >
                <span className="cat-thumb">
                  <img
                    alt={cat.label}
                    referrerPolicy="no-referrer"
                    src={cat.image}
                  />
                </span>
                <span className="cat-label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SHOP BY ROOM — DEDICATED ROOM PAGES */}
      <section className="promo-section" aria-label="Shop by room">
        <div className="wrap">
          <div className="section-head mb-6">
            <div>
              <p className="eyebrow">Curated Spaces</p>
              <h2 className="display-title mt-2">Explore by Room</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/rooms/kitchen-room" className="chip">
                Kitchen Room →
              </Link>
              <Link href="/rooms/storage-unit" className="chip">
                Storage &amp; Organization →
              </Link>
            </div>
          </div>
          <div className="promo-trio">
            {PROMO_TRIO_CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="promo-trio-card"
              >
                <img
                  alt={card.alt}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  src={card.image}
                />
                <span className="promo-trio-title">{card.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LIVE FEATURED PIECES FROM VONDERA */}
      <section
        className="seller-section"
        id="sellers"
        aria-label="Featured pieces"
      >
        <div className="wrap">
          <div className="section-head mb-6">
            <div>
              <p className="eyebrow">Live Collection</p>
              <h2 className="display-title mt-1">Featured Pieces</h2>
              <p className="mt-1 text-sm text-[var(--muted-fg)]">
                {products.length} published{" "}
                {products.length === 1 ? "piece" : "pieces"} available in store
              </p>
            </div>
            <Link href="/products" className="chip">
              View All ({products.length}) →
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="empty-state">
              <p>
                No published products match your search, or products in Vondera
                are currently in Draft status.
              </p>
            </div>
          ) : (
            <div className="mp-expanded-grid">
              {featuredProducts.slice(0, 12).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Dedicated Catalog Callout Banner */}
          <div
            style={{
              marginTop: "3rem",
              padding: "2.25rem 2rem",
              borderRadius: "14px",
              border: "1px solid var(--border)",
              background: "#faf8f4",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
            }}
          >
            <div>
              <p className="eyebrow">Complete Directory</p>
              <h3 className="display-title mt-1" style={{ fontSize: "1.65rem" }}>
                Browse all {products.length} pieces across 24 furniture types
              </h3>
              <p className="mt-1.5 text-sm text-[var(--muted-fg)] max-w-xl">
                Filter by room tree, subcategory tiles, or furniture type on our
                dedicated catalog directory page.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/products" className="chip is-active">
                Open Full Catalog ({products.length}) →
              </Link>
              <Link href="/showroom" className="chip">
                Cairo Showroom &amp; Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMPACT SERVICES BAR */}
      <section className="services" id="service">
        <div className="wrap">
          <div className="service-grid">
            <div className="service">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                <path d="M15 18H9" />
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                <circle cx="17" cy="18" r="2" />
                <circle cx="7" cy="18" r="2" />
              </svg>
              <h3>Delivery &amp; assembly</h3>
              <p>Two-person delivery across Egypt, assembled in your room.</p>
            </div>
            <div className="service">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <h3>14-day returns</h3>
              <p>Changed your mind? We collect it, no questions asked.</p>
            </div>
            <div className="service">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
              <h3>Pay in instalments</h3>
              <p>Split any order over 6 interest-free payments.</p>
            </div>
            <div className="service">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
              <h3>
                <Link href="/showroom" className="hover:underline">
                  Visit our Cairo Showroom →
                </Link>
              </h3>
              <p>Explore fabrics and finishes in person by appointment.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
