import { createPublicClient } from "@/lib/supabase/server";
import { generatedProducts } from "./generatedProducts";

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

export interface RawProduct {
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
  new_arrival: boolean | null;
  stock: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categories: Category | null;
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
      return [
        {
          id: "c0000000-0000-0000-0000-000000000001",
          name: "Bridal Lehenga",
          slug: "bridal-lehengas",
          description: "Luxury bridal masterpieces handcrafted with timeless embroidery and royal craftsmanship.",
          image_url: "/images/categories/Bridal-cc.png",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "c0000000-0000-0000-0000-000000000002",
          name: "Sider Lehenga",
          slug: "sider-lehengas",
          description: "Elegant festive silhouettes designed for bridesmaids, celebrations and modern occasions.",
          image_url: "/images/categories/Sider.png",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "c0000000-0000-0000-0000-000000000003",
          name: "Farsi Lehenga",
          slug: "farsi-lehengas",
          description: "Classic heritage-inspired designs featuring graceful flares and intricate artisan detailing.",
          image_url: "/images/categories/farsi.png",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "c0000000-0000-0000-0000-000000000004",
          name: "Indo-Western",
          slug: "indo-western",
          description: "Contemporary fusion couture combining modern fashion with traditional elegance.",
          image_url: "/images/categories/Indo-Western.png",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    }
    const supabase = createPublicClient();
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
      const fabrics = Array.from(new Set(generatedProducts.map((p) => p.fabric)))
        .filter(Boolean)
        .sort();
      return fabrics;
    }
    const supabase = createPublicClient();
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
      let list = [...generatedProducts];

      if (filters.category) {
        const categoriesList = (
          Array.isArray(filters.category) ? filters.category : [filters.category]
        )
          .filter(Boolean)
          .map((c) => c.toLowerCase());

        if (categoriesList.length > 0) {
          list = list.filter((p) => {
            const catName = p.category?.toLowerCase() || "";
            const catSlug = p.categories?.slug?.toLowerCase() || p.slug.split("-").slice(0, -1).join("-") || "";
            return categoriesList.some(item => catName.includes(item) || catSlug.includes(item) || item.includes(catName) || item.includes(catSlug));
          });
        }
      }

      if (filters.fabric) {
        const fabricsList = (
          Array.isArray(filters.fabric) ? filters.fabric : [filters.fabric]
        )
          .filter(Boolean)
          .map((f) => f.toLowerCase());

        if (fabricsList.length > 0) {
          list = list.filter((p) => fabricsList.includes(p.fabric?.toLowerCase()));
        }
      }

      if (filters.featured !== undefined) {
        list = list.filter((p) => p.featured === filters.featured);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        if (q) {
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.sku.toLowerCase().includes(q) ||
              p.fabric.toLowerCase().includes(q)
          );
        }
      }

      if (filters.newArrival !== undefined) {
        list = list.filter((p) => p.newArrival === filters.newArrival);
      }

      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return list;
    }

    const supabase = createPublicClient();
    
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

    const mapped = (data as unknown as RawProduct[] || []).map((p) => ({
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
      const product = generatedProducts.find((p) => p.slug === slug);
      return product || null;
    }
    const supabase = createPublicClient();
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
      const list = generatedProducts.filter(
        (p) =>
          p.id !== excludeId &&
          (p.category_id === categoryId || p.fabric === fabric)
      );
      return list.slice(0, limit);
    }
    const supabase = createPublicClient();
    
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

    return (data as unknown as RawProduct[] || []).map((p) => ({
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
