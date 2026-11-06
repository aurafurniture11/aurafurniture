"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ALL_FURNITURE_TYPES,
  ROOM_CATEGORY_TREE,
  matchesCategoryFilter,
  type SubCategoryDef,
} from "@/lib/catalog-utils";
import type { AuraProduct } from "@/lib/vondera";

const EXPLORER_CSS = `
.cat-breadcrumb {
  padding: 4px 0 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted-fg);
}
.cat-breadcrumb a,
.cat-breadcrumb button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted-fg);
  background: transparent;
  border: 0;
  padding: 0;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.18s;
}
.cat-breadcrumb a:hover,
.cat-breadcrumb button:hover {
  color: var(--fg);
}
.cat-breadcrumb .is-current {
  color: var(--fg);
  font-weight: 500;
}
.ct {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--card);
}
@media (min-width: 768px) {
  .ct {
    grid-template-columns: 245px minmax(0, 1fr);
  }
}
.sb {
  background: var(--muted);
  border-bottom: 1px solid var(--border);
  padding: 12px 0;
}
@media (min-width: 768px) {
  .sb {
    border-bottom: 0;
    border-right: 1px solid var(--border);
  }
}
.sh {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--fg);
  border: 0;
  background: transparent;
  width: 100%;
  text-align: left;
  border-radius: 0;
  transition: background 0.15s, color 0.15s;
}
.sh:hover {
  background: rgba(20, 20, 20, 0.04);
}
.sh.on {
  background: rgba(157, 91, 62, 0.14);
  color: var(--primary);
}
.sh .n {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: var(--muted-fg);
}
.sh.on .n {
  color: var(--primary);
  font-weight: 600;
}
.sl {
  margin: 2px 0 6px 24px;
  border-left: 1px solid var(--border);
  display: none;
}
.sl.open {
  display: block;
}
.sl button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--muted-fg);
  background: transparent;
  border: 0;
  text-align: left;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.sl button:hover {
  color: var(--fg);
}
.sl button.is-sub-active {
  color: var(--primary);
  font-weight: 600;
  background: rgba(157, 91, 62, 0.08);
}
.mn {
  padding: 18px 20px;
}
.tg {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.tl {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 12px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, transform 0.18s, box-shadow 0.18s;
}
.tl:hover {
  border-color: var(--fg);
  transform: translateY(-1px);
}
.tl.is-active {
  border-color: var(--primary);
  background: rgba(157, 91, 62, 0.1);
  box-shadow: 0 0 0 1px var(--primary);
}
.tl .tl-icon {
  color: var(--muted-fg);
  transition: color 0.18s;
}
.tl:hover .tl-icon,
.tl.is-active .tl-icon {
  color: var(--primary);
}
.tl p {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;
  color: var(--fg);
}
.tl .tl-count {
  margin-top: 3px;
  font-size: 11px;
  color: var(--muted-fg);
}
.tl.is-active .tl-count {
  color: var(--primary);
}
`;

