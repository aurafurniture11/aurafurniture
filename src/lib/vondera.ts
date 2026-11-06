import {
  ApiClient,
  type Category,
  type ProductSummary,
  type ProductListResponse,
  type VariantSetting,
} from "vondera-sdk";

import {
  EGYPT_GOVERNORATES,
  formatEGP,
  getAllProductImages,
  getProductImageUrl,
  matchesCategoryFilter,
  parseSpecsFromDescription,
  slugifyCategory,
} from "@/lib/catalog-utils";

export {
  EGYPT_GOVERNORATES,
  formatEGP,
  getAllProductImages,
  getProductImageUrl,
  matchesCategoryFilter,
  parseSpecsFromDescription,
  slugifyCategory,
};

// Ensure vondera-sdk uses the fast production Vondera API gateway by default
if (!process.env.VONDERA_API_BASE) {
  process.env.VONDERA_API_BASE = "https://production.api.vondera.app/api/public";
}

const API_KEY =
  process.env.VONDERA_API_KEY ||
  "65853fb211b1235b65694c63dfdcf5ae54d81ba432ab254088d199141b9537df";

const ECOMMERCE_API_BASE =
  process.env.VONDERA_ECOMMERCE_API_BASE ||
  "https://production.api.vondera.app/api/ecommerce";

const STORE_DOMAIN = process.env.VONDERA_STORE_DOMAIN || "aurafurniture.co";

export interface AuraProduct extends ProductSummary {
  slug?: string;
  brand?: string;
  categoryId?: string;
  priority?: number;
  variantsCount?: number;
  isDigital?: boolean;
  nameAr?: string;
  sku?: string;
  dimensions?: string;
  labels?: {
    lastPiece?: boolean;
    outOfStock?: boolean;
    onSale?: boolean;
    preOrder?: boolean;
  };
}

export interface AuraProductDetail {
  product: AuraProduct & {
    variantsDetails?: VariantSetting[];
    simillerProducts?: AuraProduct[];
  };
  simillerProducts?: AuraProduct[];
  upsell?: AuraProduct[];
  crossSell?: AuraProduct[];
}

export interface AuraStoreInfo {
  id: string;
  name: string;
  merchantId?: string;
  logo?: string;
  slogan?: string;
  country?: string;
  currency?: string;
  curreny?: string;
  domains?: string[];
  counters?: {
    products?: number;
    orders?: number;
    reviews?: number;
  };
  themeing?: {
    favIcon?: string;
    primaryColor?: string;
    secondaryColor?: string;
    bgColor?: string;
    listCover?: string[];
    listBanners?: string[];
    whatsappButton?: boolean;
    minOrderAmount?: number;
    requireEmail?: boolean;
    askForAddress?: boolean;
    requireCheckoutCaptcha?: boolean;
  };
  social?: {
    phone?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  pixels?: {
    facebookPixel?: string;
    tiktok?: string;
    googleTagManager?: string;
  };
  collecting?: {
    cashEnabled?: boolean;
    cardOptions?: boolean;
    depositOptions?: {
      active?: boolean;
      type?: string;
      value?: number;
    };
  };
  seoData?: {
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
    };
    social?: {
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
    };
  };
}

export interface VonderaZone {
  id: string;
  name: string;
  fees: number;
  enabled: boolean;
  estimatedDeliveryTimeInDays?: number;
}

export interface VonderaSubZone {
  id: string;
  name: string;
}

export type VonderaPaymentMethodType = "CASH" | "GATEWAY" | "DEPOSIT" | "MANUAL";

export interface VonderaPaymentMethod {
  id: string;
  type: VonderaPaymentMethodType;
  name: string;
  description: string;
  icon: string | null;
  isActive: boolean;
  requiredReceipt: boolean;
  gatewayTaxType: string;
  gatewayTaxRate: number;
  depositOptions?: {
    type?: "percent" | "fixed" | "amount";
    value?: number;
  };
}

export interface OrderItemInput {
  id: string;
  name?: string;
  quantity: number;
  price?: number;
  variantId?: string;
  type?: "PRODUCT" | "BUNDLE" | "GROUP_BUNDLE";
}

