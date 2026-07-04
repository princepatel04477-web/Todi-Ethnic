import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";
import { fetchProducts, fetchCategories, fetchFabrics } from "@/lib/services/products";
import ProductCard from "@/components/ui/ProductCard";
import CatalogClient from "./CatalogClient";

interface CatalogContentProps {
  searchParams: Promise<{
    category?: string | string[];
    fabric?: string | string[];
    search?: string;
    sort?: string;
    featured?: string;
    newArrival?: string;
  }>;
}

// Helper to coerce parameter to array of strings safely
const getArrayParam = (param: string | string[] | undefined): string[] => {
  if (!param) return [];
  if (Array.isArray(param)) return param.filter(Boolean);
  return [param].filter(Boolean);
};

const gatewayCategories = [
  {
    title: "Bridal Collection",
    subtitle: "Luxury bridal masterpieces handcrafted with timeless embroidery and royal craftsmanship.",
    image: "/images/catalog-covers/Bridal-cc.png",
    link: "/bridal",
  },
  {
    title: "Sider Lengha",
    subtitle: "Elegant festive silhouettes designed for bridesmaids, celebrations and modern occasions.",
    image: "/images/catalog-covers/Sider-cc.png",
    link: "/sider-lengha",
  },
  {
    title: "Farsi Lengha",
    subtitle: "Classic heritage-inspired designs featuring graceful flares and intricate artisan detailing.",
    image: "/images/catalog-covers/Farsi.png",
    link: "/farsi-lengha",
  },
  {
    title: "Indo Western",
    subtitle: "Contemporary fusion couture combining modern fashion with traditional elegance.",
    image: "/images/catalog-covers/Indo-Western.png",
    link: "/indo-western",
  },
];

export default async function CatalogContent({ searchParams }: CatalogContentProps) {
  const resolvedParams = await searchParams;

  const activeFilters = {
    category: getArrayParam(resolvedParams.category),
    fabric: getArrayParam(resolvedParams.fabric),
    sort: typeof resolvedParams.sort === "string" ? resolvedParams.sort : "newest",
    search: typeof resolvedParams.search === "string" ? resolvedParams.search : "",
    featured: resolvedParams.featured === "true" ? true : undefined,
    newArrival: resolvedParams.newArrival === "true" ? true : undefined,
  };

  // Determine if we show the lookbook gateway or the filtered products listing
  const isGateway =
    activeFilters.category.length === 0 &&
    activeFilters.fabric.length === 0 &&
    !activeFilters.search &&
    activeFilters.featured === undefined &&
    activeFilters.newArrival === undefined;

  if (isGateway) {
    return (
      <div className="space-y-12 select-none">
        {/* Gateway Section Header */}
        <div className="text-center max-w-3xl mx-auto py-8">
          <h1 className="text-4xl sm:text-5xl font-heading font-light tracking-[0.25em] text-[#6B1F2A] uppercase leading-tight">
            CATALOGUE
          </h1>
          <p className="text-sm sm:text-base text-premium-brown/85 font-body leading-relaxed max-w-2xl mx-auto mt-4 font-light">
            Select a category to explore our handcrafted collections, each manufactured with timeless heritage and artisanal expertise.
          </p>
        </div>

        {/* 4 Premium Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 max-w-7xl mx-auto pb-16 px-4">
          {gatewayCategories.map((cat, i) => (
            <Link
              key={i}
              href={cat.link}
              className="group block rounded-[20px] border border-[#EADFCF] bg-[#FDF9F3] p-5 sm:p-6 transition-all duration-300 ease-out hover:-translate-y-[8px] hover:scale-[1.02] hover:shadow-card-hover shadow-card cursor-pointer text-left flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Cover Image Area - aspect-[4/5] object-contain */}
                <div className="relative aspect-[4/5] w-full overflow-hidden flex items-center justify-center bg-transparent">
                  <div className="relative w-full h-full">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={true}
                    />
                  </div>
                </div>

                {/* Typography details */}
                <div className="space-y-2">
                  <h3 className="font-heading font-light text-2xl text-[#6B1F2A] leading-tight text-shadow-luxury">
                    {cat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-warm-grey font-body leading-relaxed line-clamp-2">
                    {cat.subtitle}
                  </p>
                </div>
              </div>

              {/* Action link */}
              <div className="flex items-center gap-2 pt-4 border-t border-[#EADFCF]/50 mt-6 select-none">
                <span className="text-[11px] font-heading font-semibold tracking-[0.15em] text-[#6B1F2A] uppercase relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-antique-gold after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                  Explore Collection
                </span>
                <svg
                  className="w-3.5 h-3.5 text-[#6B1F2A] transition-transform duration-300 ease-out transform group-hover:translate-x-[6px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Fetch data only on filtered listing view
  const [products, categories, fabrics] = await Promise.all([
    fetchProducts(activeFilters),
    fetchCategories(),
    fetchFabrics(),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header text */}
      <div className="text-center select-none max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-[0.3em] text-royal-maroon font-heading font-semibold mb-2.5 block">
          CATALOGUE
        </span>
        <h1 className="text-3xl sm:text-5xl font-heading font-light tracking-tight mb-4 text-deep-maroon leading-tight">
          Explore Our Premium Collection
        </h1>
        <p className="text-sm sm:text-base text-premium-brown/85 font-body leading-relaxed max-w-2xl mx-auto font-light">
          Browse our handcrafted bridal, Sider, Farsi and Indo Western collections. Each design is manufactured in-house using premium fabrics and intricate embroidery for boutiques worldwide.
        </p>
      </div>

      {/* Interactive Controls & Filters */}
      <CatalogClient
        categories={categories}
        fabrics={fabrics}
        activeFilters={activeFilters}
        productCount={products.length}
      />

      {/* Products Grid or Empty State */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 bg-pearl-white border border-antique-gold/15 max-w-xl mx-auto select-none animate-fade-in shadow-luxury">
          <div className="mx-auto w-12 h-12 rounded-full bg-royal-maroon/10 flex items-center justify-center mb-6">
            <SlidersHorizontal className="w-5 h-5 text-royal-maroon" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-deep-maroon uppercase tracking-wider mb-3">
            No Designs Found
          </h3>
          <p className="text-sm text-premium-brown/80 font-body leading-relaxed mb-8 font-light">
            We couldn&apos;t find any active designs matching your selected search or filter criteria. Try clearing some filters or browsing the full catalog.
          </p>
          <Link
            href="/catalog"
            className="inline-flex px-8 py-3.5 bg-royal-maroon hover:bg-wine-red text-warm-ivory text-xs font-heading font-semibold tracking-wider uppercase rounded-none transition-all duration-300 active-press hover-lift"
          >
            Reset All Filters
          </Link>
        </div>
      )}
    </div>
  );
}
