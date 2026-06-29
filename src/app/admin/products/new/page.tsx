import React from "react";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import { Category } from "@/lib/services/products";

// Fallbacks for dev sandbox mode
const mockCategories: Category[] = [
  { id: "cat-1", name: "Banarasi Sarees", slug: "banarasi-sarees", description: null, image_url: null, created_at: "", updated_at: "" },
  { id: "cat-2", name: "Bridal Georgette", slug: "bridal-georgette", description: null, image_url: null, created_at: "", updated_at: "" },
  { id: "cat-3", name: "Silk Cotton", slug: "silk-cotton", description: null, image_url: null, created_at: "", updated_at: "" },
  { id: "cat-4", name: "Designer Lehengas", slug: "designer-lehengas", description: null, image_url: null, created_at: "", updated_at: "" },
];

export default async function NewProductPage() {
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
        console.error("Failed to load categories:", error);
        isDevMode = true;
      } else {
        categories = data || [];
      }
    } catch (err) {
      console.error("Database connection error:", err);
      isDevMode = true;
    }
  }

  if (isDevMode) {
    categories = [...mockCategories];
  }

  // Server Action/Form submission logic
  const handleCreateProduct = async (payload: any) => {
    "use server";
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url || url.includes("placeholder")) {
      // Simulate successful local dev insertion
      return { success: true };
    }

    try {
      const supabase = await createClient();
      const { error } = await supabase.from("products").insert([payload]);
      
      if (error) {
        console.error("Supabase insert product error:", error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (err: any) {
      console.error("Failed to insert product:", err);
      return { success: false, error: err.message || "Database insert error" };
    }
  };

  return (
    <ProductForm
      categories={categories}
      onSubmit={handleCreateProduct}
      titleText="Create New Design"
    />
  );
}
