import React from "react";
import { getProducts } from "@/lib/vondera";
import { RoomPageClient } from "@/components/RoomPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RoomPage({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = await params;
  const productsRes = await getProducts({
    pageNo: 1,
    limit: 1000,
    lightweight: true,
  });

  return <RoomPageClient roomSlug={room} products={productsRes.items} />;
}
