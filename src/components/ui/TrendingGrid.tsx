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
  sku: string;
  fabric: string;
  image: string;
}

const trendingProducts: Product[] = [
  {
    id: "trending-1",
    title: "Varanasi Rajat Brocade Lehenga",
    slug: "varanasi-rajat-brocade",
    sku: "TC-LEH-001",
    fabric: "Bridal Lehenga",
    image: "/images/bridal/bridal-8.jpg",
  },
  {
    id: "trending-2",
    title: "Crimson Shiddat Farsi Lehenga",
    slug: "crimson-shiddat-bridal",
    sku: "TC-FAR-002",
    fabric: "Farsi Lehenga",
    image: "/images/bridal/bridal-9.jpg",
  },
  {
    id: "trending-3",
    title: "Amber Aura Sider Lehenga",
    slug: "amber-aura-fusion",
    sku: "TC-SID-003",
    fabric: "Sider Lehenga",
    image: "/images/bridal/bridal-10.jpg",
  },
  {
    id: "trending-4",
    title: "Zardozi Empress Indo Western",
    slug: "zardozi-empress-lehenga",
    sku: "TC-IND-004",
    fabric: "Indo Western",
    image: "/images/bridal/bridal-11.jpg",
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
            className="group flex flex-col bg-ivory border border-antique-gold/15 transition-all duration-500 hover:border-antique-gold hover:shadow-luxury select-none"
          >
            {/* Image Container with hover effects */}
            <div className="relative aspect-[3/4] overflow-hidden bg-ivory">
              <Link href={`/product/${product.slug}`} className="block w-full h-full">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </Link>
              
              {/* Overlay fabric tag */}
              <div className="absolute top-3 left-3 bg-ivory/90 backdrop-blur-sm px-2.5 py-1 border border-antique-gold/15">
                <span className="text-[9px] font-heading font-semibold tracking-[0.15em] text-deep-maroon uppercase">
                  {product.fabric}
                </span>
              </div>
            </div>

            {/* Info details */}
            <div className="p-5 flex flex-col flex-grow">
              <div className="flex items-center justify-end mb-2">
                <span className="text-[9px] font-body font-semibold tracking-wider text-success-sage uppercase">
                  • In Stock
                </span>
              </div>
              
              <h3 className="text-base font-number font-normal tracking-wide text-charcoal line-clamp-1 group-hover:text-deep-maroon transition-colors mb-2">
                <Link href={`/product/${product.slug}`}>{product.title}</Link>
              </h3>
              
              <div className="mt-auto pt-4 flex items-center justify-end border-t border-antique-gold/10">
                <button
                  onClick={() => handleAddToBag(product)}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-heading font-semibold tracking-wider uppercase transition-all duration-300 active-press cursor-pointer border rounded-none ${
                    isAdded
                      ? "bg-success-sage border-success-sage text-ivory"
                      : "bg-deep-maroon border-deep-maroon text-ivory hover:bg-aubergine-black hover:border-aubergine-black"
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
