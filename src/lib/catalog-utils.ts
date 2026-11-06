import type { AuraProduct } from "@/lib/vondera";

export const EGYPT_GOVERNORATES = [
  { value: "360631", labelEn: "Cairo", labelAr: "القاهرة" },
  { value: "361059", labelEn: "Alexandria", labelAr: "الإسكندرية" },
];

export function getProductImageUrl(
  product: AuraProduct | null | undefined
): string {
  if (!product) return "";
  if (product.mainImage?.originalSize) return product.mainImage.originalSize;
  if (product.mainImage?.large) return product.mainImage.large;
  if (product.mainImage?.smallSize) return product.mainImage.smallSize;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === "string") return first;
    if (first?.originalSize) return first.originalSize;
    if (first?.smallSize) return first.smallSize;
  }
  return "";
}

export function getAllProductImages(
  product: AuraProduct | null | undefined
): string[] {
  if (!product) return [];
  const urls = new Set<string>();
  const main = getProductImageUrl(product);
  if (main) urls.add(main);

  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === "string" && img) {
        urls.add(img);
      } else if (img && typeof img === "object") {
        if (img.originalSize) urls.add(img.originalSize);
        else if (img.large) urls.add(img.large);
        else if (img.smallSize) urls.add(img.smallSize);
      }
    }
  }
  return Array.from(urls);
}

/**
 * Extracts structured specification pairs (like Material, Dimensions, Color) from
 * Vondera's HTML description (`<div class="ql-code-block">العرض: 200 سم</div>`)
 */
export function parseSpecsFromDescription(html?: string): {
  specs: { label: string; value: string }[];
  cleanText: string;
} {
  if (!html) return { specs: [], cleanText: "" };

  const specs: { label: string; value: string }[] = [];
  const blockRegex =
    /<div[^>]*class="[^"]*ql-code-block[^"]*"[^>]*>(.*?)<\/div>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(html)) !== null) {
    const raw = match[1].replace(/<[^>]+>/g, "").trim();
    if (!raw) continue;
    const colonIdx = raw.indexOf(":");
    if (colonIdx > -1) {
      const label = raw.slice(0, colonIdx).trim();
      const value = raw.slice(colonIdx + 1).trim();
      if (label && value) {
        specs.push({ label, value });
      }
    } else {
      specs.push({ label: "•", value: raw });
    }
  }

  const cleanText = html
    .replace(
      /<div[^>]*class="[^"]*ql-code-block-container[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
      ""
    )
    .replace(/<div[^>]*class="[^"]*ql-code-block[^"]*"[^>]*>.*?<\/div>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { specs, cleanText };
}

export function formatEGP(amount?: number, locale: "ar" | "en" = "ar"): string {
  const num = Number(amount ?? 0);
  if (locale === "ar") {
    return `${num.toLocaleString("ar-EG")} ج.م`;
  }
  return `EGP ${num.toLocaleString("en-US")}`;
}

