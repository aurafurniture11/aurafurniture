import { NextResponse } from "next/server";
import { submitOrder } from "@/lib/vondera";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get("user-agent") || undefined;

    const {
      name,
      phone,
      otherPhone,
      countryCode,
      email,
      address,
      cityId,
      city,
      subZoneId,
      subZoneName,
      courierSubZoneId,
      courierSubZoneName,
      notes,
      paymentMethod,
      paymentMethodId,
      receiptImage,
      discountCode,
      products,
      turnstileToken,
      sessionId,
    } = body;

    const resolvedCityId = String(cityId || city || "").trim();

    if (
      !name ||
      !phone ||
      !address ||
      !resolvedCityId ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return NextResponse.json(
        { error: "Please fill in all required customer and shipping fields." },
        { status: 400 }
      );
    }

    const result = await submitOrder({
      name,
      phone,
      otherPhone: otherPhone || "",
      countryCode: countryCode || "+20",
      email: email || "customer@aurafurniture.co",
      address,
      cityId: resolvedCityId,
      subZoneId,
      subZoneName,
      courierSubZoneId,
      courierSubZoneName,
      notes: notes || "",
      paymentMethod: paymentMethod || "CASH",
      paymentMethodId,
      receiptImage,
      discountCode: discountCode || "",
      products,
      turnstileToken,
      sessionId,
      userAgent,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorObj = err as {
      message?: string;
      status?: number;
      code?: string;
      data?: unknown;
    };
    return NextResponse.json(
      {
        error: errorObj?.message || "Failed to submit order to Vondera",
        code: errorObj?.code,
        details: errorObj?.data || null,
      },
      { status: errorObj?.status || 500 }
    );
  }
}
