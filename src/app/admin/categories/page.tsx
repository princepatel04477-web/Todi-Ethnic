import React from "react";
import { createClient } from "@/lib/supabase/server";
import CategoriesClient from "./CategoriesClient";
import { Category } from "@/lib/services/products";

// Fallback mocks for dev sandbox mode
const mockCategories: Category[] = [
  { id: "cat-1", name: "Banarasi Sarees", slug: "banarasi-sarees", description: "Luxury Banarasi silk sarees direct from Surat weavers featuring silver and gold zari brocades.", image_url: "/images/hero_banarasi_saree.jpg", created_at: "", updated_at: "" },
  { id: "cat-2", name: "Bridal Georgette", slug: "bridal-georgette", description: "Premium wedding collection sarees in fine georgette featuring handworked stone borders and zari embellishments.", image_url: "/images/category_bridal_georgette.jpg", created_at: "", updated_at: "" },
  { id: "cat-3", name: "Silk Cotton", slug: "silk-cotton", description: "Comfortable and elegant fusion wear combining light cotton fibers with the sheen of pure silk.", image_url: "/images/category_silk_cotton.jpg", created_at: "", updated_at: "" },
  { id: "cat-4", name: "Designer Lehengas", slug: "designer-lehengas", description: "Opulent wedding and ceremonial lehengas direct from our manufacturing facility.", image_url: "/images/category_lehenga.jpg", created_at: "", updated_at: "" },
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
      console.error("Database connection error in admin manager:", err);
      isDevMode = true;
    }
  }

  if (isDevMode) {
    categories = [...mockCategories];
  }

  return <CategoriesClient initialCategories={categories} />;
}
