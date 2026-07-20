import React from "react";
import { fetchProducts } from "@/lib/services/products";
import CategoryCollectionPage from "@/components/ui/CategoryCollectionPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Farsi Lehenga Collection | Todi Creation",
  description: "Browse Todi Creation's elegant Farsi Lehenga trail collections, manufactured with graceful flares and heritage borders.",
};

export default async function FarsiPage() {
  const products = await fetchProducts({ category: "Farsi Lehenga" });

  return (
    <CategoryCollectionPage
      categoryName="Farsi Lehenga"
      categorySlug="farsi-lehengas"
      tagline="Graceful Heritage Trails"
      description="Classic heritage-inspired designs featuring graceful trails, grand flares, and intricate traditional artisan detailing."
      heroImage="/images/catalog-covers/Farsi.png"
      products={products}
    />
  );
}
