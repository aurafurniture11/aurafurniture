"use client";

import React from "react";
import Link from "next/link";
import type { AuraStoreInfo } from "@/lib/vondera";
import type { Category } from "vondera-sdk";

export function Footer({
  store: _store,
  categories: _categories,
}: {
  store: AuraStoreInfo | null;
  categories: Category[];
}) {
  return (
    <footer className="site-footer" id="footer-contacts">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-grid">
            <div className="footer-brand">
              <p>Aura furniture</p>
              <p>
                A considered marketplace for furniture, home pieces and
                independent makers across Egypt.
              </p>
            </div>

            <div className="footer-shop">
              <h3>Rooms</h3>
              <ul>
                <li>
                  <Link href="/rooms/living-room">Living Room</Link>
                </li>
                <li>
                  <Link href="/rooms/bedroom">Bedroom</Link>
                </li>
                <li>
                  <Link href="/rooms/dining-room">Dining Room</Link>
                </li>
                <li>
                  <Link href="/rooms/kitchen-room">Kitchen Room</Link>
                </li>
                <li>
                  <Link href="/rooms/storage-unit">Storage &amp; Units</Link>
                </li>
              </ul>
            </div>

            <div className="footer-explore">
              <h3>Explore</h3>
              <ul>
                <li>
                  <Link href="/products">All Products</Link>
                </li>
                <li>
                  <Link href="/products?category=sofa">Sofas &amp; Seating</Link>
                </li>
                <li>
                  <Link href="/products?category=wardrobe">Wardrobes</Link>
                </li>
                <li>
                  <Link href="/products?category=tv-table">TV &amp; Media</Link>
                </li>
                <li>
                  <Link href="/wishlist">Saved Pieces</Link>
                </li>
                <li>
                  <Link href="/showroom">Showroom &amp; Delivery</Link>
                </li>
              </ul>
            </div>

            <div className="footer-visit">
              <h3>Visit</h3>
              <p>
                Cairo studio
                <br />
                By appointment
                <br />
                11–20 daily
              </p>
              <p className="mt-3">
                <Link
                  href="/showroom"
                  className="text-xs uppercase tracking-widest underline"
                >
                  Showroom details →
                </Link>
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Aura furniture — all rights reserved</p>
            <div className="flex flex-wrap items-center gap-4">
              <p>Deliveries across Egypt · Instalments available</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
