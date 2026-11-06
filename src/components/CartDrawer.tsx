"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { formatEGP } from "@/lib/catalog-utils";

export function CartDrawer() {
  const {
    locale,
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
  } = useStore();

  if (!isCartOpen) return null;

  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 end-0 max-w-full flex ps-10">
        <div className="w-screen max-w-md bg-white text-stone-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold">
                {isAr ? "سلة التسوق" : "Your Shopping Bag"}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 font-semibold">
                {cart.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-base font-semibold text-stone-800 mb-1">
                  {isAr ? "سلة التسوق فارغة" : "Your cart is currently empty"}
                </p>
                <p className="text-sm text-stone-500 mb-6 max-w-xs">
                  {isAr
                    ? "استكشف تشكيلة أورا للأثاث العصري وأضف قطعك المفضلة إلى السلة."
                    : "Explore Aura Furniture's modern collection and add your favorite pieces."}
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  {isAr ? "تصفح المنتجات" : "Browse Collection"}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.id}-${item.variantId || "default"}`}
                  className="flex gap-4 p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60"
                >
                  <Link
                    href={`/product/${item.id}`}
                    onClick={() => setIsCartOpen(false)}
                    className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-stone-200 shrink-0"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                        Aura
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/product/${item.id}`}
                        onClick={() => setIsCartOpen(false)}
                        dir="auto"
                        className="font-arabic block text-sm font-medium text-stone-900 hover:text-amber-700 line-clamp-2 leading-relaxed"
                      >
                        {item.name}
                      </Link>
                      {item.variantLabel && (
                        <p className="text-xs text-stone-500 mt-0.5">
                          {item.variantLabel}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-bold text-stone-900">
                        {formatEGP(item.price * item.quantity, locale)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <div className="inline-flex items-center rounded-lg border border-stone-200 bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                                item.variantId
                              )
                            }
                            className="p-1.5 text-stone-600 hover:text-stone-950 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.variantId
                              )
                            }
                            className="p-1.5 text-stone-600 hover:text-stone-950 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id, item.variantId)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title={isAr ? "حذف" : "Remove"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm text-stone-600">
                  <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span className="font-bold text-base text-stone-950">
                    {formatEGP(cartSubtotal, locale)}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  {isAr
                    ? "يتم حساب مصاريف الشحن وأكواد الخصم في خطوة إتمام الطلب."
                    : "Shipping fees and promo codes are calculated at checkout."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>
                    {isAr ? "إتمام الطلب الآن" : "Proceed to Checkout"}
                  </span>
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
