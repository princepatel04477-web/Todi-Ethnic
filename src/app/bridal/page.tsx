import React from "react";
import { fetchProducts } from "@/lib/services/products";
import CategoryCollectionPage from "@/components/ui/CategoryCollectionPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridal Lengha Collection | Wholesale Manufacturer | Todi Creation",
  description: "Explore Todi Creation's wholesale bridal collection. Handcrafted in Surat since 2011 with antique zardozi work and fine raw silk. MOQ 25 pieces.",
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
