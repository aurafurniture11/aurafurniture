import { NextResponse } from "next/server";
import { calculateOrderPrice } from "@/lib/vondera";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cityId,
      city,
      discountCode,
      products,
      paymentMethod,
      paymentMethodId,
      subZoneId,
      sessionId,
    } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Cart products are required" },
        { status: 400 }
      );
    }

    const resolvedCityId = String(cityId || city || "360631").trim();

    const data = await calculateOrderPrice({
      cityId: resolvedCityId,
      discountCode: discountCode || "",
      products,
      paymentMethod: paymentMethod || "CASH",
      paymentMethodId,
      subZoneId,
      sessionId,
    });

    return NextResponse.json({ status: 200, data });
  } catch (err: unknown) {
    const errorObj = err as { message?: string; status?: number; code?: string; data?: unknown };
    return NextResponse.json(
      {
        error: errorObj?.message || "Failed to calculate order price",
        code: errorObj?.code,
        details: errorObj?.data || null,
      },
      { status: errorObj?.status || 500 }
    );
  }
}