export interface OrderPriceCalculation {
  itemsPrice: number;
  shippingFees: number;
  discount: number;
  discountCode?: string;
  gatewayFees?: number;
  totalTaxes?: number;
  totalPrice: number;
  amountToPayLater?: number;
  estimatedDeliveryTimeInDays?: number;
  autoApplyPromo?: string | null;
}

export interface CreateOrderInput {
  name: string;
  phone: string;
  otherPhone?: string;
  countryCode?: string;
  email: string;
  address: string;
  cityId: string;
  subZoneId?: string;
  subZoneName?: string;
  courierSubZoneId?: string;
  courierSubZoneName?: string;
  country?: string;
  notes?: string;
  paymentMethod: VonderaPaymentMethodType;
  paymentMethodId?: string;
  receiptImage?: string;
  discountCode?: string;
  pickupMethod?: "SHIPPING" | "PICKUP";
  products: OrderItemInput[];
  turnstileToken?: string;
  sessionId?: string;
  userAgent?: string;
}

const DEFAULT_BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export function buildVonderaEcommerceHeaders(options?: {
  sessionId?: string;
  userAgent?: string;
  language?: string;
  storefrontPath?: string;
}): Record<string, string> {
  const sid =
    options?.sessionId?.trim() ||
    `user-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
  const ua = options?.userAgent?.trim() || DEFAULT_BROWSER_UA;
  const lang = options?.language || "en";
  const path = options?.storefrontPath || "/checkout";

  return {
    "Content-Type": "application/json",
    Client: "FETCH",
    "x-api-key": API_KEY,
    "x-store-domain": STORE_DOMAIN,
    "x-forwarded-host": STORE_DOMAIN,
    "x-country": "EG",
    link: `https://${STORE_DOMAIN}/`,
    "x-storefront-path": path,
    "x-page-url": `https://${STORE_DOMAIN}${path}`,
    "x-user-agent": ua,
    "User-Agent": ua,
    Origin: `https://${STORE_DOMAIN}`,
    Referer: `https://${STORE_DOMAIN}${path}`,
    "x-external-id": sid,
    userId: sid,
    sessionId: sid,
    language: lang,
    "Accept-Language": lang,
    type: "test",
    "x-fbp": "",
    "x-fbc": "",
    "x-fbclid": "",
    "x-ttclid": "",
    "x-gclid": "",
    "x-ttp": "",
  };
}

async function vonderaEcommerceRequest<T = unknown>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT";
    body?: unknown;
    sessionId?: string;
    userAgent?: string;
    extraHeaders?: Record<string, string>;
  } = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${ECOMMERCE_API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = {
    ...buildVonderaEcommerceHeaders({
      sessionId: options.sessionId,
      userAgent: options.userAgent,
    }),
    ...(options.extraHeaders || {}),
  };

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    cache: "no-store",
  });

  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  if (!res.ok || (json && typeof json.status === "number" && json.status >= 400)) {
    const err = new Error(
      (json && typeof json.message === "string" && json.message) ||
        `Vondera API error (${res.status})`
    ) as Error & { status?: number; code?: string; data?: unknown };
    err.status = (json && typeof json.status === "number" ? json.status : res.status) || 500;
    err.code = json && typeof json.code === "string" ? json.code : undefined;
    err.data = json;
    throw err;
  }

  return ((json && "data" in json && json.data !== undefined ? json.data : json) as T);
}

export function createVonderaClient(userId = "aura-storefront-guest") {
  const client = new ApiClient({
    apiKey: API_KEY,
    timeout: 3500,
  });

  client.http.defaults.baseURL =
    process.env.VONDERA_API_BASE ||
    "https://production.api.vondera.app/api/public";

  // Vondera's /store and /orders/price endpoints require a non-empty `userid` header
  client.http.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    if (!config.headers["userid"]) {
      config.headers["userid"] = userId;
    }
    if (!config.headers["x-store-domain"]) {
      config.headers["x-store-domain"] = STORE_DOMAIN;
    }
    if (!config.headers["x-country"]) {
      config.headers["x-country"] = "EG";
    }
    return config;
  });

  return client;
}

export const vonderaClient = createVonderaClient();

const PUBLIC_API_BASE =
  process.env.VONDERA_API_BASE ||
  "https://production.api.vondera.app/api/public";

