import React from "react";
import { createClient, isDynamicError } from "@/lib/supabase/server";
import ProductsClient from "./ProductsClient";
import { Product, Category } from "@/lib/services/products";

export default async function AdminProductsPage() {
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const supabase = await createClient();

    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("*, categories(*)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true })
    ]);

    if (productsRes.error) {
      console.error("Error fetching products:", productsRes.error.message);
    }
    if (categoriesRes.error) {
      console.error("Error fetching categories:", categoriesRes.error.message);
    }

    if (productsRes.data) {
      products = productsRes.data.map(p => ({
        ...p,
        name: p.title,
        category: p.categories?.name || "Designer Wear",
        image: p.image_urls?.[0] || "",
        newArrival: p.new_arrival || false,
        categories: p.categories
      }));
    }
    categories = categoriesRes.data || [];
  } catch (err) {
    if (isDynamicError(err)) throw err;
    console.error("Database connection error:", err);
  }

  return (
    <ProductsClient 
      initialProducts={products} 
      categories={categories} 
    />
  );
}
