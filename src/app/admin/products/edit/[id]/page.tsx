import React from "react";
import { notFound } from "next/navigation";
import { createClient, isDynamicError } from "@/lib/supabase/server";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";
import { Product, Category } from "@/lib/services/products";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  let product: Product | null = null;
  let categories: Category[] = [];

  try {
    const supabase = await createClient();

    const [productRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("*, categories(*)")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle(),
      supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true })
    ]);

    if (productRes.error) {
      console.error("Failed to load product:", productRes.error);
    } else {
      product = productRes.data ? {
        ...productRes.data,
        name: productRes.data.title,
        category: productRes.data.categories?.name || "Designer Wear",
        image: productRes.data.image_urls?.[0] || "",
        newArrival: productRes.data.new_arrival || false,
        categories: productRes.data.categories
      } : null;
    }

    categories = categoriesRes.data || [];
  } catch (err) {
    if (isDynamicError(err)) throw err;
    console.error("Database connection error:", err);
  }

  if (!product) {
    notFound();
  }

  const handleEditProduct = async (payload: ProductFormData) => {
    "use server";
    
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", id);
      
      if (error) {
        console.error("Supabase update product error:", error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (err) {
      console.error("Failed to update product:", err);
      const errMsg = err instanceof Error ? err.message : "Database update error";
      return { success: false, error: errMsg };
    }
  };

  return (
    <ProductForm
      initialData={product}
      categories={categories}
      onSubmit={handleEditProduct}
      titleText={`Edit Design: ${product.title}`}
    />
  );
}
