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

// Check if we are running in local placeholder mode
const isPlaceholderMode = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

// Mock fallbacks for dev sandbox mode
const mockCategories: Category[] = [
  { id: "cat-1", name: "Banarasi Sarees", slug: "banarasi-sarees", description: "Luxury Banarasi silk sarees direct from Surat weavers featuring silver and gold zari brocades.", image_url: "/images/hero_banarasi_saree.jpg", created_at: "", updated_at: "" },
  { id: "cat-2", name: "Bridal Georgette", slug: "bridal-georgette", description: "Premium wedding collection sarees in fine georgette featuring handworked stone borders and zari embellishments.", image_url: "/images/category_bridal_georgette.jpg", created_at: "", updated_at: "" },
  { id: "cat-3", name: "Silk Cotton", slug: "silk-cotton", description: "Comfortable and elegant fusion wear combining light cotton fibers with the sheen of pure silk.", image_url: "/images/category_silk_cotton.jpg", created_at: "", updated_at: "" },
  { id: "cat-4", name: "Designer Lehengas", slug: "designer-lehengas", description: "Opulent wedding and ceremonial lehengas direct from our manufacturing facility.", image_url: "/images/category_lehenga.jpg", created_at: "", updated_at: "" },
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
    created_at: new Date(Date.now() - 86400000).toISOString(),
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
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
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
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
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
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    categories: mockCategories[3]
  }
];

/**
 * Fetch active categories
 */
export async function fetchCategories(): Promise<Category[]> {
  if (isPlaceholderMode) {
    return mockCategories;
  }

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
  if (isPlaceholderMode) {
    const fabrics = Array.from(new Set(mockProducts.map((p) => p.fabric)))
      .filter(Boolean)
      .sort();
    return fabrics;
  }

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
  if (isPlaceholderMode) {
    let filtered = [...mockProducts];

    // 1. Filter by category
    if (filters.category) {
      const rawCategories = Array.isArray(filters.category)
        ? filters.category
        : [filters.category];
      const categoriesList = rawCategories.filter(Boolean);
      
      if (categoriesList.length > 0) {
        filtered = filtered.filter((p) => {
          const cat = mockCategories.find((c) => c.id === p.category_id);
          return cat && (categoriesList.includes(cat.slug) || categoriesList.includes(cat.name));
        });
      }
    }

    // 2. Filter by fabric
    if (filters.fabric) {
      const rawFabrics = Array.isArray(filters.fabric)
        ? filters.fabric
        : [filters.fabric];
      const fabricList = rawFabrics.filter(Boolean);
      
      if (fabricList.length > 0) {
        filtered = filtered.filter((p) => fabricList.includes(p.fabric));
      }
    }

    // 3. Filter by price range
    if (filters.priceRange) {
      const rawRanges = Array.isArray(filters.priceRange)
        ? filters.priceRange
        : [filters.priceRange];
      const ranges = rawRanges.filter(Boolean);
      
      if (ranges.length > 0) {
        filtered = filtered.filter((p) => {
          return ranges.some((range) => {
            if (range.endsWith("+")) {
              const min = parseInt(range.slice(0, -1), 10);
              return !isNaN(min) && p.price >= min;
            } else {
              const parts = range.split("-");
              if (parts.length === 2) {
                const min = parseInt(parts[0], 10);
                const max = parseInt(parts[1], 10);
                return !isNaN(min) && !isNaN(max) && p.price >= min && p.price <= max;
              }
            }
            return false;
          });
        });
      }
    }

    // 4. Text search
    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      if (q) {
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.fabric.toLowerCase().includes(q)
        );
      }
    }

    // 5. Sorting
    const sortOption = filters.sort || "newest";
    if (sortOption === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return filtered;
  }

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

    if (filters.search) {
      const searchTrimmed = filters.search.trim();
      if (searchTrimmed) {
        const searchTerm = `%${searchTrimmed}%`;
        query = query.or(
          `title.ilike.${searchTerm},description.ilike.${searchTerm},sku.ilike.${searchTerm},fabric.ilike.${searchTerm}`
        );
      }
    }

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
  } catch (err) {
    console.error("Supabase error fetching products:", err);
    return [];
  }
}

/**
 * Fetch a single product by slug
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (isPlaceholderMode) {
    const product = mockProducts.find((p) => p.slug === slug);
    return product || null;
  }

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

    return data;
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
  if (isPlaceholderMode) {
    return mockProducts
      .filter((p) => p.id !== excludeId && (p.category_id === categoryId || p.fabric === fabric))
      .slice(0, limit);
  }

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

    return data || [];
  } catch (err) {
    console.error("Supabase error fetching related products:", err);
    return [];
  }
}
