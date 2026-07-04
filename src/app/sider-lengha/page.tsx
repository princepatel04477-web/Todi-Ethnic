import React from "react";
import { fetchProducts } from "@/lib/services/products";
import CategoryCollectionPage from "@/components/ui/CategoryCollectionPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sider Lengha Collection | Todi Creation",
  description: "Browse Todi Creation's premium sider lenghas. Light, elegant festive wear designed for bridesmaids and celebrations.",
};

export default async function SiderPage() {
  const products = await fetchProducts({ category: "Sider Lengha" });

  return (
    <CategoryCollectionPage
      categoryName="Sider Lengha"
      categorySlug="sider-lengha"
      tagline="Festive Bridesmaid Couture"
      description="Elegant festive silhouettes designed for bridesmaids, celebrations, and modern occasions. Tailored with lightweight silk georgette and delicate thread work."
      heroImage="/images/catalog-covers/Sider-cc.png"
      products={products}
    />
  );
}
