import { NextResponse } from "next/server";
import { validateDiscountCode } from "@/lib/vondera";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, cityId, products, paymentMethod, paymentMethodId, sessionId } = body;

    if (!code || !String(code).trim()) {
      return NextResponse.json(
        { error: "Discount code is required" },
        { status: 400 }
      );
    }

    const data = await validateDiscountCode({
      code: String(code),
      cityId: cityId || "360631",
      products: Array.isArray(products) ? products : [],
      paymentMethod: paymentMethod || "CASH",
      paymentMethodId,
      sessionId,
    });

    return NextResponse.json({ status: 200, data });
  } catch (err: unknown) {
    const errorObj = err as { message?: string; status?: number; data?: unknown };
    return NextResponse.json(
      {
        error: errorObj?.message || "Invalid discount code",
        details: errorObj?.data || null,
      },
      { status: errorObj?.status || 400 }
    );
  }
}
