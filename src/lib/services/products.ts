import { createClient } from "@/lib/supabase/server";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;        // matches requirements
  title: string;       // backwards compatibility
  category: string;    // matches requirements
  image: string;       // matches requirements
  slug: string;        // matches requirements
  featured: boolean;   // matches requirements
  newArrival: boolean; // matches requirements
  sku: string;         // backwards compatibility
  fabric: string;      // backwards compatibility
  image_urls: string[];// backwards compatibility
  category_id: string | null;
  stock: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categories?: Category | null;
  description: string;
}

export interface ProductFilters {
  category?: string | string[];
  fabric?: string | string[];
  search?: string;
  sort?: string;
  featured?: boolean;
  newArrival?: boolean;
}

/**
 * Fetch active categories
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Supabase error fetching categories:", err);
    return [];
  }
}

/**
 * Fetch distinct fabrics from active products
 */
export async function fetchFabrics(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("fabric")
      .is("deleted_at", null);

    if (error) {
      console.error("Error fetching fabrics:", error);
      return [];
    }

    const fabrics = Array.from(new Set(data?.map((p) => p.fabric) || []))
      .filter(Boolean)
      .sort();

    return fabrics;
  } catch (err) {
    console.error("Supabase error fetching fabrics:", err);
    return [];
  }
}

/**
 * Fetch products with dynamic filters and sorting
 */
export async function fetchProducts(filters: ProductFilters): Promise<Product[]> {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from("products")
      .select("*, categories(*)")
      .is("deleted_at", null);

    if (filters.category) {
      const rawCategories = Array.isArray(filters.category)
        ? filters.category
        : [filters.category];
      const categoriesList = rawCategories.filter(Boolean);
      
      if (categoriesList.length > 0) {
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("id")
          .or(`slug.in.(${categoriesList.join(",")}),name.in.(${categoriesList.join(",")})`);

        if (catError) {
          console.error("Error fetching categories for filtering:", catError);
        }

        if (catData && catData.length > 0) {
          const catIds = catData.map((c) => c.id);
          query = query.in("category_id", catIds);
        } else {
          return [];
        }
      }
    }

    if (filters.fabric) {
      const rawFabrics = Array.isArray(filters.fabric)
        ? filters.fabric
        : [filters.fabric];
      const fabricList = rawFabrics.filter(Boolean);
      if (fabricList.length > 0) {
        query = query.in("fabric", fabricList);
      }
    }

    if (filters.featured !== undefined) {
      query = query.eq("featured", filters.featured);
    }

    if (filters.search) {
      const searchTrimmed = filters.search.trim();
      if (searchTrimmed) {
        const searchTerm = `%${searchTrimmed}%`;
        query = query.or(
          `title.ilike.${searchTerm},description.ilike.${searchTerm},sku.ilike.${searchTerm},fabric.ilike.${searchTerm}`
        );
      }
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    const mapped = (data || []).map((p: any) => ({
      ...p,
      name: p.title,
      category: p.categories?.name || "Designer Wear",
      image: p.image_urls?.[0] || "",
      newArrival: p.new_arrival || false
    }));

    if (filters.newArrival !== undefined) {
      return mapped.filter((p) => p.newArrival === filters.newArrival);
    }

    return mapped;
  } catch (err) {
    console.error("Supabase error fetching products:", err);
    return [];
  }
}

/**
 * Fetch a single product by slug
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*)")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching product with slug ${slug}:`, error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      name: data.title,
      category: data.categories?.name || "Designer Wear",
      image: data.image_urls?.[0] || "",
      newArrival: data.new_arrival || false
    };
  } catch (err) {
    console.error("Supabase error fetching product by slug:", err);
    return null;
  }
}

/**
 * Fetch related products (e.g. same category or fabric, excluding current)
 */
export async function fetchRelatedProducts(
  categoryId: string | null,
  fabric: string,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from("products")
      .select("*, categories(*)")
      .is("deleted_at", null)
      .neq("id", excludeId);

    if (categoryId) {
      query = query.or(`category_id.eq.${categoryId},fabric.eq.${fabric}`);
    } else {
      query = query.eq("fabric", fabric);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      console.error("Error fetching related products:", error);
      return [];
    }

    return (data || []).map((p: any) => ({
      ...p,
      name: p.title,
      category: p.categories?.name || "Designer Wear",
      image: p.image_urls?.[0] || "",
      newArrival: p.new_arrival || false
    }));
  } catch (err) {
    console.error("Supabase error fetching related products:", err);
    return [];
  }
}
