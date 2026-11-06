"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Truck,
  Banknote,
  CreditCard,
  Wallet,
  Tag,
  AlertCircle,
  Loader2,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
  Upload,
  X,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { EGYPT_GOVERNORATES, formatEGP } from "@/lib/catalog-utils";
import type {
  OrderPriceCalculation,
  VonderaZone,
  VonderaSubZone,
  VonderaPaymentMethod,
  VonderaPaymentMethodType,
} from "@/lib/vondera";

const TURNSTILE_ORIGIN = "https://challenges.vondera.io";

export default function CheckoutPage() {
  const { locale, cart, cartSubtotal, clearCart, trackEvent } = useStore();
  const isAr = locale === "ar";

  // Persistent Vondera guest session ID
  const [sessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("localUserId");
      if (saved && saved.startsWith("user-")) return saved;
      const generated = `user-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .substring(2, 10)}`;
      window.localStorage.setItem("localUserId", generated);
      return generated;
    }
    return `user-${Date.now().toString(36)}-guest`;
  });

  // Dynamic Vondera checkout config
  const [zones, setZones] = useState<VonderaZone[]>(
    EGYPT_GOVERNORATES.map((g) => ({
      id: g.value,
      name: isAr ? g.labelAr : g.labelEn,
      fees: 0,
      enabled: true,
    }))
  );
  const [subZones, setSubZones] = useState<VonderaSubZone[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<VonderaPaymentMethod[]>([
    {
      id: "CASH",
      type: "CASH",
      name: isAr ? "الدفع نقداً عند الاستلام" : "Pay by Cash on Delivery",
      description: isAr
        ? "ادفع نقداً عند استلام ومعاينة الأثاث"
        : "Pay in cash upon receiving and inspecting your furniture",
      icon: null,
      isActive: true,
      requiredReceipt: false,
      gatewayTaxType: "none",
      gatewayTaxRate: 0,
    },
  ]);
  const [requireCaptcha, setRequireCaptcha] = useState<boolean>(true);
  const [configLoading, setConfigLoading] = useState<boolean>(true);

  // Customer form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cityId, setCityId] = useState("360631"); // Default Cairo zone ID in Vondera
  const [subZoneId, setSubZoneId] = useState("");
  const [subZoneName, setSubZoneName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Payment method state
  const [paymentMethod, setPaymentMethod] =
    useState<VonderaPaymentMethodType>("CASH");
  const [paymentMethodId, setPaymentMethodId] = useState<string | undefined>(
    undefined
  );
  const [receiptImage, setReceiptImage] = useState<string>("");

  // Discount state
  const [discountInput, setDiscountInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoStatus, setPromoStatus] = useState<{
    valid?: boolean;
    message?: string;
    loading?: boolean;
  } | null>(null);

  // Turnstile bot check state
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [showTurnstileModal, setShowTurnstileModal] = useState<boolean>(false);
  const turnstileResolverRef = useRef<((token: string | null) => void) | null>(
    null
  );

  // Price & submission state
  const [priceCalc, setPriceCalc] = useState<OrderPriceCalculation | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{
    id: string;
    total: number;
    customerName: string;
    cityName: string;
    paymentMethodLabel: string;
  } | null>(null);

  const selectedZone = zones.find((z) => z.id === cityId);
  const selectedCityName =
    selectedZone?.name || (cityId === "361059" ? "Alexandria" : "Cairo");

  const activeMethodConfig = paymentMethods.find((m) =>
    m.type === "MANUAL"
      ? m.id === paymentMethodId
      : m.type === paymentMethod
  );

  const buildOrderProductsPayload = useCallback(() => {
    return cart.map((item) => ({
      id: String(item.id),
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      ...(item.variantId ? { variantId: item.variantId } : {}),
      type: "PRODUCT" as const,
    }));
  }, [cart]);

  // 1. Load live zones & payment methods from Vondera `/api/ecommerce`
  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      setConfigLoading(true);
      try {
        const res = await fetch(
          `/api/checkout/config?sessionId=${encodeURIComponent(sessionId)}`
        );
        const json = await res.json();
        if (!cancelled && res.ok && json.data) {
          if (Array.isArray(json.data.zones) && json.data.zones.length > 0) {
            setZones(json.data.zones);
            const hasDefault = json.data.zones.some(
              (z: VonderaZone) => z.id === "360631"
            );
            setCityId(hasDefault ? "360631" : json.data.zones[0].id);
          }
          if (
            Array.isArray(json.data.paymentMethods) &&
            json.data.paymentMethods.length > 0
          ) {
            setPaymentMethods(json.data.paymentMethods);
            const first = json.data.paymentMethods[0] as VonderaPaymentMethod;
            setPaymentMethod(first.type);
            setPaymentMethodId(first.type === "MANUAL" ? first.id : undefined);
          }
          if (typeof json.data.requireCheckoutCaptcha === "boolean") {
            setRequireCaptcha(json.data.requireCheckoutCaptcha);
          }
        }
      } catch {
        // Keep fallback config
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    }
    loadConfig();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // 2. Load sub-zones when cityId changes
  useEffect(() => {
    if (!cityId) return;
    let cancelled = false;
    setSubZones([]);
    setSubZoneId("");
    setSubZoneName("");

    fetch(
      `/api/checkout/config?cityId=${encodeURIComponent(
        cityId
      )}&sessionId=${encodeURIComponent(sessionId)}`
    )
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && Array.isArray(json?.data)) {
          setSubZones(json.data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [cityId, sessionId]);

  // 3. Initialize Vondera checkout session & fire Meta Pixel InitiateCheckout
  useEffect(() => {
    if (cart.length === 0) return;

    trackEvent("InitiateCheckout", {
      content_ids: cart.map((i) => i.id),
      value: cartSubtotal,
      currency: "EGP",
    });

    fetch("/api/checkout/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cityId,
        discountCode: appliedPromo,
        products: buildOrderProductsPayload(),
        pickupMethod: "SHIPPING",
        sessionId,
      }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  // 4. Listen for Vondera Turnstile iframe messages from https://challenges.vondera.io
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (new URL(event.origin).origin !== TURNSTILE_ORIGIN) return;
      } catch {
        return;
      }
      const data = event.data;
      if (data && data.type === "VONDERA_TURNSTILE") {
        if (typeof data.token === "string" && data.token.trim()) {
          const token = data.token.trim();
          setTurnstileToken(token);
          setShowTurnstileModal(false);
          if (turnstileResolverRef.current) {
            turnstileResolverRef.current(token);
            turnstileResolverRef.current = null;
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // 5. Recalculate live Vondera order price when cart, cityId, paymentMethod, or promo changes
  useEffect(() => {
    if (cart.length === 0) {
      setPriceCalc(null);
      return;
    }

    let cancelled = false;
    async function fetchCalc() {
      setCalculating(true);
      try {
        const res = await fetch("/api/order/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cityId,
            discountCode: appliedPromo,
            paymentMethod,
            paymentMethodId,
            subZoneId: subZoneId || undefined,
            sessionId,
            products: buildOrderProductsPayload(),
          }),
        });
        const json = await res.json();
        if (!cancelled && res.ok && json.data) {
          setPriceCalc(json.data);
        }
      } catch {
        // Fallback to local calculation if offline
      } finally {
        if (!cancelled) setCalculating(false);
      }
    }

    fetchCalc();
    return () => {
      cancelled = true;
    };
  }, [
    cart,
    cityId,
    appliedPromo,
    paymentMethod,
    paymentMethodId,
    subZoneId,
    sessionId,
    buildOrderProductsPayload,
  ]);

  const handleApplyPromo = async () => {
    const code = discountInput.trim();
    if (!code) {
      setAppliedPromo("");
      setPromoStatus(null);
      return;
    }

    setPromoStatus({ loading: true });
    try {
      const res = await fetch("/api/checkout/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          cityId,
          paymentMethod,
          paymentMethodId,
          sessionId,
          products: buildOrderProductsPayload(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.data?.valid) {
        setAppliedPromo(code);
        setPromoStatus({
          valid: true,
          message:
            json.data.message ||
            (isAr ? "تم تطبيق كود الخصم بنجاح!" : "Promo code applied!"),
        });
      } else {
        setAppliedPromo("");
        setPromoStatus({
          valid: false,
          message:
            json.data?.message ||
            json.error ||
            (isAr ? "كود الخصم غير صالح أو منتهي" : "Invalid or expired promo code"),
        });
      }
    } catch {
      setPromoStatus({
        valid: false,
        message: isAr
          ? "تعذر التحقق من كود الخصم"
          : "Could not verify discount code",
      });
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setReceiptImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const requestTurnstileVerification = (): Promise<string | null> => {
    if (turnstileToken) return Promise.resolve(turnstileToken);
    setShowTurnstileModal(true);
    return new Promise((resolve) => {
      turnstileResolverRef.current = resolve;
    });
  };

  const shippingFees = priceCalc?.shippingFees ?? selectedZone?.fees ?? 0;
  const discount = priceCalc?.discount ?? 0;
  const gatewayFees = priceCalc?.gatewayFees ?? 0;
  const totalTaxes = priceCalc?.totalTaxes ?? 0;
  const finalTotal =
    priceCalc?.totalPrice ??
    cartSubtotal + shippingFees + gatewayFees + totalTaxes - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg(
        isAr
          ? "يرجى إدخال الاسم بالكامل ورقم الموبايل والعنوان بالتفصيل."
          : "Please enter your full name, mobile number, and detailed street address."
      );
      return;
    }

    const cleanDigits = phone.replace(/[^0-9]/g, "");
    if (cleanDigits.length < 10) {
      setErrorMsg(
        isAr
          ? "يرجى إدخال رقم موبايل مصري صحيح (مثال: 01012345678)."
          : "Please enter a valid Egyptian mobile number (e.g. 01012345678)."
      );
      return;
    }

    if (activeMethodConfig?.requiredReceipt && !receiptImage) {
      setErrorMsg(
        isAr
          ? "يرجى إرفاق صورة إيصال التحويل لإتمام الطلب."
          : "Please upload your payment receipt screenshot to complete the order."
      );
      return;
    }

    setSubmitting(true);
    try {
      let tokenToUse = turnstileToken;
      if (requireCaptcha && !tokenToUse) {
        const solved = await requestTurnstileVerification();
        if (!solved) {
          setSubmitting(false);
          return;
        }
        tokenToUse = solved;
      }

      const submitOrderRequest = async (token?: string) => {
        const res = await fetch("/api/order/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            otherPhone: otherPhone.trim(),
            countryCode: "+20",
            email: email.trim() || "customer@aurafurniture.co",
            cityId,
            subZoneId: subZoneId || undefined,
            subZoneName: subZoneName || undefined,
            address: address.trim(),
            notes: notes.trim(),
            paymentMethod,
            paymentMethodId,
            receiptImage: receiptImage || undefined,
            discountCode: appliedPromo,
            turnstileToken: token || undefined,
            sessionId,
            products: buildOrderProductsPayload(),
          }),
        });
        return { res, json: await res.json() };
      };

      let { res, json } = await submitOrderRequest(tokenToUse);

      // If Vondera requests a fresh Turnstile token, open the challenge modal once and retry
      if (
        !res.ok &&
        (json?.code === "TURNSTILE_REQUIRED" || json?.code === "TURNSTILE_FAILED")
      ) {
        setTurnstileToken("");
        const freshToken = await requestTurnstileVerification();
        if (!freshToken) {
          setSubmitting(false);
          return;
        }
        ({ res, json } = await submitOrderRequest(freshToken));
      }

      if (!res.ok) {
        throw new Error(
          json.error ||
            (isAr
              ? "تعذر تسجيل الطلب، يرجى التأكد من البيانات والمحاولة مرة أخرى."
              : "Could not submit order. Please verify your details and try again.")
        );
      }

      const responseData = json?.data || json;

      // If Vondera returns an online payment gateway link (for GATEWAY or DEPOSIT), redirect!
      if (typeof responseData?.link === "string" && responseData.link.startsWith("http")) {
        window.location.assign(responseData.link);
        return;
      }

      const orderId =
        responseData?.id ||
        responseData?.order?.id ||
        `AURA-${Date.now().toString().slice(-6)}`;

      trackEvent("Purchase", {
        content_ids: cart.map((i) => i.id),
        value: finalTotal,
        currency: "EGP",
      });

      setCompletedOrder({
        id: String(orderId),
        total: finalTotal,
        customerName: name.trim(),
        cityName: selectedCityName,
        paymentMethodLabel:
          activeMethodConfig?.name ||
          (paymentMethod === "CASH"
            ? isAr
              ? "الدفع عند الاستلام (COD)"
              : "Cash on Delivery (COD)"
            : paymentMethod),
      });
      clearCart();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit order";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const turnstileIframeUrl =
    typeof window !== "undefined"
      ? `${TURNSTILE_ORIGIN}/bot-check?parentOrigin=${encodeURIComponent(
          window.location.origin
        )}&lang=${isAr ? "ar" : "en"}&action=checkout`
      : "";

  if (completedOrder) {
    return (
      <div className="min-h-[80vh] bg-white flex items-center justify-center px-6 py-24">
        <div className="max-w-xl w-full border border-neutral-200 p-10 md:p-14 text-center space-y-8">
          <div className="w-16 h-16 bg-neutral-950 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-400">
              AURA FURNITURE — ORDER CONFIRMED
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-light uppercase tracking-[0.06em] text-neutral-950">
              {isAr ? "تم تسجيل طلبك بنجاح" : "Thank You For Your Order"}
            </h1>
            <p className="text-neutral-500 text-sm leading-relaxed">
              {isAr
                ? `شكراً لك يا ${completedOrder.customerName}. تم تسجيل طلبك رسمياً في نظام أورا للأثاث وسيتم التواصل معك قريباً لتأكيد موعد التوصيل إلى ${completedOrder.cityName}.`
                : `Thank you, ${completedOrder.customerName}. Your order has been registered in Aura Furniture's system and our concierge team will contact you shortly to arrange delivery to ${completedOrder.cityName}.`}
            </p>
          </div>

          <div className="border-t border-b border-neutral-200 py-6 space-y-3 text-xs uppercase tracking-[0.15em]">
            <div className="flex justify-between">
              <span className="text-neutral-400">
                {isAr ? "رقم الطلب" : "Order Reference"}
              </span>
              <span className="font-mono font-semibold text-neutral-950">
                #{completedOrder.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">
                {isAr ? "منطقة التوصيل" : "Delivery Zone"}
              </span>
              <span className="font-medium text-neutral-950">
                {completedOrder.cityName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">
                {isAr ? "طريقة الدفع" : "Payment Method"}
              </span>
              <span className="font-medium text-neutral-950">
                {completedOrder.paymentMethodLabel}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-neutral-100 text-sm">
              <span className="font-semibold text-neutral-950">
                {isAr ? "الإجمالي" : "Total"}
              </span>
              <span className="font-semibold text-neutral-950">
                {formatEGP(completedOrder.total, locale)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-10 py-4 bg-neutral-950 text-white text-[11px] font-medium uppercase tracking-[0.28em] hover:bg-neutral-800 transition-colors"
            >
              {isAr ? "العودة إلى الرئيسية" : "Return to Homepage"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[75vh] bg-white flex items-center justify-center px-6 py-24">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 border border-neutral-200 text-neutral-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6 stroke-[1.25]" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-light uppercase tracking-[0.1em] text-neutral-950">
            {isAr ? "حقيبة التسوق فارغة" : "Your Shopping Bag is Empty"}
          </h1>
          <p className="text-xs text-neutral-500 tracking-wide leading-relaxed">
            {isAr
              ? "اختر قطع الأثاث المفضلة لديك وأضفها إلى حقيبة التسوق أولاً لإتمام الطلب."
              : "Select your furniture pieces from our collection before proceeding to checkout."}
          </p>
          <Link
            href="/#catalog"
            className="inline-flex px-9 py-4 bg-neutral-950 text-white text-[11px] font-medium uppercase tracking-[0.28em] hover:bg-neutral-800 transition-colors"
          >
            {isAr ? "تصفح المجموعة" : "Explore Collection"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-950 py-12 md:py-16">
      {/* Hidden prewarm Turnstile iframe so token is ready before user clicks submit */}
      {requireCaptcha && turnstileIframeUrl && !turnstileToken && (
        <iframe
          src={turnstileIframeUrl}
          title="Vondera Security Preload"
          aria-hidden="true"
          tabIndex={-1}
          className="fixed w-0 h-0 opacity-0 pointer-events-none border-0"
        />
      )}

      {/* Turnstile Interactive Security Modal (shown if interactive verification is required) */}
      {showTurnstileModal && turnstileIframeUrl && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setShowTurnstileModal(false);
                if (turnstileResolverRef.current) {
                  turnstileResolverRef.current(null);
                  turnstileResolverRef.current = null;
                }
              }}
              className="absolute top-4 end-4 text-neutral-400 hover:text-neutral-950 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
              SECURITY VERIFICATION
            </p>
            <h3 className="text-base font-medium text-neutral-950">
              {isAr ? "تحقق أمني سريع لحماية طلبك" : "Quick Security Check"}
            </h3>
            <p className="text-xs text-neutral-500">
              {isAr
                ? "يرجى إتمام التحقق بالأسفل لتأكيد طلبك."
                : "Please complete the check below to place your order."}
            </p>
            <div className="flex justify-center py-2">
              <iframe
                src={turnstileIframeUrl}
                title="Security Verification"
                className="w-full max-w-[320px] h-[85px] border-0"
                allow="publickey-credentials-get *; clipboard-write; fullscreen"
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1360px] mx-auto px-6 md:px-12">
        {/* Top Breadcrumb / Back Link */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <Link
              href="/#catalog"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-neutral-500 hover:text-neutral-950 transition-colors mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{isAr ? "العودة للتسوق" : "Continue Shopping"}</span>
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-light uppercase tracking-[0.08em] text-neutral-950">
              {isAr ? "إتمام الطلب والتوصيل" : "Checkout & Delivery"}
            </h1>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">
            AURA FURNITURE DIRECT CHECKOUT
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
        >
          {/* Left Column: Customer, Delivery & Payment */}
          <div className="lg:col-span-7 space-y-8">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 01. Contact Information */}
            <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-950">
                  {isAr ? "01. بيانات التواصل" : "01. Contact Information"}
                </h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  {isAr ? "مطلوب *" : "Required *"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-600">
                    {isAr ? "الاسم بالكامل *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isAr ? "أحمد محمد" : "Ahmed Mohamed"}
                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 focus:border-neutral-950 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-600">
                    {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 focus:border-neutral-950 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-600">
                    {isAr ? "رقم الموبايل (مصر) *" : "Mobile Number (Egypt) *"}
                  </label>
                  <div className="flex" dir="ltr">
                    <span className="inline-flex items-center px-3.5 border border-e-0 border-neutral-300 bg-neutral-100 text-xs font-mono text-neutral-600">
                      +20
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 focus:border-neutral-950 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-600">
                    {isAr ? "رقم هاتف بديل (اختياري)" : "Alternative Phone (Optional)"}
                  </label>
                  <div className="flex" dir="ltr">
                    <span className="inline-flex items-center px-3.5 border border-e-0 border-neutral-300 bg-neutral-100 text-xs font-mono text-neutral-600">
                      +20
                    </span>
                    <input
                      type="tel"
                      value={otherPhone}
                      onChange={(e) => setOtherPhone(e.target.value)}
                      placeholder="01112345678"
                      className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 focus:border-neutral-950 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 02. Shipping & Delivery Address */}
            <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-950 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>
                    {isAr ? "02. عنوان التوصيل والشحن" : "02. Delivery Address"}
                  </span>
                </h2>
                {configLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-600">
                    {isAr ? "المحافظة / منطقة الشحن *" : "Governorate / Zone *"}
                  </label>
                  <select
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 focus:border-neutral-950 outline-none transition-colors"
                  >
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                        {zone.fees > 0
                          ? ` (+${formatEGP(zone.fees, locale)})`
                          : isAr
                          ? " (شحن مجاني)"
                          : " (Free Shipping)"}
                      </option>
                    ))}
                  </select>
                </div>

                {subZones.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-600">
                      {isAr ? "المنطقة / الحي *" : "District / Area *"}
                    </label>
                    <select
                      value={subZoneId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSubZoneId(id);
                        const found = subZones.find((s) => s.id === id);
                        setSubZoneName(found?.name || "");
                      }}
                      className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 focus:border-neutral-950 outline-none transition-colors"
                    >
                      <option value="">
                        {isAr ? "اختر المنطقة" : "Select District"}
                      </option>
                      {subZones.map((sz) => (
                        <option key={sz.id} value={sz.id}>
                          {sz.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-600">
                  {isAr
                    ? "العنوان بالتفصيل (المنطقة، الشارع، رقم العقار، الدور، الشقة) *"
                    : "Detailed Street Address (District, Street, Building, Floor, Apt) *"}
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    isAr
                      ? "مثال: التجمع الخامس، شارع التسعين، عقار 15، الدور الثالث، شقة 6"
                      : "e.g. New Cairo, 90th Street, Building 15, Floor 3, Apt 6"
                  }
                  className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 focus:border-neutral-950 outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-600">
                  {isAr
                    ? "ملاحظات التوصيل (اختياري)"
                    : "Delivery Instructions (Optional)"}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isAr
                      ? "أي تعليمات إضافية لمندوب التوصيل..."
                      : "Any special notes for our delivery team..."
                  }
                  className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 focus:border-neutral-950 outline-none transition-colors"
                />
              </div>
            </div>

            {/* 03. Payment Methods (Dynamic from Vondera `/orders/payment-methods`) */}
            <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-950">
                  {isAr ? "03. طريقة الدفع" : "03. Payment Method"}
                </h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  VONDERA VERIFIED
                </span>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected =
                    method.type === "MANUAL"
                      ? paymentMethod === "MANUAL" &&
                        paymentMethodId === method.id
                      : paymentMethod === method.type;

                  const IconComponent =
                    method.type === "GATEWAY" || method.type === "DEPOSIT"
                      ? CreditCard
                      : method.type === "MANUAL"
                      ? Wallet
                      : Banknote;

                  const title =
                    method.type === "CASH"
                      ? isAr
                        ? "الدفع نقداً عند الاستلام (Cash on Delivery)"
                        : "Cash on Delivery (COD)"
                      : method.type === "GATEWAY"
                      ? isAr
                        ? "الدفع الإلكتروني (بطاقة بنكية / محفظة / تقسيط)"
                        : `${method.name} (Card / Wallet / Installments)`
                      : method.type === "DEPOSIT"
                      ? isAr
                        ? "دفع عربون أونلاين والباقي عند الاستلام"
                        : "Pay Deposit Online + Balance on Delivery"
                      : method.name;

                  const subtitle =
                    method.type === "CASH"
                      ? isAr
                        ? "ادفع نقداً لمندوب التوصيل عند استلام ومعاينة الأثاث"
                        : "Pay in cash upon receiving and inspecting your furniture"
                      : method.type === "GATEWAY"
                      ? isAr
                        ? "سيتم تحويلك لبوابة الدفع الآمنة لإتمام الدفع"
                        : "You will be redirected to Vondera's secure payment gateway"
                      : method.description;

                  return (
                    <div
                      key={`${method.type}-${method.id}`}
                      onClick={() => {
                        setPaymentMethod(method.type);
                        setPaymentMethodId(
                          method.type === "MANUAL" ? method.id : undefined
                        );
                      }}
                      className={`p-4 sm:p-5 border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                        isSelected
                          ? "border-neutral-950 bg-neutral-950/[0.02]"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <IconComponent className="w-5 h-5 text-neutral-950 shrink-0 mt-0.5 stroke-[1.5]" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-neutral-950">
                            {title}
                          </p>
                          {subtitle && (
                            <p className="text-xs text-neutral-500 leading-relaxed">
                              {subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                          isSelected
                            ? "border-neutral-950 bg-neutral-950"
                            : "border-neutral-300"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Manual Payment Receipt Upload (for InstaPay / Vodafone Cash when requiredReceipt is enabled) */}
              {activeMethodConfig?.requiredReceipt && (
                <div className="pt-3 border-t border-neutral-100 space-y-2">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-700">
                    {isAr
                      ? "صورة إيصال التحويل *"
                      : "Upload Payment Receipt Screenshot *"}
                  </label>
                  <label className="flex items-center justify-center gap-2 border border-dashed border-neutral-300 p-4 text-xs text-neutral-600 hover:border-neutral-950 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>
                      {receiptImage
                        ? isAr
                          ? "تم إرفاق الإيصال بنجاح (اضغط للتغيير)"
                          : "Receipt attached (Click to change)"
                        : isAr
                        ? "اضغط لرفع صورة إيصال الدفع"
                        : "Click to upload receipt screenshot"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 lg:sticky lg:top-28">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-950 border-b border-neutral-100 pb-4">
              {isAr ? "ملخص الطلب" : "Order Summary"}
            </h2>

            {/* Cart Items */}
            <div className="space-y-4 max-h-80 overflow-y-auto pe-1">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.variantId || "default"}`}
                  className="flex items-center gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
                >
                  <div className="relative w-16 h-16 bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p
                      dir="auto"
                      className="text-xs sm:text-sm font-medium text-neutral-950 truncate"
                    >
                      {item.name}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-neutral-400">
                      {isAr ? "الكمية:" : "Qty:"} {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-neutral-950 shrink-0">
                    {formatEGP(item.price * item.quantity, locale)}
                  </span>
                </div>
              ))}
            </div>

            {/* Discount Code */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-neutral-400 absolute top-1/2 -translate-y-1/2 start-3.5" />
                  <input
                    type="text"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    placeholder={isAr ? "كود الخصم أو القسيمة" : "Discount code"}
                    className="w-full border border-neutral-300 ps-9 pe-3 py-2.5 text-xs text-neutral-950 outline-none focus:border-neutral-950"
                  />
                </div>
                <button
                  type="button"
                  disabled={promoStatus?.loading}
                  onClick={handleApplyPromo}
                  className="px-5 py-2.5 bg-neutral-950 text-white text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {promoStatus?.loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isAr ? (
                    "تطبيق"
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
              {promoStatus?.message && (
                <p
                  className={`text-xs ${
                    promoStatus.valid ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {promoStatus.message}
                </p>
              )}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-3 pt-4 border-t border-neutral-200 text-xs sm:text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                <span className="font-medium text-neutral-950">
                  {formatEGP(priceCalc?.itemsPrice ?? cartSubtotal, locale)}
                </span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>
                  {isAr
                    ? `الشحن (${selectedCityName})`
                    : `Shipping (${selectedCityName})`}
                </span>
                <span className="font-medium text-neutral-950">
                  {calculating ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : shippingFees === 0 ? (
                    <span className="text-emerald-700 font-medium">
                      {isAr ? "مجاني" : "Free"}
                    </span>
                  ) : (
                    formatEGP(shippingFees, locale)
                  )}
                </span>
              </div>

              {gatewayFees > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>{isAr ? "رسوم بوابة الدفع" : "Payment Gateway Fees"}</span>
                  <span className="font-medium text-neutral-950">
                    {formatEGP(gatewayFees, locale)}
                  </span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>{isAr ? "الخصم" : "Discount"}</span>
                  <span>-{formatEGP(discount, locale)}</span>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-neutral-200 text-base font-semibold text-neutral-950">
                <span>{isAr ? "الإجمالي النهائي" : "Total Due"}</span>
                <span>{formatEGP(finalTotal, locale)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium uppercase tracking-[0.25em] flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {isAr ? "جاري تسجيل الطلب..." : "Processing Order..."}
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
                  <span>
                    {paymentMethod === "GATEWAY" || paymentMethod === "DEPOSIT"
                      ? isAr
                        ? `المتابعة للدفع الآمن (${formatEGP(finalTotal, locale)})`
                        : `Proceed to Secure Payment (${formatEGP(
                            finalTotal,
                            locale
                          )})`
                      : isAr
                      ? `تأكيد الطلب (${formatEGP(finalTotal, locale)})`
                      : `Place Order (${formatEGP(finalTotal, locale)})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