export function CategoryIcon({
  icon,
  size = 24,
  className = "",
}: {
  icon: SubCategoryDef["icon"];
  size?: number;
  className?: string;
}) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (icon) {
    case "sofa":
      return (
        <svg {...props}>
          <path d="M4 11a2 2 0 0 1 2 2v1h12v-1a2 2 0 1 1 4 0v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4a2 2 0 0 1 2-2z" />
          <path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3" />
          <path d="M5 18v2M19 18v2" />
        </svg>
      );
    case "armchair":
      return (
        <svg {...props}>
          <path d="M5 11a2 2 0 0 1 2 2v2h10v-2a2 2 0 1 1 4 0v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" />
          <path d="M5 11V6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5" />
          <path d="M6 19v2M18 19v2" />
        </svg>
      );
    case "tv":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="11" rx="2" />
          <path d="M8 19h8M12 16v3" />
        </svg>
      );
    case "table":
      return (
        <svg {...props}>
          <path d="M3 8h18" />
          <path d="M4 8v11M20 8v11" />
          <path d="M4 13h16" />
        </svg>
      );
    case "coffee":
      return (
        <svg {...props}>
          <path d="M3 14c.83.64 2.077 1 3.5 1s2.67-.36 3.5-1c.83-.64 2.077-1 3.5-1s2.67.36 3.5 1" />
          <path d="M17 8h1a3 3 0 0 1 0 6h-1" />
          <path d="M5 8h12v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8z" />
        </svg>
      );
    case "laptop":
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="10" rx="1" />
          <path d="M2 18h20" />
        </svg>
      );
    case "books":
      return (
        <svg {...props}>
          <rect x="5" y="4" width="4" height="16" rx="1" />
          <rect x="9" y="4" width="4" height="16" rx="1" />
          <path d="M5 8h4M9 14h4" />
          <path d="m15 5 3.5-.7a1 1 0 0 1 1.2.8l2 13.8a1 1 0 0 1-.8 1.2l-3.5.7a1 1 0 0 1-1.2-.8l-2-13.8a1 1 0 0 1 .8-1.2z" />
        </svg>
      );
    case "bed":
      return (
        <svg {...props}>
          <path d="M3 7v11M21 18v-7a2 2 0 0 0-2-2H8v6" />
          <path d="M3 15h18" />
          <circle cx="6" cy="11" r="1.5" />
        </svg>
      );
    case "baby":
      return (
        <svg {...props}>
          <circle cx="8" cy="19" r="2" />
          <circle cx="17" cy="19" r="2" />
          <path d="M5 13h14l-1.5 4h-11z" />
          <path d="M12 13V6a5 5 0 0 1 5 5h-5z" />
          <path d="M5 13 3 9h2" />
        </svg>
      );
    case "door":
      return (
        <svg {...props}>
          <rect x="5" y="3" width="14" height="18" rx="1.5" />
          <path d="M12 3v18" />
          <path d="M9.5 11v2M14.5 11v2" />
        </svg>
      );
    case "box":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M4 10h16M4 15h16" />
          <path d="M10 7h4M10 12.5h4M10 17.5h4" />
        </svg>
      );
    case "hanger":
      return (
        <svg {...props}>
          <path d="M12 6a2 2 0 1 0-2-2" />
          <path d="M12 6v2l8 6a1.5 1.5 0 0 1-.9 2.7H4.9A1.5 1.5 0 0 1 4 14l8-6" />
        </svg>
      );
    case "kitchen":
      return (
        <svg {...props}>
          <path d="M19 3v12h-5c-.023-3.681.184-7.406 5-12zm0 12v6h-1v-3M8 4v17M5 4v3a3 3 0 1 0 6 0V4" />
        </svg>
      );
    case "grid":
    default:
      return (
        <svg {...props}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      );
  }
}

