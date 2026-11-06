import React from "react";
import { getCategories, getProducts, getStoreInfo } from "@/lib/vondera";
import { CatalogClient } from "@/components/CatalogClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const resolvedParams = await searchParams;
  const [store, categories, productsRes] = await Promise.all([
    getStoreInfo(),
    getCategories(),
    getProducts({ pageNo: 1, limit: 1000, lightweight: true }),
  ]);

  return (
    <CatalogClient
      store={store}
      categories={categories}
      products={productsRes.items}
      initialCategoryId={resolvedParams?.category}
    />
  );
}