export function slugifyCategory(val?: string): string {
  return (val || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface SubCategoryDef {
  id: string;
  name: string;
  icon:
    | "sofa"
    | "armchair"
    | "grid"
    | "tv"
    | "table"
    | "coffee"
    | "laptop"
    | "books"
    | "bed"
    | "baby"
    | "door"
    | "box"
    | "hanger"
    | "kitchen";
}

export interface RoomCategoryGroup {
  id: string;
  name: string;
  icon: "sofa" | "bed" | "table" | "kitchen";
  subcategories: SubCategoryDef[];
}

export const ROOM_CATEGORY_TREE: RoomCategoryGroup[] = [
  {
    id: "living-room",
    name: "Living room",
    icon: "sofa",
    subcategories: [
      { id: "sofa", name: "Sofa", icon: "sofa" },
      { id: "chairs", name: "Chairs", icon: "armchair" },
      { id: "recliner", name: "Recliner", icon: "armchair" },
      { id: "living-rooms", name: "Living Rooms", icon: "sofa" },
      { id: "shoe-rack", name: "Shoe Rack", icon: "grid" },
      { id: "tv-table", name: "TV Table", icon: "tv" },
      { id: "center-table", name: "Center Table", icon: "table" },
      { id: "coffee-corner", name: "Coffee Corner", icon: "coffee" },
      {
        id: "laptop-&-computer-tables",
        name: "Laptop & Computer Tables",
        icon: "laptop",
      },
      { id: "tables", name: "Tables", icon: "table" },
      {
        id: "display-&-book-cases",
        name: "Display & Book Cases",
        icon: "books",
      },
    ],
  },
  {
    id: "bedroom",
    name: "Bed room",
    icon: "bed",
    subcategories: [
      { id: "beds", name: "Beds", icon: "bed" },
      { id: "bedrooms", name: "Bedrooms", icon: "bed" },
      {
        id: "nursery-furniture-&-decor",
        name: "Nursery Furniture & Decor",
        icon: "baby",
      },
      { id: "wardrobe", name: "Wardrobe", icon: "door" },
      {
        id: "commode-&-drawer-units",
        name: "Commode & Drawer Units",
        icon: "box",
      },
      { id: "dressing-table", name: "Dressing Table", icon: "table" },
      { id: "dressing-room", name: "Dressing Room", icon: "hanger" },
      { id: "clothes-hangers", name: "Clothes Hangers", icon: "hanger" },
    ],
  },
  {
    id: "dining-room",
    name: "Dining rooms",
    icon: "table",
    subcategories: [
      { id: "dining-rooms", name: "Dining Rooms", icon: "table" },
      { id: "dining-table", name: "Dining Table", icon: "table" },
      { id: "dining-chairs", name: "Dining Chairs", icon: "armchair" },
      { id: "storage-units", name: "Storage Units", icon: "box" },
    ],
  },
  {
    id: "kitchen-room",
    name: "Kitchen rooms",
    icon: "kitchen",
    subcategories: [
      { id: "kitchen-rooms", name: "Kitchen Rooms", icon: "kitchen" },
    ],
  },
];

export const ALL_FURNITURE_TYPES: (SubCategoryDef & {
  roomId: string;
  roomName: string;
})[] = ROOM_CATEGORY_TREE.flatMap((room) =>
  room.subcategories.map((sub) => ({
    ...sub,
    roomId: room.id,
    roomName: room.name,
  }))
);

const CATEGORY_GROUP_ALIASES: Record<string, string[]> = {
  "living-room": [
    "sofa",
    "chairs",
    "recliner",
    "living-rooms",
    "shoe-rack",
    "tv-table",
    "center-table",
    "coffee-corner",
    "laptop-&-computer-tables",
    "laptop-and-computer-tables",
    "tables",
    "display-&-book-cases",
    "display-and-book-cases",
  ],
  bedroom: [
    "beds",
    "bedrooms",
    "nursery-furniture-&-decor",
    "nursery-furniture-and-decor",
    "wardrobe",
    "commode-&-drawer-units",
    "commode-and-drawer-units",
    "dressing-table",
    "dressing-room",
    "clothes-hangers",
  ],
  "bed-room": [
    "beds",
    "bedrooms",
    "nursery-furniture-&-decor",
    "nursery-furniture-and-decor",
    "wardrobe",
    "commode-&-drawer-units",
    "commode-and-drawer-units",
    "dressing-table",
    "dressing-room",
    "clothes-hangers",
  ],
  "beds-bedroom": [
    "beds",
    "bedrooms",
    "nursery-furniture-&-decor",
    "nursery-furniture-and-decor",
    "wardrobe",
    "commode-&-drawer-units",
    "commode-and-drawer-units",
    "dressing-table",
    "dressing-room",
    "clothes-hangers",
  ],
  "dining-room": [
    "dining-rooms",
    "dining-table",
    "dining-chairs",
    "storage-units",
  ],
  "dining-tables": [
    "dining-rooms",
    "dining-table",
    "dining-chairs",
    "storage-units",
  ],
  "kitchen-room": ["kitchen-rooms"],
  sofas: ["sofa", "living-rooms"],
  "sofas-living": ["sofa", "living-rooms"],
  "living-sets": ["living-rooms", "sofa"],
  living: ["living-rooms", "sofa"],
  armchairs: ["chairs", "recliner"],
  "tables-chairs": [
    "dining-rooms",
    "dining-table",
    "dining-chairs",
    "tables",
    "center-table",
  ],
  wardrobes: ["wardrobe", "dressing-room"],
  "wardrobes-closets": ["wardrobe", "dressing-room"],
  "shoe-cabinets": ["shoe-rack"],
  "shoe-cabinet": ["shoe-rack"],
  "chest-of-drawers": ["commode-&-drawer-units", "commode-and-drawer-units", "dressing-table"],
  commode: ["commode-&-drawer-units", "commode-and-drawer-units"],
  dresser: ["dressing-table", "dressing-room"],
  storage: ["storage-units", "shoe-rack", "commode-&-drawer-units", "display-&-book-cases"],
  "storage-unit": [
    "storage-units",
    "shoe-rack",
    "commode-&-drawer-units",
    "commode-and-drawer-units",
    "display-&-book-cases",
    "display-and-book-cases",
    "wardrobe",
  ],
  desks: ["laptop-&-computer-tables", "laptop-and-computer-tables", "tables"],
  desk: ["laptop-&-computer-tables", "laptop-and-computer-tables", "tables"],
  "side-table": ["tables", "center-table", "coffee-corner"],
  pouf: ["chairs", "recliner", "living-rooms"],
  "eflthr8gfef81tucz28j": ["storage-units", "commode-&-drawer-units", "shoe-rack"],
  "coffee-tables": ["center-table", "tables", "coffee-corner", "tv-table"],
};

export function matchesCategoryFilter(
  product: AuraProduct,
  selectedCategory: string
): boolean {
  if (!selectedCategory || selectedCategory === "ALL") return true;

  const queryRaw = selectedCategory.toLowerCase().trim();
  const querySlug = slugifyCategory(selectedCategory);

  const pCatId = (product.categoryId || "").toLowerCase().trim();
  const pCatName = (product.categoryName || "").toLowerCase().trim();
  const pCatSlug = slugifyCategory(product.categoryName || product.categoryId);

  const pSubId = (product.subCategoryId || "").toLowerCase().trim();
  const pSubName = (product.subCategoryName || "").toLowerCase().trim();
  const pSubSlug = slugifyCategory(
    product.subCategoryName || product.subCategoryId
  );

  if (
    pCatId === queryRaw ||
    pCatName === queryRaw ||
    pCatSlug === querySlug ||
    pCatId === querySlug ||
    (pSubId && (pSubId === queryRaw || pSubId === querySlug)) ||
    (pSubName && (pSubName === queryRaw || pSubSlug === querySlug))
  ) {
    return true;
  }

  const aliases =
    CATEGORY_GROUP_ALIASES[queryRaw] || CATEGORY_GROUP_ALIASES[querySlug];
  if (aliases && aliases.length > 0) {
    const matchedAlias = aliases.some(
      (alias) =>
        pCatId === alias ||
        pCatSlug === alias ||
        pCatName === alias.replace(/-/g, " ") ||
        pSubId === alias ||
        pSubSlug === alias ||
        pSubName === alias.replace(/-/g, " ")
    );
    if (matchedAlias) return true;
  }

  // If the product only has a parent room category (e.g. "living room") and no subCategoryName set in Vondera,
  // also match against the product title when filtering by a specific furniture type (e.g. "sofa")
  if (!pSubName && querySlug) {
    const singularKeyword = querySlug.replace(/s$/, "").replace(/-/g, " ");
    const pTitle = `${product.name || ""} ${product.nameAr || ""}`.toLowerCase();
    if (singularKeyword.length >= 3 && pTitle.includes(singularKeyword)) {
      return true;
    }
  }

  return false;
}
