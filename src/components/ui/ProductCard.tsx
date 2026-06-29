"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBag } from "@/context/BagContext";
import { ShoppingBag, Check } from "lucide-react";

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    sku: string;
    price: number;
    fabric: string;
    image_urls: string[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useBag();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToBag = () => {
    const firstImage = product.image_urls && product.image_urls.length > 0
      ? product.image_urls[0]
      : "/images/hero_banarasi_saree.jpg";

    addItem({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      sku: product.sku,
      fabric: product.fabric,
      image: firstImage,
      quantity: 1,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const displayImage = product.image_urls && product.image_urls.length > 0
    ? product.image_urls[0]
    : "/images/hero_banarasi_saree.jpg";

  return (
    <div className="group flex flex-col bg-white dark:bg-zinc-950 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-900 transition-all duration-300 hover:shadow-luxury-hover hover-lift">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            src={displayImage}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>
        
        {/* Fabric tag */}
        <div className="absolute top-3 left-3 bg-neutral-900/80 dark:bg-neutral-950/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
          <span className="text-[10px] font-heading font-medium tracking-wider text-primary uppercase">
            {product.fabric}
          </span>
        </div>
      </div>

      {/* Details */}
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
            onClick={handleAddToBag}
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
}
