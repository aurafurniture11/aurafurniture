import React from "react";
import { getProducts } from "@/lib/vondera";
import { WishlistClient } from "@/components/WishlistClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WishlistPage() {
  const productsRes = await getProducts({
    pageNo: 1,
    limit: 1000,
    lightweight: true,
  });

  return <WishlistClient products={productsRes.items} />;
}