interface CategoryExplorerProps {
  products: AuraProduct[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  showDedicatedPageLink?: boolean;
}

export function CategoryExplorer({
  products,
  selectedCategory,
  onSelectCategory,
  showDedicatedPageLink = false,
}: CategoryExplorerProps) {
  // Compute product counts per subcategory and per room
  const countsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const typeDef of ALL_FURNITURE_TYPES) {
      const count = products.filter((p) =>
        matchesCategoryFilter(p, typeDef.id)
      ).length;
      map.set(typeDef.id, count);
    }
    for (const room of ROOM_CATEGORY_TREE) {
      const roomCount = products.filter((p) =>
        matchesCategoryFilter(p, room.id)
      ).length;
      map.set(room.id, roomCount);
    }
    return map;
  }, [products]);

  // Determine which room tab is active in the sidebar (default: 0 = Living room)
  const derivedRoomIndex = useMemo(() => {
    if (!selectedCategory || selectedCategory === "ALL") return 0;
    const byRoomId = ROOM_CATEGORY_TREE.findIndex(
      (r) => r.id === selectedCategory
    );
    if (byRoomId !== -1) return byRoomId;

    const bySubId = ROOM_CATEGORY_TREE.findIndex((r) =>
      r.subcategories.some(
        (s) =>
          s.id.toLowerCase() === selectedCategory.toLowerCase() ||
          s.name.toLowerCase() === selectedCategory.toLowerCase()
      )
    );
    return bySubId !== -1 ? bySubId : 0;
  }, [selectedCategory]);

  const [manualRoomIdx, setManualRoomIdx] = useState<number | null>(null);
  const activeRoomIdx = manualRoomIdx ?? derivedRoomIndex;
  const activeRoom = ROOM_CATEGORY_TREE[activeRoomIdx] || ROOM_CATEGORY_TREE[0];

  // Find active subcategory if selectedCategory is one of the 24 types
  const activeSubcategory = useMemo(() => {
    return ALL_FURNITURE_TYPES.find(
      (t) =>
        t.id.toLowerCase() === selectedCategory.toLowerCase() ||
        t.name.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory]);

  // Sort all 24 furniture types by count descending for the "By Furniture Type" section
  const sortedFurnitureTypes = useMemo(() => {
    return [...ALL_FURNITURE_TYPES].sort(
      (a, b) => (countsMap.get(b.id) || 0) - (countsMap.get(a.id) || 0)
    );
  }, [countsMap]);

  const [showAllTypes, setShowAllTypes] = useState(false);

  return (
    <div className="mb-8">
      <style dangerouslySetInnerHTML={{ __html: EXPLORER_CSS }} />

      {/* 1. Breadcrumb bar matching the user's mockup */}
      <div className="cat-breadcrumb">
        <Link href="/">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </Link>
        <span>›</span>
        <button
          type="button"
          onClick={() => {
            setManualRoomIdx(null);
            onSelectCategory("ALL");
          }}
          className={selectedCategory === "ALL" ? "is-current" : ""}
        >
          Products
        </button>
        <span>›</span>
        <button
          type="button"
          onClick={() => {
            onSelectCategory(activeRoom.id);
          }}
          className={!activeSubcategory ? "is-current" : ""}
        >
          {activeRoom.name}
        </button>
        {activeSubcategory && (
          <>
            <span>›</span>
            <span className="is-current">{activeSubcategory.name}</span>
          </>
        )}

        {showDedicatedPageLink && (
          <Link
            href={
              selectedCategory && selectedCategory !== "ALL"
                ? `/products?category=${encodeURIComponent(selectedCategory)}`
                : "/products"
            }
            className="ml-auto text-xs font-medium uppercase tracking-[0.14em] text-[var(--primary)] hover:underline"
          >
            Open Dedicated Products Page →
          </Link>
        )}
      </div>

      {/* 2. Room Sidebar + Subcategory Tiles Explorer (Exact Mockup Structure) */}
      <div className="ct">
        {/* Left Sidebar (.sb) */}
        <div className="sb">
          {ROOM_CATEGORY_TREE.map((room, idx) => {
            const isRoomOpen = idx === activeRoomIdx;
            const isRoomFilterActive =
              selectedCategory === room.id ||
              (activeSubcategory && activeSubcategory.roomId === room.id);

            return (
              <div key={room.id}>
                <button
                  type="button"
                  className={`sh ${isRoomOpen || isRoomFilterActive ? "on" : ""}`}
                  onClick={() => {
                    setManualRoomIdx(idx);
                    onSelectCategory(room.id);
                  }}
                >
                  <CategoryIcon icon={room.icon} size={18} />
                  <span>{room.name}</span>
                  <span className="n">{room.subcategories.length}</span>
                </button>

                <div className={`sl ${isRoomOpen ? "open" : ""}`}>
                  {room.subcategories.map((sub) => {
                    const isSubActive =
                      selectedCategory.toLowerCase() === sub.id.toLowerCase();
                    const subCount = countsMap.get(sub.id) || 0;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        className={isSubActive ? "is-sub-active" : ""}
                        onClick={() => {
                          setManualRoomIdx(idx);
                          onSelectCategory(isSubActive ? room.id : sub.id);
                        }}
                      >
                        <span>{sub.name}</span>
                        <span className="text-[11px] opacity-65">
                          {subCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Subcategory Tiles Panel (.mn) */}
        <div className="mn">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "10px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "var(--fg)",
                }}
              >
                {activeRoom.name}
              </h3>
              <span style={{ fontSize: "13px", color: "var(--muted-fg)" }}>
                {activeRoom.subcategories.length}{" "}
                {activeRoom.subcategories.length === 1
                  ? "sub category"
                  : "sub categories"}{" "}
                · {countsMap.get(activeRoom.id) || 0} products
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {selectedCategory !== activeRoom.id && (
                <button
                  type="button"
                  onClick={() => onSelectCategory(activeRoom.id)}
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--primary)",
                    background: "transparent",
                    border: 0,
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  Filter entire {activeRoom.name}
                </button>
              )}
              {selectedCategory !== "ALL" && (
                <button
                  type="button"
                  onClick={() => onSelectCategory("ALL")}
                  style={{
                    fontSize: "12px",
                    color: "var(--muted-fg)",
                    background: "transparent",
                    border: 0,
                    padding: 0,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Show all ({products.length})
                </button>
              )}
            </div>
          </div>

          <div className="tg">
            {activeRoom.subcategories.map((sub) => {
              const isTileActive =
                selectedCategory.toLowerCase() === sub.id.toLowerCase();
              const subCount = countsMap.get(sub.id) || 0;
              return (
                <button
                  key={sub.id}
                  type="button"
                  className={`tl ${isTileActive ? "is-active" : ""}`}
                  onClick={() => {
                    onSelectCategory(isTileActive ? activeRoom.id : sub.id);
                  }}
                >
                  <span className="tl-icon">
                    <CategoryIcon icon={sub.icon} size={24} />
                  </span>
                  <p>{sub.name}</p>
                  <span className="tl-count">{subCount} pieces</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Categories by Furniture Type Itself (Direct Type Filter Bar) */}
      <div className="mt-6 pt-5 border-t border-[var(--border)]">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="eyebrow">Browse by Type</span>
            <span style={{ fontSize: "12px", color: "var(--muted-fg)" }}>
              ({ALL_FURNITURE_TYPES.length} furniture types)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAllTypes((prev) => !prev)}
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--primary)",
              background: "transparent",
              border: 0,
              padding: 0,
              cursor: "pointer",
            }}
          >
            {showAllTypes
              ? "Show Top Types"
              : `Show All ${ALL_FURNITURE_TYPES.length} Types`}
          </button>
        </div>

        <div className="chips">
          <button
            type="button"
            onClick={() => onSelectCategory("ALL")}
            className={`chip ${selectedCategory === "ALL" ? "is-active" : ""}`}
          >
            All Types ({products.length})
          </button>
          {(showAllTypes
            ? sortedFurnitureTypes
            : sortedFurnitureTypes.slice(0, 12)
          ).map((typeDef) => {
            const isTypeActive =
              selectedCategory.toLowerCase() === typeDef.id.toLowerCase();
            const count = countsMap.get(typeDef.id) || 0;
            return (
              <button
                key={typeDef.id}
                type="button"
                onClick={() => {
                  const roomIdx = ROOM_CATEGORY_TREE.findIndex(
                    (r) => r.id === typeDef.roomId
                  );
                  if (roomIdx !== -1) setManualRoomIdx(roomIdx);
                  onSelectCategory(isTypeActive ? "ALL" : typeDef.id);
                }}
                className={`chip ${isTypeActive ? "is-active" : ""}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CategoryIcon icon={typeDef.icon} size={14} />
                <span>{typeDef.name}</span>
                <span style={{ opacity: 0.65 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
