import React from "react";
import { createClient } from "@/lib/supabase/server";
import ProductsClient from "./ProductsClient";
import { Product, Category } from "@/lib/services/products";

// Mock fallbacks for dev sandbox mode
const mockCategories: Category[] = [
  { id: "cat-1", name: "Banarasi Sarees", slug: "banarasi-sarees", description: null, image_url: null, created_at: "", updated_at: "" },
  { id: "cat-2", name: "Bridal Georgette", slug: "bridal-georgette", description: null, image_url: null, created_at: "", updated_at: "" },
  { id: "cat-3", name: "Silk Cotton", slug: "silk-cotton", description: null, image_url: null, created_at: "", updated_at: "" },
  { id: "cat-4", name: "Designer Lehengas", slug: "designer-lehengas", description: null, image_url: null, created_at: "", updated_at: "" },
];

const mockProducts: Product[] = [
  {
    id: "trending-1",
    title: "Varanasi Rajat Brocade Saree",
    slug: "varanasi-rajat-brocade",
    description: "Premium pure silk brocade featuring silver rajat zari threads.",
    sku: "TC-BAN-001",
    price: 6800,
    category_id: "cat-1",
    fabric: "Banarasi Silk",
    image_urls: ["/images/hero_banarasi_saree.jpg"],
    featured: true,
    stock: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    categories: mockCategories[0]
  },
  {
    id: "trending-2",
    title: "Crimson Shiddat Bridal Saree",
    slug: "crimson-shiddat-bridal",
    description: "Ornate bridal georgette saree with heavy handworked borders and zari work.",
    sku: "TC-GEO-002",
    price: 12500,
    category_id: "cat-2",
    fabric: "Bridal Georgette",
    image_urls: ["/images/category_bridal_georgette.jpg"],
    featured: true,
    stock: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    categories: mockCategories[1]
  },
  {
    id: "trending-3",
    title: "Amber Aura Fusion Saree",
    slug: "amber-aura-fusion",
    description: "Elegant silk-cotton saree with geometric zari checks and floral bootis.",
    sku: "TC-COT-003",
    price: 4200,
    category_id: "cat-3",
    fabric: "Silk Cotton",
    image_urls: ["/images/category_silk_cotton.jpg"],
    featured: false,
    stock: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    categories: mockCategories[2]
  },
  {
    id: "trending-4",
    title: "Zardozi Empress Lehenga",
    slug: "zardozi-empress-lehenga",
    description: "Exclusive designer lehenga with hand-embroidered zardozi and velvet patching.",
    sku: "TC-LEH-004",
    price: 18500,
    category_id: "cat-4",
    fabric: "Designer Lehenga",
    image_urls: ["/images/category_lehenga.jpg"],
    featured: true,
    stock: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    categories: mockCategories[3]
  }
];

export default async function AdminProductsPage() {
  let products: Product[] = [];
  let categories: Category[] = [];
  let isDevMode = false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
    isDevMode = true;
  } else {
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

      if (productsRes.error || categoriesRes.error) {
        console.error("Supabase fetch failed:", productsRes.error || categoriesRes.error);
        isDevMode = true;
      } else {
        products = productsRes.data ? productsRes.data.map(p => ({
          ...p,
          categories: p.categories
        })) : [];
        categories = categoriesRes.data || [];
      }
    } catch (err) {
      console.error("Database connection crash:", err);
      isDevMode = true;
    }
  }

  if (isDevMode) {
    products = [...mockProducts];
    categories = [...mockCategories];
  }

  return (
    <ProductsClient 
      initialProducts={products} 
      categories={categories} 
    />
  );
}