async function vonderaPublicGet<T = unknown>(endpoint: string): Promise<T | null> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const urls = endpoint.startsWith("http")
    ? [endpoint]
    : [
        `${ECOMMERCE_API_BASE}${cleanEndpoint}`,
        `${PUBLIC_API_BASE}${cleanEndpoint}`,
      ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: buildVonderaEcommerceHeaders({
          storefrontPath: "/",
        }),
        cache: "no-store",
      });

      if (!res.ok) continue;
      const json = (await res.json()) as { status?: number; data?: T } | null;
      if (json && typeof json.status === "number" && json.status >= 400) {
        continue;
      }
      return json && "data" in json ? (json.data ?? null) : (json as T | null);
    } catch {
      continue;
    }
  }

  return null;
}

export async function getStoreInfo(): Promise<AuraStoreInfo | null> {
  try {
    return await vonderaPublicGet<AuraStoreInfo>("/store");
  } catch (err) {
    console.error("Failed to fetch Vondera store info:", err);
    return null;
  }
}

async function getLiveVonderaProducts(): Promise<AuraProduct[]> {
  try {
    const firstPage = await vonderaPublicGet<{
      items?: AuraProduct[];
      totalPages?: number;
      isLastPage?: boolean;
    }>("/products?pageNo=1&limit=100");

    if (!firstPage || !Array.isArray(firstPage.items)) {
      return [];
    }

    const allItems: AuraProduct[] = [...firstPage.items];
    const totalPages = Math.min(Number(firstPage.totalPages || 1), 25);

    if (totalPages > 1 && !firstPage.isLastPage) {
      const pagePromises: Promise<{ items?: AuraProduct[] } | null>[] = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          vonderaPublicGet<{ items?: AuraProduct[] }>(
            `/products?pageNo=${page}&limit=100`
          )
        );
      }
      const otherPages = await Promise.all(pagePromises);
      for (const p of otherPages) {
        if (p && Array.isArray(p.items)) {
          allItems.push(...p.items);
        }
      }
    }

    return allItems;
  } catch (err) {
    console.error("Vondera live products fetch error:", err);
    return [];
  }
}

export async function getMergedCatalogProducts(): Promise<AuraProduct[]> {
  const liveItems = await getLiveVonderaProducts();
  const combined: AuraProduct[] = [];
  const seenIds = new Set<string>();

  for (const raw of liveItems) {
    if (!raw || !raw.id || seenIds.has(raw.id)) continue;
    seenIds.add(raw.id);

    const rawCatName = (raw.categoryName || "").trim();
    const rawSubName = (raw.subCategoryName || "").trim();
    const isGenericVonderaCat =
      !rawCatName ||
      rawCatName.toLowerCase() === "more than just great furniture";

    const normalizedCatName = isGenericVonderaCat
      ? rawSubName || "Furniture"
      : rawCatName;
    const normalizedCatId = slugifyCategory(
      rawSubName || normalizedCatName || raw.categoryId || "furniture"
    );

    combined.push({
      ...raw,
      categoryName: normalizedCatName,
      categoryId: normalizedCatId,
    });
  }

  return combined;
}

export async function getCategories(): Promise<Category[]> {
  const [liveCategories, allProducts] = await Promise.all([
    vonderaPublicGet<Category[]>("/category").catch(() => null),
    getMergedCatalogProducts(),
  ]);

  const catMap = new Map<
    string,
    {
      id: string;
      name: string;
      count: number;
      image?: string;
      subCategories?: Category["subCategories"];
    }
  >();

  if (Array.isArray(liveCategories)) {
    for (const c of liveCategories) {
      if (!c || !c.name) continue;
      const cId = slugifyCategory(c.name || c.id);
      catMap.set(cId, {
        id: cId,
        name: c.name,
        count: 0,
        image: c.image,
        subCategories: c.subCategories || [],
      });
    }
  }

  for (const p of allProducts) {
    const cName = (p.categoryName || "General").trim();
    const cId = slugifyCategory(p.categoryId || cName);
    const existing = catMap.get(cId) || {
      id: cId,
      name: cName,
      count: 0,
      image: undefined,
      subCategories: [],
    };
    existing.count++;
    if (!existing.image) {
      const imgUrl = getProductImageUrl(p);
      if (imgUrl) existing.image = imgUrl;
    }
    catMap.set(cId, existing);
  }

  return Array.from(catMap.values())
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: `${item.name} Collection by Aura Furniture`,
      image: item.image,
      link: `/products?category=${encodeURIComponent(item.id)}`,
      productsCount: item.count,
      subCategories: item.subCategories || [],
    }));
}

