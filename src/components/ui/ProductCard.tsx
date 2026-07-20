"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface ProductCardProps {
  product: {
    id: string;
    name?: string;
    title?: string;
    category?: string;
    fabric?: string;
    image?: string;
    image_urls?: string[];
    slug: string;
    sku: string;
  };
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  // Support both new and backwards compatible fields
  const displayName = product.name || product.title || "";
  const displayCategory = product.category || product.fabric || "";
  const displayImage = product.image || (product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : "");

  return (
    <div className="group block relative select-none cursor-pointer rounded-[20px] bg-[#FDF9F3]/40 p-3 transition-all duration-500 ease-out hover:bg-[#FDF9F3] hover:-translate-y-2 hover:scale-[1.01] hover:shadow-card-hover shadow-card text-left flex flex-col justify-between h-full border border-[#EADFCF]/20">
      <Link href={`/product/${product.slug}`} className="focus:outline-none block w-full flex-grow">
        {/* Aspect ratio: 3:4 portrait for clean luxury editorial grid */}
        <div className="relative aspect-[3/4] w-full overflow-hidden mb-5 rounded-[14px] bg-pearl-white">
          <Image
            src={displayImage}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={index < 8}
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading={index >= 8 ? "lazy" : undefined}
          />
        </div>

        {/* Minimal Details */}
        <div className="space-y-1.5 px-1.5 mb-4">
          <span className="text-[10px] font-heading font-semibold tracking-[0.2em] text-[#B29567] uppercase block">
            {displayCategory}
          </span>
          <h3 className="font-number font-medium text-lg sm:text-xl text-deep-maroon group-hover:text-royal-maroon transition-colors duration-300 leading-snug pt-0.5 line-clamp-2">
            {displayName}
          </h3>
        </div>
      </Link>

      {/* Details Trigger Button */}
      <div className="px-1.5 pt-2 border-t border-[#EADFCF]/30 select-none">
        <Link
          href={`/product/${product.slug}`}
          className="flex items-center justify-between w-full text-[11px] font-heading font-semibold tracking-wider text-royal-maroon uppercase group/btn"
        >
          <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-antique-gold after:transition-transform after:duration-300 group-hover/btn:after:scale-x-100">
            View Design
          </span>
          <svg
            className="w-3.5 h-3.5 text-royal-maroon transition-transform duration-300 ease-out transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
