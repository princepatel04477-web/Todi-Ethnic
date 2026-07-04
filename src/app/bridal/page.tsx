import React from "react";
import { fetchProducts } from "@/lib/services/products";
import CategoryCollectionPage from "@/components/ui/CategoryCollectionPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridal Collection | Todi Creation",
  description: "Explore Todi Creation's premium bridal collection. Handcrafted masterpieces featuring antique zardozi work and fine raw silk paneling.",
};

export default async function BridalPage() {
  const products = await fetchProducts({ category: "Bridal Collection" });

  return (
    <CategoryCollectionPage
      categoryName="Bridal Collection"
      categorySlug="bridal-collection"
      tagline="Luxury Wedding Couture"
      description="Timeless silhouettes crafted for unforgettable celebrations. Handcrafted with royal zari, zardozi and antique thread embroideries by expert manufacturers."
      heroImage="/images/catalog-covers/Bridal-cc.png"
      products={products}
    />
  );
}
