import React from "react";
import Link from "next/link";

export default function ShowroomPage() {
  return (
    <main>
      {/* Breadcrumb Bar */}
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
            <span className="text-[var(--fg)] font-medium">
              Showroom &amp; Services
            </span>
          </div>
          <Link href="/products" className="chip">
            Browse All Products →
          </Link>
        </div>
      </div>

      {/* Showroom Hero Section */}
      <section className="showroom" style={{ marginTop: 0 }}>
        <div className="wrap">
          <div className="showroom-grid">
            <div>
              <p className="eyebrow">The Cairo Showroom</p>
              <h2>Sit in it before you live with it.</h2>
              <p className="lede">
                Our Cairo studio keeps every fabric, finish and joint on the
                floor. Book a quiet hour with a stylist and leave with a plan
                for the room, not just a receipt.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/products" className="btn-outline-light">
                  Browse the floor
                  <svg
                    width="14"
                    height="14"
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
                </Link>
              </div>
            </div>
            <dl className="showroom-facts">
              <div>
                <dt>Visits</dt>
                <dd>By appointment, daily 11–20</dd>
              </div>
              <div>
                <dt>Studio</dt>
                <dd>Cairo, Egypt</dd>
              </div>
              <div>
                <dt>Samples</dt>
                <dd>Fabric swatches posted on request</dd>
              </div>
              <div>
                <dt>Made to order</dt>
                <dd>Any size, any finish</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Core Services Grid */}
      <section className="services" id="service">
        <div className="wrap">
          <div className="mb-8">
            <p className="eyebrow">How We Work</p>
            <h2 className="display-title mt-2">
              Delivery, Returns &amp; Care
            </h2>
          </div>
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
              <p>
                Two-person delivery across Egypt, assembled in your room with
                all packaging removed. Complimentary on orders above EGP 10,000.
              </p>
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
              <p>
                Changed your mind? We collect standard catalog pieces within 14
                days of delivery, no questions asked.
              </p>
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
              <p>
                Split any order over 6 interest-free monthly payments with
                supported Egyptian banks and payment partners.
              </p>
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
              <h3>Try before you buy</h3>
              <p>
                Explore beech wood finishes, linen weaves, and bouclé swatches
                in person at our Cairo studio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore by Room Links */}
      <section className="products-section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Explore Collections</p>
              <h2 className="display-title mt-1">Shop by Room</h2>
            </div>
            <Link href="/products" className="chip is-active">
              Open Full Directory →
            </Link>
          </div>
          <div className="promo-trio">
            <Link href="/rooms/living-room" className="promo-trio-card">
              <img
                alt="Living Room"
                src="/images/homepage/home-asset-9.jpg"
              />
              <span className="promo-trio-title">Living Room</span>
            </Link>
            <Link href="/rooms/bedroom" className="promo-trio-card">
              <img alt="Bedroom" src="/images/homepage/home-asset-10.jpg" />
              <span className="promo-trio-title">Bedroom</span>
            </Link>
            <Link href="/rooms/dining-room" className="promo-trio-card">
              <img
                alt="Dining Room"
                src="/images/homepage/home-asset-11.jpg"
              />
              <span className="promo-trio-title">Dining Room</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
