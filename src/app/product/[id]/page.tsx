import React from "react";
import { notFound } from "next/navigation";
import { getProductById, getProducts } from "@/lib/vondera";
import { ProductDetailClient } from "@/components/ProductDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getProductById(id);

  if (!detail || !detail.product) {
    notFound();
  }

  let similar =
    detail.simillerProducts || detail.product.simillerProducts || [];
  if (similar.length === 0) {
    const all = await getProducts({ pageNo: 1, limit: 6 });
    similar = all.items.filter((p) => p.id !== detail.product.id).slice(0, 3);
  }

  return (
    <ProductDetailClient
      product={detail.product}
      similarProducts={similar}
    />
  );
}
