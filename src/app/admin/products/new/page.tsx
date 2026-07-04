import React from "react";
import { createClient } from "@/lib/supabase/server";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";
import { Category } from "@/lib/services/products";

export default async function NewProductPage() {
  let categories: Category[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to load categories:", error);
    } else {
      categories = data || [];
    }
  } catch (err) {
    console.error("Database connection error:", err);
  }

  const handleCreateProduct = async (payload: ProductFormData) => {
    "use server";
    
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("products").insert([payload]);
      
      if (error) {
        console.error("Supabase insert product error:", error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (err) {
      console.error("Failed to insert product:", err);
      const errMsg = err instanceof Error ? err.message : "Database insert error";
      return { success: false, error: errMsg };
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
