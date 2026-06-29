import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ProductCard from "@/components/ui/ProductCard";
import ImageCarousel from "@/components/ui/ImageCarousel";
import ProductDetailsClient from "./ProductDetailsClient";
import SEOJsonLd from "@/components/seo/SEOJsonLd";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/services/products";

// Enable Next.js instant static shell prerendering for client navigation
export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate metadata dynamically for SEO, OpenGraph, and Twitter cards.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Todi Creation",
      description: "The requested luxury designer wear could not be found.",
    };
  }

  const firstImage = product.image_urls && product.image_urls.length > 0
    ? product.image_urls[0]
    : "https://todicreation.com/images/hero_banarasi_saree.jpg";

  return {
    title: `${product.title} - ${product.fabric} Saree | Todi Creation`,
    description: `${product.description.slice(0, 155)}... Surat manufactured designer wear.`,
    alternates: {
      canonical: `https://todicreation.com/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.title} | Todi Creation Surat`,
      description: product.description,
      url: `https://todicreation.com/product/${product.slug}`,
      siteName: "Todi Creation",
      images: [
        {
          url: firstImage,
          width: 800,
          height: 1067,
          alt: product.title,
        },
      ],
      locale: "en_IN",
      type: "music.song", // Using music.song as placeholder/standard or simple article/og:product if supported. For simplicity, next.js default website/article is preferred
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | Todi Creation`,
      description: product.description,
      images: [firstImage],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  // Trigger 404 page if product is not found
  if (!product) {
    notFound();
  }

  // Fetch related products concurrently
  const relatedProducts = await fetchRelatedProducts(
    product.category_id,
    product.fabric,
    product.id,
    4
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfcfa] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors duration-300">
      {/* Dynamic SEO JSON-LD Product Schema */}
      <SEOJsonLd
        productData={{
          title: product.title,
          description: product.description,
          images: product.image_urls.length > 0 ? product.image_urls : ["https://todicreation.com/images/hero_banarasi_saree.jpg"],
          sku: product.sku,
          price: product.price,
          category: product.categories?.name || "Designer Saree",
          fabric: product.fabric,
          inStock: product.stock > 0,
          url: `https://todicreation.com/product/${product.slug}`,
        }}
      />

      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 w-full">
        {/* Navigation Actions / Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 select-none">
          {/* Back Button */}
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs font-heading font-semibold tracking-wider uppercase text-neutral-500 hover:text-primary dark:text-neutral-400 dark:hover:text-primary transition-colors active-press"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Link>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-heading font-medium tracking-wide">
            <Link href="/" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/catalog" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
              Catalog
            </Link>
            {product.categories && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link
                  href={`/catalog?category=${product.categories.slug}`}
                  className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  {product.categories.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-800 dark:text-neutral-200 font-semibold truncate max-w-[150px] sm:max-w-xs">
              {product.title}
            </span>
          </nav>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start mb-16 sm:mb-24">
          {/* Left Column: Image Gallery Carousel */}
          <div>
            <ImageCarousel imageUrls={product.image_urls} title={product.title} />
          </div>

          {/* Right Column: Information & CTAs */}
          <div>
            <ProductDetailsClient product={product} />
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-neutral-100 dark:border-neutral-900 pt-12 sm:pt-16">
            <div className="text-center sm:text-left mb-8 select-none">
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-heading font-semibold mb-2 block">
                More in collection
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-semibold text-neutral-900 dark:text-white tracking-tight">
                Recommended Designs
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
