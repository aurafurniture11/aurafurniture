import React from "react";
import { getCategories, getProducts } from "@/lib/vondera";
import { ProductsDirectoryClient } from "@/components/ProductsDirectoryClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const resolvedParams = await searchParams;
  const [categories, productsRes] = await Promise.all([
    getCategories(),
    getProducts({ pageNo: 1, limit: 1000, lightweight: true }),
  ]);

  return (
    <ProductsDirectoryClient
      categories={categories}
      products={productsRes.items}
      initialCategoryId={resolvedParams?.category}
    />
  );
}
