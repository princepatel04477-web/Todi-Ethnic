"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBag } from "@/context/BagContext";
import { ShoppingBag, Check } from "lucide-react";

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  sku: string;
  fabric: string;
  image: string;
}

const trendingProducts: Product[] = [
  {
    id: "trending-1",
    title: "Varanasi Rajat Brocade Saree",
    slug: "varanasi-rajat-brocade",
    price: 6800,
    sku: "TC-BAN-001",
    fabric: "Banarasi Silk",
    image: "/images/hero_banarasi_saree.jpg",
  },
  {
    id: "trending-2",
    title: "Crimson Shiddat Bridal Saree",
    slug: "crimson-shiddat-bridal",
    price: 12500,
    sku: "TC-GEO-002",
    fabric: "Bridal Georgette",
    image: "/images/category_bridal_georgette.jpg",
  },
  {
    id: "trending-3",
    title: "Amber Aura Fusion Saree",
    slug: "amber-aura-fusion",
    price: 4200,
    sku: "TC-COT-003",
    fabric: "Silk Cotton",
    image: "/images/category_silk_cotton.jpg",
  },
  {
    id: "trending-4",
    title: "Zardozi Empress Lehenga",
    slug: "zardozi-empress-lehenga",
    price: 18500,
    sku: "TC-LEH-004",
    fabric: "Designer Lehenga",
    image: "/images/category_lehenga.jpg",
  },
];

export default function TrendingGrid() {
  const { addItem } = useBag();
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const handleAddToBag = (product: Product) => {
    addItem({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      sku: product.sku,
      fabric: product.fabric,
      image: product.image,
      quantity: 1,
    });

    // Show temporary success checkmark
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {trendingProducts.map((product) => {
        const isAdded = addedItems[product.id];
        return (
          <div
            key={product.id}
            className="group flex flex-col bg-white dark:bg-zinc-950 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-900 transition-all duration-300 hover:shadow-luxury-hover hover-lift"
          >
            {/* Image Container with hover effects */}
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50 dark:bg-zinc-900/50">
              <Link href={`/product/${product.slug}`} className="block w-full h-full">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </Link>
              
              {/* Overlay elements */}
              <div className="absolute top-3 left-3 bg-neutral-900/80 dark:bg-neutral-950/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                <span className="text-[10px] font-heading font-medium tracking-wider text-primary uppercase">
                  {product.fabric}
                </span>
              </div>
            </div>

            {/* Info details */}
            <div className="p-5 flex flex-col flex-grow select-none">
              <span className="text-[11px] font-body tracking-wider text-neutral-400 dark:text-neutral-500 uppercase mb-1">
                {product.sku}
              </span>
              <h3 className="text-sm font-heading font-medium text-neutral-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors mb-2">
                <Link href={`/product/${product.slug}`}>{product.title}</Link>
              </h3>
              
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900">
                <span className="text-base font-heading font-semibold text-neutral-950 dark:text-zinc-50">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                
                <button
                  onClick={() => handleAddToBag(product)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading font-semibold tracking-wider uppercase transition-all duration-300 active-press cursor-pointer border ${
                    isAdded
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-transparent border-primary text-primary hover:bg-primary hover:text-white"
                  }`}
                  aria-label={isAdded ? `Added ${product.title} to inquiry bag` : `Add ${product.title} to inquiry bag`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Added
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Inquire
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
