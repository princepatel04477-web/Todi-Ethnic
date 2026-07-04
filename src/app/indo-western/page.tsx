import React from "react";
import { fetchProducts } from "@/lib/services/products";
import CategoryCollectionPage from "@/components/ui/CategoryCollectionPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Indo Western Couture | Todi Creation",
  description: "Browse Todi Creation's Indo Western fusion wear. Elegant silhouettes combining contemporary fashion with traditional embroidery.",
};

export default async function IndoWesternPage() {
  const products = await fetchProducts({ category: "Indo Western" });

  return (
    <CategoryCollectionPage
      categoryName="Indo Western"
      categorySlug="indo-western"
      tagline="Contemporary Fusion"
      description="Modern asymmetrical silhouettes and premium handworked embroidery designed for the modern fashion-forward boutique."
      heroImage="/images/catalog-covers/Indo-Western.png"
      products={products}
    />
  );
}
