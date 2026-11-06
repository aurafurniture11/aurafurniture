"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Ruler,
  Plus,
  Minus,
  Zap,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import type { AuraProduct } from "@/lib/vondera";
import {
  formatEGP,
  getAllProductImages,
  parseSpecsFromDescription,
} from "@/lib/catalog-utils";
import { ProductCard } from "@/components/ProductCard";

interface ProductDetailClientProps {
  product: AuraProduct;
  similarProducts: AuraProduct[];
}

export function ProductDetailClient({
  product,
  similarProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { locale, addToCart, toggleWishlist, isWished, trackEvent } = useStore();
  const isAr = locale === "ar";
  const displayName = isAr && product.nameAr ? product.nameAr : product.name;
  const Chevron = isAr ? ChevronLeft : ChevronRight;

  const images = getAllProductImages(product);
  const [activeImage, setActiveImage] = useState<string>(images[0] || "");
  const [quantity, setQuantity] = useState(1);

  const price = Number(product.price ?? 0);
  const crossedPrice = Number(product.crossedPrice ?? 0);
  const hasDiscount = crossedPrice > price && price > 0;
  const wished = isWished(product.id);
  const inStock = product.isAvailable !== false;

  const { specs, cleanText } = parseSpecsFromDescription(product.description);

  useEffect(() => {
    trackEvent("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: price,
      currency: "EGP",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const handleBuyNow = () => {
    addToCart(product, quantity, undefined, undefined, false);
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-900 transition-colors">
          {isAr ? "الرئيسية" : "Home"}
        </Link>
        <Chevron className="w-3.5 h-3.5" />
        <Link href="/#catalog" className="hover:text-stone-900 transition-colors">
          {product.categoryName || (isAr ? "المنتجات" : "Catalog")}
        </Link>
        <Chevron className="w-3.5 h-3.5" />
        <span className="text-stone-900 font-semibold truncate max-w-xs">
          {displayName}
        </span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-sm">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.name || "Aura Furniture"}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                Aura Furniture
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                    activeImage === imgUrl
                      ? "border-amber-500 ring-2 ring-amber-500/30"
                      : "border-stone-200 opacity-75 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.name} - ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:col-span-6 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {product.categoryName && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-900 text-xs font-bold">
                  {product.categoryName}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {inStock
                  ? isAr
                    ? "متوفر في المخزون"
                    : "In Stock & Ready"
                  : isAr
                  ? "غير متوفر"
                  : "Out of Stock"}
              </span>
            </div>

            <h1
              dir="auto"
              className="font-arabic text-2xl sm:text-3xl font-semibold text-stone-950 leading-[1.5]"
            >
              {displayName}
            </h1>

            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-arabic text-2xl sm:text-3xl font-semibold text-stone-950">
                {formatEGP(price, locale)}
              </span>
              {hasDiscount && (
                <span className="font-arabic text-lg text-stone-400 line-through">
                  {formatEGP(crossedPrice, locale)}
                </span>
              )}
              <span className="font-arabic text-xs text-stone-500">
                {isAr ? "(شامل الضريبة)" : "(VAT Included)"}
              </span>
            </div>
          </div>

          {/* Specifications Table parsed from Vondera HTML description */}
          {specs.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Ruler className="w-4 h-4 text-amber-600" />
                <span>
                  {isAr
                    ? "المواصفات والأبعاد التفصيلية"
                    : "Dimensions & Specifications"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {specs.map((spec, idx) => (
                  <div
                    key={idx}
                    dir="auto"
                    className="font-arabic flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs sm:text-sm"
                  >
                    <span className="text-stone-500 font-normal">
                      {spec.label}
                    </span>
                    <span className="text-stone-900 font-medium">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cleanText && (
            <p className="text-sm text-stone-600 leading-relaxed pt-2">
              {cleanText}
            </p>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-stone-800">
                {isAr ? "الكمية المطلوبة" : "Quantity"}
              </span>
              <div className="inline-flex items-center rounded-xl border border-stone-200 bg-stone-50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-stone-600 hover:text-stone-950 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 text-sm font-bold text-stone-950">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2.5 text-stone-600 hover:text-stone-950 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={!inStock}
                onClick={() => addToCart(product, quantity)}
                className="flex-1 py-4 px-6 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>{isAr ? "أضف إلى السلة" : "Add to Shopping Bag"}</span>
              </button>

              <button
                type="button"
                disabled={!inStock}
                onClick={handleBuyNow}
                className="flex-1 py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{isAr ? "اشترِ الآن (الدفع عند الاستلام)" : "Buy Now (COD)"}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`p-4 rounded-2xl border transition-colors cursor-pointer flex items-center justify-center ${
                  wished
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                }`}
                title={isAr ? "المفضلة" : "Wishlist"}
              >
                <Heart className={`w-5 h-5 ${wished ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Delivery & Guarantee Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-stone-100 text-xs text-stone-600">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50">
              <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900">
                  {isAr ? "توصيل لجميع المحافظات" : "Nationwide Delivery"}
                </p>
                <p>
                  {isAr
                    ? "تغليف آمن ومقوى لحماية الأخشاب أثناء الشحن"
                    : "Reinforced protective packaging for safe transit"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900">
                  {isAr ? "معاينة عند الاستلام" : "Inspect Upon Delivery"}
                </p>
                <p>
                  {isAr
                    ? "ادفع نقداً عند استلام طلبك والتأكد من الجودة"
                    : "Pay cash on delivery with full quality assurance"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-stone-200">
          <h2 className="text-2xl font-extrabold text-stone-900">
            {isAr ? "منتجات مشابهة قد تعجبك" : "Similar Furniture Pieces"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProducts.slice(0, 3).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
