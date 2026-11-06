"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import type { AuraStoreInfo } from "@/lib/vondera";
import type { Category } from "vondera-sdk";

interface NavbarProps {
  store: AuraStoreInfo | null;
  categories: Category[];
}

const MAIN_NAV_LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
  { label: "Living Room", href: "/rooms/living-room" },
  { label: "Bedroom", href: "/rooms/bedroom" },
  { label: "Dining Room", href: "/rooms/dining-room" },
  { label: "Kitchen Room", href: "/rooms/kitchen-room" },
  { label: "Storage", href: "/rooms/storage-unit" },
  { label: "Showroom", href: "/showroom" },
];

export function Navbar({ store: _store, categories }: NavbarProps) {
  const {
    locale,
    setLocale,
    cartTotalCount,
    setIsCartOpen,
    wishlist,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const pathname = usePathname();
  const router = useRouter();
  const [showTopbar, setShowTopbar] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== "/products" && !pathname.startsWith("/rooms/")) {
      router.push("/products");
    }
  };

  return (
    <div id="top">
      {showTopbar && (
        <div className="topbar">
          <div className="marquee-track">
            <div className="marquee-group">
              <span>Complimentary delivery on orders above EGP 10,000</span>
              <span>
                New season arrivals — discover pieces from independent makers
              </span>
              <span>Pay in 6 interest-free instalments</span>
              <span>Discover furniture from sellers across Egypt</span>
            </div>
            <div className="marquee-group" aria-hidden="true">
              <span>Complimentary delivery on orders above EGP 10,000</span>
              <span>
                New season arrivals — discover pieces from independent makers
              </span>
              <span>Pay in 6 interest-free instalments</span>
              <span>Discover furniture from sellers across Egypt</span>
            </div>
          </div>
          <button
            className="topbar-close"
            type="button"
            aria-label="Hide announcements"
            onClick={() => setShowTopbar(false)}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <header className="site-header">
        <div className="wrap">
          <div className="header-row">
            <button
              className="mobile-trigger"
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link className="logo" href="/">
              Aura furniture
            </Link>

            <form
              className="search-desktop"
              role="search"
              onSubmit={handleSearchSubmit}
            >
              <div className="search-wrap">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  placeholder="Search furniture, rooms and categories…"
                  aria-label="Search products"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>

            <div className="header-tools">
              <button
                type="button"
                onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                className="icon-btn"
                title="Switch Language"
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  width: "auto",
                  padding: "0 0.5rem",
                }}
              >
                {locale === "ar" ? "EN" : "AR"}
              </button>

              <Link
                href="/wishlist"
                className="icon-btn"
                aria-label="Wishlist"
                title="Saved pieces"
                style={
                  pathname === "/wishlist" ? { color: "#e11d48" } : undefined
                }
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={pathname === "/wishlist" ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                {wishlist.length > 0 && (
                  <span className="wish-badge">{wishlist.length}</span>
                )}
              </Link>

              <button
                className="icon-btn"
                type="button"
                aria-label="Open cart"
                onClick={() => setIsCartOpen(true)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartTotalCount > 0 && (
                  <span className="wish-badge">{cartTotalCount}</span>
                )}
              </button>
            </div>
          </div>

          <div className="search-mobile">
            <form role="search" onSubmit={handleSearchSubmit}>
              <div className="search-wrap">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  placeholder="Search furniture, rooms and categories…"
                  aria-label="Search products"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          <nav className="cat-nav" aria-label="Main site navigation">
            <ul className="no-scrollbar">
              {MAIN_NAV_LINKS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={isActive ? "is-active" : ""}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li className="ml-auto flex items-center gap-4">
                <span className="deliver">Deliver to Egypt</span>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <span className="logo">Aura furniture</span>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="drawer-body">
              <p className="eyebrow">Pages &amp; Rooms</p>
              <ul>
                {MAIN_NAV_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 text-sm"
                    >
                      <span>{item.label}</span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <span>Saved Pieces ({wishlist.length})</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                </li>
              </ul>

              {categories.length > 0 && (
                <>
                  <p className="eyebrow mt-6">Browse by Furniture Type</p>
                  <ul>
                    {categories.slice(0, 14).map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={`/products?category=${encodeURIComponent(
                            cat.id
                          )}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-2 text-sm"
                        >
                          <span>{cat.name}</span>
                          {cat.productsCount ? (
                            <span className="text-xs opacity-60">
                              ({cat.productsCount})
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
