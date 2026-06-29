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
  title: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  category_id: string | null;
  fabric: string;
  image_urls: string[];
  featured: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categories?: Category | null;
}

export interface ProductFilters {
  category?: string | string[];
  fabric?: string | string[];
  priceRange?: string | string[];
  search?: string;
  sort?: string;
}

/**
 * Fetch active categories
 */
export async function fetchCategories(): Promise<Category[]> {
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
}

/**
 * Fetch distinct fabrics from active products
 */
export async function fetchFabrics(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("fabric")
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching fabrics:", error);
    return [];
  }

  // Filter distinct fabrics
  const fabrics = Array.from(new Set(data?.map((p) => p.fabric) || []))
    .filter(Boolean)
    .sort();

  return fabrics;
}


/**
 * Fetch products with dynamic filters and sorting
 */
export async function fetchProducts(filters: ProductFilters): Promise<Product[]> {
  const supabase = await createClient();
  
  // Start with a select that includes category information
  let query = supabase
    .from("products")
    .select("*, categories(*)")
    .is("deleted_at", null);

  // 1. Filter by category (support name or slug, single or multiple values)
  if (filters.category) {
    const rawCategories = Array.isArray(filters.category)
      ? filters.category
      : [filters.category];
    
    // Filter out empty strings
    const categoriesList = rawCategories.filter(Boolean);
    
    if (categoriesList.length > 0) {
      // Fetch corresponding category UUIDs first
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
        // If category is specified but doesn't exist, return empty array immediately
        return [];
      }
    }
  }

  // 2. Filter by fabric (single or multiple values)
  if (filters.fabric) {
    const rawFabrics = Array.isArray(filters.fabric)
      ? filters.fabric
      : [filters.fabric];
    
    const fabricList = rawFabrics.filter(Boolean);
    if (fabricList.length > 0) {
      query = query.in("fabric", fabricList);
    }
  }

  // 3. Filter by price range (support formatted strings e.g. "0-5000", "10000+", single or multiple values)
  if (filters.priceRange) {
    const rawRanges = Array.isArray(filters.priceRange)
      ? filters.priceRange
      : [filters.priceRange];
    
    const ranges = rawRanges.filter(Boolean);
    
    if (ranges.length > 0) {
      const orConditions: string[] = [];
      
      for (const range of ranges) {
        if (range.endsWith("+")) {
          const min = parseInt(range.slice(0, -1), 10);
          if (!isNaN(min)) {
            orConditions.push(`price.gte.${min}`);
          }
        } else {
          const parts = range.split("-");
          if (parts.length === 2) {
            const min = parseInt(parts[0], 10);
            const max = parseInt(parts[1], 10);
            if (!isNaN(min) && !isNaN(max)) {
              orConditions.push(`and(price.gte.${min},price.lte.${max})`);
            }
          }
        }
      }
      
      if (orConditions.length > 0) {
        query = query.or(orConditions.join(","));
      }
    }
  }

  // 4. Text search in title, description, SKU, and fabric
  if (filters.search) {
    const searchTrimmed = filters.search.trim();
    if (searchTrimmed) {
      const searchTerm = `%${searchTrimmed}%`;
      query = query.or(
        `title.ilike.${searchTerm},description.ilike.${searchTerm},sku.ilike.${searchTerm},fabric.ilike.${searchTerm}`
      );
    }
  }

  // 5. Sorting
  const sortOption = filters.sort || "newest";
  switch (sortOption) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a single product by slug
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
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

  return data;
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

  return data || [];
}