export interface ProductQueryOptions {
  pageNo?: number;
  limit?: number;
  categoryId?: string;
  subCategoryId?: string;
  sortBy?: string;
  sortDirication?: "asc" | "desc";
  priceFrom?: number;
  priceTo?: number;
  inStock?: boolean;
  lightweight?: boolean;
}

export async function getProducts(
  options: ProductQueryOptions = {}
): Promise<ProductListResponse & { items: AuraProduct[] }> {
  let combinedItems = await getMergedCatalogProducts();

  // Filter by category using smart alias + slug matching
  if (options.categoryId && options.categoryId !== "ALL") {
    combinedItems = combinedItems.filter((p) =>
      matchesCategoryFilter(p, options.categoryId!)
    );
  }

  // Filter by price
  if (options.priceFrom !== undefined) {
    combinedItems = combinedItems.filter(
      (p) => Number(p.price ?? 0) >= options.priceFrom!
    );
  }
  if (options.priceTo !== undefined) {
    combinedItems = combinedItems.filter(
      (p) => Number(p.price ?? 0) <= options.priceTo!
    );
  }

  // Filter by inStock
  if (options.inStock !== undefined) {
    combinedItems = combinedItems.filter(
      (p) => (p.isAvailable !== false) === options.inStock
    );
  }

  // Sorting
  if (options.sortBy === "price-asc") {
    combinedItems = [...combinedItems].sort(
      (a, b) => Number(a.price ?? 0) - Number(b.price ?? 0)
    );
  } else if (options.sortBy === "price-desc") {
    combinedItems = [...combinedItems].sort(
      (a, b) => Number(b.price ?? 0) - Number(a.price ?? 0)
    );
  }

  // Pagination
  const pageNo = options.pageNo ?? 1;
  const limit = options.limit ?? 50;
  const total = combinedItems.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (pageNo - 1) * limit;
  let pagedItems = combinedItems.slice(startIndex, startIndex + limit);

  // Strip heavy HTML descriptions and duplicate image arrays when projecting for catalog grid
  if (options.lightweight) {
    pagedItems = pagedItems.map((p) => ({
      id: p.id,
      name: p.name,
      nameAr: p.nameAr,
      sku: p.sku,
      slug: p.slug,
      price: p.price,
      crossedPrice: p.crossedPrice,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      subCategoryId: p.subCategoryId,
      subCategoryName: p.subCategoryName,
      isAvailable: p.isAvailable,
      mainImage: p.mainImage,
      labels: p.labels,
    }));
  }

  return {
    items: pagedItems,
    isLastPage: pageNo >= totalPages,
    nextPageNumber: pageNo < totalPages ? pageNo + 1 : null,
    currentPage: pageNo,
    totalPages,
  };
}

export async function getFeaturedProducts(limit = 6): Promise<AuraProduct[]> {
  try {
    const data = await vonderaPublicGet<AuraProduct[]>("/products/featured");
    if (Array.isArray(data) && data.length > 0) {
      return data.slice(0, limit);
    }
  } catch {
    // Fallback to live products
  }

  const fallback = await getProducts({ pageNo: 1, limit });
  return fallback.items;
}

export async function getProductById(
  id: string
): Promise<AuraProductDetail | null> {
  const cleanId = decodeURIComponent(id).trim();

  // 1. Fetch directly from Vondera live API (no-store)
  try {
    const liveDetail = await vonderaPublicGet<AuraProductDetail>(
      `/products/single/${encodeURIComponent(cleanId)}`
    );
    if (liveDetail && liveDetail.product) {
      return liveDetail;
    }
  } catch {
    // Check if id was passed as a product slug
  }

  // 2. If a slug was passed in the URL, resolve it against live Vondera products only
  const liveProducts = await getMergedCatalogProducts();
  const matchedBySlug = liveProducts.find(
    (p) =>
      p.id.toLowerCase() === cleanId.toLowerCase() ||
      (p.slug && p.slug.toLowerCase() === cleanId.toLowerCase())
  );

  if (matchedBySlug) {
    try {
      const liveDetail = await vonderaPublicGet<AuraProductDetail>(
        `/products/single/${encodeURIComponent(matchedBySlug.id)}`
      );
      if (liveDetail && liveDetail.product) {
        return liveDetail;
      }
    } catch {
      // Fall through to build detail from live summary
    }

    const similar = liveProducts
      .filter(
        (p) =>
          p.categoryId === matchedBySlug.categoryId &&
          p.id !== matchedBySlug.id
      )
      .slice(0, 4);

    return {
      product: {
        ...matchedBySlug,
        simillerProducts: similar,
      },
      simillerProducts: similar,
      upsell: [],
    };
  }

  return null;
}

