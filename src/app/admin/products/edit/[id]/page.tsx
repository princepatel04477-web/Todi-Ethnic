import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import { Product, Category } from "@/lib/services/products";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Fallback mocks for dev sandbox mode
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
    created_at: "",
    updated_at: "",
    deleted_at: null,
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
    created_at: "",
    updated_at: "",
    deleted_at: null,
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
    created_at: "",
    updated_at: "",
    deleted_at: null,
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
    created_at: "",
    updated_at: "",
    deleted_at: null,
  }
];

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  let product: Product | null = null;
  let categories: Category[] = [];
  let isDevMode = false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
    isDevMode = true;
  } else {
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

      if (productRes.error || categoriesRes.error) {
        console.error("Supabase fetch failed during product edit load:", productRes.error || categoriesRes.error);
        isDevMode = true;
      } else {
        product = productRes.data;
        categories = categoriesRes.data || [];
      }
    } catch (err) {
      console.error("Database connection crash during product edit load:", err);
      isDevMode = true;
    }
  }

  if (isDevMode) {
    product = mockProducts.find(p => p.id === id) || null;
    categories = [...mockCategories];
  }

  if (!product) {
    notFound();
  }

  // Server Action/Form submission logic
  const handleEditProduct = async (payload: any) => {
    "use server";
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url || url.includes("placeholder")) {
      // Simulate successful local dev update
      return { success: true };
    }

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
    } catch (err: any) {
      console.error("Failed to update product:", err);
      return { success: false, error: err.message || "Database update error" };
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
