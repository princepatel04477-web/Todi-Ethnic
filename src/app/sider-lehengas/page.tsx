import React from "react";
import { fetchProducts } from "@/lib/services/products";
import CategoryCollectionPage from "@/components/ui/CategoryCollectionPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sider Lehenga Collection | Todi Creation",
  description: "Browse Todi Creation's premium sider lehengas. Light, elegant festive wear designed for bridesmaids and celebrations.",
};

export default async function SiderPage() {
  const products = await fetchProducts({ category: "Sider Lehenga" });

  return (
    <CategoryCollectionPage
      categoryName="Sider Lehenga"
      categorySlug="sider-lehengas"
      tagline="Festive Bridesmaid Couture"
      description="Elegant festive silhouettes designed for bridesmaids, celebrations, and modern occasions. Tailored with lightweight silk georgette and delicate thread work."
      heroImage="/images/catalog-covers/Sider-cc.png"
      products={products}
    />
  );
}