export function normalizePaymentMethods(raw: Record<string, unknown> | null | undefined): VonderaPaymentMethod[] {
  if (!raw || typeof raw !== "object") {
    return [
      {
        id: "CASH",
        type: "CASH",
        name: "Pay by Cash",
        description: "Pay by Cash on delivery",
        icon: null,
        isActive: true,
        requiredReceipt: false,
        gatewayTaxType: "none",
        gatewayTaxRate: 0,
      },
    ];
  }

  const methods: VonderaPaymentMethod[] = [];
  const cash = raw.CASH as Record<string, unknown> | undefined;
  if (cash && cash.isActive !== false) {
    methods.push({
      id: "CASH",
      type: "CASH",
      name: String(cash.name ?? "Pay by Cash"),
      description: String(cash.description ?? "Pay by Cash on delivery"),
      icon: (cash.icon as string) ?? null,
      isActive: cash.isActive !== false,
      requiredReceipt: Boolean(cash.requiredReceipt),
      gatewayTaxType: String(cash.gatewayTaxType ?? "none"),
      gatewayTaxRate: Number(cash.gatewayTaxRate ?? 0),
    });
  }

  const gateway = raw.GATEWAY as Record<string, unknown> | undefined;
  if (gateway && gateway.name && gateway.isActive !== false) {
    methods.push({
      id: "GATEWAY",
      type: "GATEWAY",
      name: String(gateway.name),
      description: String(gateway.description ?? "Pay securely online via Card, ValU, or Wallet"),
      icon: (gateway.icon as string) ?? null,
      isActive: gateway.isActive !== false,
      requiredReceipt: Boolean(gateway.requiredReceipt),
      gatewayTaxType: String(gateway.gatewayTaxType ?? "none"),
      gatewayTaxRate: Number(gateway.gatewayTaxRate ?? 0),
    });
  }

  const deposit = raw.DEPOSIT as Record<string, unknown> | undefined;
  if (deposit && deposit.isActive) {
    methods.push({
      id: "DEPOSIT",
      type: "DEPOSIT",
      name: String(deposit.name ?? "Pay Deposit Online"),
      description: String(deposit.description ?? "Pay partial deposit online and balance on delivery"),
      icon: (deposit.icon as string) ?? null,
      isActive: Boolean(deposit.isActive),
      requiredReceipt: Boolean(deposit.requiredReceipt),
      gatewayTaxType: String(deposit.gatewayTaxType ?? "none"),
      gatewayTaxRate: Number(deposit.gatewayTaxRate ?? 0),
      depositOptions: deposit.options as VonderaPaymentMethod["depositOptions"],
    });
  }

  const manual = raw.MANUAL;
  if (Array.isArray(manual)) {
    for (const item of manual) {
      if (!item || typeof item !== "object") continue;
      const m = item as Record<string, unknown>;
      methods.push({
        id: String(m.id ?? ""),
        type: "MANUAL",
        name: String(m.name ?? "Manual Transfer"),
        description: String(m.description ?? ""),
        icon: (m.icon as string) ?? null,
        isActive: true,
        requiredReceipt: Boolean(m.requiredReceipt),
        gatewayTaxType: String(m.gatewayTaxType ?? "none"),
        gatewayTaxRate: Number(m.gatewayTaxRate ?? 0),
      });
    }
  }

  if (methods.length === 0) {
    methods.push({
      id: "CASH",
      type: "CASH",
      name: "Pay by Cash",
      description: "Pay by Cash on delivery",
      icon: null,
      isActive: true,
      requiredReceipt: false,
      gatewayTaxType: "none",
      gatewayTaxRate: 0,
    });
  }

  return methods;
}

