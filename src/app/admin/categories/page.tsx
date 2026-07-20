import React from "react";
import { createClient, isDynamicError } from "@/lib/supabase/server";
import CategoriesClient from "./CategoriesClient";
import { Category } from "@/lib/services/products";

// Fallback mocks for dev sandbox mode
const mockCategories: Category[] = [
  { id: "cat-1", name: "Bridal Lehenga", slug: "bridal-lehengas", description: "Luxury bridal masterpieces handcrafted with timeless embroidery and royal craftsmanship.", image_url: "/images/categories/Bridal-cc.png", created_at: "", updated_at: "" },
  { id: "cat-2", name: "Sider Lehenga", slug: "sider-lehengas", description: "Elegant festive silhouettes designed for bridesmaids, celebrations and modern occasions.", image_url: "/images/categories/Sider-cc.png", created_at: "", updated_at: "" },
  { id: "cat-3", name: "Farsi Lehenga", slug: "farsi-lehengas", description: "Classic heritage-inspired designs featuring graceful flares and intricate artisan detailing.", image_url: "/images/categories/farsi.png", created_at: "", updated_at: "" },
  { id: "cat-4", name: "Indo-Western", slug: "indo-western", description: "Contemporary fusion couture combining modern fashion with traditional elegance.", image_url: "/images/categories/Indo-Western.png", created_at: "", updated_at: "" },
];

export default async function AdminCategoriesPage() {
  let categories: Category[] = [];
  let isDevMode = false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
    isDevMode = true;
  } else {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Failed to load categories in admin manager:", error);
        isDevMode = true;
      } else {
        categories = data || [];
      }
    } catch (err) {
      if (isDynamicError(err)) throw err;
      console.error("Database connection error in admin manager:", err);
      isDevMode = true;
    }
  }

  if (isDevMode) {
    categories = [...mockCategories];
  }

  return <CategoriesClient initialCategories={categories} />;
}
