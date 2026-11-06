import { NextResponse } from "next/server";
import { getCheckoutConfig, getSubZones, initCheckoutSession } from "@/lib/vondera";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");
    const sessionId = searchParams.get("sessionId") || undefined;

    if (cityId) {
      const subZones = await getSubZones(cityId, sessionId);
      return NextResponse.json({ status: 200, data: subZones });
    }

    const config = await getCheckoutConfig(sessionId);
    return NextResponse.json({ status: 200, data: config });
  } catch (err: unknown) {
    const errorObj = err as { message?: string; status?: number };
    return NextResponse.json(
      { error: errorObj?.message || "Failed to load checkout configuration" },
      { status: errorObj?.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get("user-agent") || undefined;
    const data = await initCheckoutSession({
      cityId: body.cityId || "",
      discountCode: body.discountCode || "",
      products: Array.isArray(body.products) ? body.products : [],
      pickupMethod: body.pickupMethod || "SHIPPING",
      sessionId: body.sessionId,
      userAgent,
    });
    return NextResponse.json({ status: 200, data });
  } catch (err: unknown) {
    const errorObj = err as { message?: string; status?: number; code?: string };
    return NextResponse.json(
      {
        error: errorObj?.message || "Failed to initialize checkout session",
        code: errorObj?.code,
      },
      { status: errorObj?.status || 500 }
    );
  }
}