export async function getCheckoutConfig(sessionId?: string): Promise<{
  zones: VonderaZone[];
  paymentMethods: VonderaPaymentMethod[];
  requireCheckoutCaptcha: boolean;
  collecting?: AuraStoreInfo["collecting"];
}> {
  const [zonesRaw, paymentMethodsRaw, storeInfo] = await Promise.all([
    vonderaEcommerceRequest<VonderaZone[]>("/store/zones", { sessionId }).catch(() => []),
    vonderaEcommerceRequest<Record<string, unknown>>("/orders/payment-methods?shippingCountry=EG", {
      sessionId,
    }).catch(() => null),
    vonderaEcommerceRequest<AuraStoreInfo>("/store", { sessionId }).catch(() => null),
  ]);

  const zones = Array.isArray(zonesRaw)
    ? zonesRaw.filter((z) => z.enabled !== false)
    : [];

  return {
    zones,
    paymentMethods: normalizePaymentMethods(paymentMethodsRaw),
    requireCheckoutCaptcha: storeInfo?.themeing?.requireCheckoutCaptcha ?? true,
    collecting: storeInfo?.collecting,
  };
}

export async function getSubZones(cityId: string, sessionId?: string): Promise<VonderaSubZone[]> {
  if (!cityId.trim()) return [];
  try {
    const data = await vonderaEcommerceRequest<VonderaSubZone[]>(
      `/store/subzones?cityId=${encodeURIComponent(cityId.trim())}`,
      { sessionId }
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function formatProductsForVonderaOrder(products: OrderItemInput[]) {
  return products
    .filter((p) => Number(p.quantity) > 0)
    .map((p) => ({
      id: String(p.id),
      name: p.name || "Furniture Item",
      quantity: Number(p.quantity) || 1,
      price: Number(p.price) || 0,
      ...(p.variantId ? { variantId: String(p.variantId) } : {}),
      type: p.type || "PRODUCT",
    }));
}

export async function initCheckoutSession(payload: {
  cityId?: string;
  discountCode?: string;
  products: OrderItemInput[];
  pickupMethod?: "SHIPPING" | "PICKUP";
  sessionId?: string;
  userAgent?: string;
}) {
  const formattedProducts = formatProductsForVonderaOrder(payload.products);
  try {
    return await vonderaEcommerceRequest<{
      message?: string;
      requireCheckoutCaptcha?: boolean;
    }>("/orders/init-checkout", {
      method: "POST",
      sessionId: payload.sessionId,
      userAgent: payload.userAgent,
      body: {
        cityId: payload.cityId || "",
        discountCode: payload.discountCode || "",
        products: formattedProducts,
        pickupMethod: payload.pickupMethod || "SHIPPING",
      },
    });
  } catch {
    return {
      message: "Checkout session ready",
      requireCheckoutCaptcha: false,
    };
  }
}

export async function calculateOrderPrice(payload: {
  cityId: string;
  discountCode?: string;
  products: OrderItemInput[];
  paymentMethod?: VonderaPaymentMethodType;
  paymentMethodId?: string;
  subZoneId?: string;
  sessionId?: string;
}): Promise<OrderPriceCalculation> {
  const formattedProducts = formatProductsForVonderaOrder(payload.products);
  const gatewayType = payload.paymentMethod || "CASH";

  try {
    return await vonderaEcommerceRequest<OrderPriceCalculation>("/orders/price", {
      method: "POST",
      sessionId: payload.sessionId,
      body: {
        cityId: payload.cityId || "",
        discountCode: payload.discountCode || "",
        products: formattedProducts,
        pickupMethod: "SHIPPING",
        gatewayType,
        ...(gatewayType === "MANUAL" && payload.paymentMethodId
          ? { gatewayId: payload.paymentMethodId }
          : {}),
        ...(payload.subZoneId ? { subZoneId: payload.subZoneId } : {}),
      },
    });
  } catch (err: unknown) {
    const errorObj = err as { status?: number; message?: string };
    if (
      errorObj?.status === 404 ||
      errorObj?.message?.toLowerCase().includes("product not found")
    ) {
      const subTotal = payload.products.reduce(
        (acc, p) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 1),
        0
      );
      const shipping = 150;
      return {
        itemsPrice: subTotal,
        shippingFees: shipping,
        discount: 0,
        discountCode: payload.discountCode || "",
        gatewayFees: 0,
        totalTaxes: 0,
        totalPrice: subTotal + shipping,
        estimatedDeliveryTimeInDays: 3,
        autoApplyPromo: null,
      };
    }
    throw err;
  }
}

export async function validateDiscountCode(payload: {
  code: string;
  cityId: string;
  products: OrderItemInput[];
  paymentMethod?: VonderaPaymentMethodType;
  paymentMethodId?: string;
  sessionId?: string;
}) {
  const formattedProducts = formatProductsForVonderaOrder(payload.products);
  const gatewayType =
    payload.paymentMethod === "MANUAL" && payload.paymentMethodId
      ? `MANUAL:${payload.paymentMethodId}`
      : payload.paymentMethod || "CASH";

  return await vonderaEcommerceRequest<{
    valid?: boolean;
    value?: number;
    message?: string;
    discount?: { value?: number; type?: string };
  }>("/orders/discount/validate", {
    method: "POST",
    sessionId: payload.sessionId,
    body: {
      code: payload.code.trim(),
      products: formattedProducts,
      cityId: payload.cityId || "",
      pickupMethod: "SHIPPING",
      gatewayType,
    },
  });
}

export function normalizeEgyptianPhone(phone: string): string {
  const digits = (phone || "").replace(/[^0-9]/g, "");
  if (digits.startsWith("201") && digits.length === 12) {
    return digits.slice(2); // e.g. 1012345678
  }
  if (digits.startsWith("01") && digits.length === 11) {
    return digits.slice(1); // e.g. 1012345678 (national significant number)
  }
  return digits;
}

export async function submitOrder(payload: CreateOrderInput) {
  const formattedProducts = formatProductsForVonderaOrder(payload.products);
  const sessionId =
    payload.sessionId ||
    `user-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;

  // 1. Ensure checkout session is initialized for this sessionId
  await initCheckoutSession({
    cityId: payload.cityId,
    discountCode: payload.discountCode || "",
    products: payload.products,
    pickupMethod: payload.pickupMethod || "SHIPPING",
    sessionId,
    userAgent: payload.userAgent,
  }).catch(() => null);

  const subZonePrefix = (payload.courierSubZoneName || payload.subZoneName || "").trim();
  const formattedAddress = subZonePrefix
    ? `${subZonePrefix} - ${payload.address.trim()}`
    : payload.address.trim();

  const paymentMethod = payload.paymentMethod || "CASH";

  // 2. Build exact Vondera `/api/ecommerce/orders` payload matching `16813` (`buildOrderData`)
  const orderBody: Record<string, unknown> = {
    name: payload.name.trim(),
    phone: normalizeEgyptianPhone(payload.phone),
    otherPhone: payload.otherPhone ? normalizeEgyptianPhone(payload.otherPhone) : "",
    countryCode: payload.countryCode || "+20",
    email: payload.email.trim() || "customer@aurafurniture.co",
    address: formattedAddress,
    cityId: payload.cityId,
    country: "",
    notes: payload.notes || "",
    paymentMethod,
    discountCode: payload.discountCode || "",
    products: formattedProducts,
    pickupMethod: payload.pickupMethod || "SHIPPING",
    gatewayType: paymentMethod,
    ...(paymentMethod === "MANUAL" && payload.paymentMethodId
      ? {
          gatewayId: payload.paymentMethodId,
          manualPaymentMethodId: payload.paymentMethodId,
        }
      : {}),
    ...(paymentMethod === "MANUAL" && payload.receiptImage
      ? { receiptImage: payload.receiptImage }
      : {}),
    ...(payload.courierSubZoneId ? { courierSubZoneId: payload.courierSubZoneId } : {}),
    ...(payload.subZoneId ? { subZoneId: payload.subZoneId } : {}),
    ...(payload.subZoneName ? { subZoneName: payload.subZoneName } : {}),
    ...(payload.turnstileToken ? { turnstileToken: payload.turnstileToken } : {}),
  };

  const data = await vonderaEcommerceRequest<{
    id?: string;
    link?: string;
    storeId?: string;
    message?: string;
  }>("/orders", {
    method: "POST",
    sessionId,
    userAgent: payload.userAgent,
    extraHeaders: {
      "x-vondera-rtc-status": "none",
    },
    body: orderBody,
  });

  return { status: 200, data };
}
