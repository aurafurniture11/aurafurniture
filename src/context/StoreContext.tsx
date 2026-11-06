"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuraProduct } from "@/lib/vondera";
import { getProductImageUrl } from "@/lib/catalog-utils";

export interface LocalCartItem {
  id: string;
  name: string;
  price: number;
  crossedPrice?: number;
  image: string;
  categoryName?: string;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
}

interface StoreContextValue {
  locale: "ar" | "en";
  setLocale: (locale: "ar" | "en") => void;
  cart: LocalCartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: AuraProduct,
    quantity?: number,
    variantId?: string,
    variantLabel?: string,
    openDrawer?: boolean
  ) => void;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  removeFromCart: (id: string, variantId?: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotalCount: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWished: (productId: string) => boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onlyWishlist: boolean;
  setOnlyWishlist: (val: boolean | ((prev: boolean) => boolean)) => void;
  selectCategoryAndScroll: (catId: string) => void;
  trackEvent: (event: string, data?: Record<string, unknown>) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_STORAGE_KEY = "aura_furniture_cart_v1";
const WISHLIST_STORAGE_KEY = "aura_furniture_wishlist_v1";
const LOCALE_STORAGE_KEY = "aura_furniture_locale_v2";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<"ar" | "en">("en");
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQueryState] = useState("");
  const [selectedCategory, setSelectedCategoryState] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [onlyWishlist, setOnlyWishlist] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);

  const setSearchQuery = (q: string) => {
    setSearchQueryState(q);
    setCurrentPage(1);
  };

  const setSelectedCategory = (catId: string) => {
    setSelectedCategoryState(catId || "ALL");
    setOnlyWishlist(false);
    setCurrentPage(1);
  };

  const selectCategoryAndScroll = (catId: string) => {
    setSelectedCategoryState(catId || "ALL");
    setOnlyWishlist(false);
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      const el = document.getElementById("catalog");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = `/?category=${encodeURIComponent(catId || "ALL")}#catalog`;
      }
    }
  };

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWish = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWish) setWishlist(JSON.parse(savedWish));

      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (savedLocale === "ar" || savedLocale === "en") {
        setLocaleState(savedLocale);
      }
    } catch {
      // Ignore storage errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Ignore
    }
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = "ltr";
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore
    }
  }, [locale, hydrated]);

  const setLocale = (next: "ar" | "en") => {
    setLocaleState(next);
  };

  const trackEvent = (event: string, data?: Record<string, unknown>) => {
    if (typeof window !== "undefined") {
      const w = window as unknown as { fbq?: (...args: unknown[]) => void };
      if (typeof w.fbq === "function") {
        w.fbq("track", event, data);
      }
    }
  };

  const addToCart = (
    product: AuraProduct,
    quantity = 1,
    variantId?: string,
    variantLabel?: string,
    openDrawer = true
  ) => {
    const price = Number(product.price ?? 0);
    const image = getProductImageUrl(product);

    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.id === product.id && item.variantId === variantId
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name || "قطعة أثاث",
          price,
          crossedPrice: product.crossedPrice,
          image,
          categoryName: product.categoryName,
          quantity,
          variantId,
          variantLabel,
        },
      ];
    });

    trackEvent("AddToCart", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: price * quantity,
      currency: "EGP",
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (id: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (id: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.id === id && item.variantId === variantId)
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isWished = (productId: string) => wishlist.includes(productId);

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        locale,
        setLocale,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartTotalCount,
        wishlist,
        toggleWishlist,
        isWished,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        currentPage,
        setCurrentPage,
        onlyWishlist,
        setOnlyWishlist,
        selectCategoryAndScroll,
        trackEvent,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
