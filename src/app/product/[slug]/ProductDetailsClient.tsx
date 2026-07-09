"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Info, ShieldCheck, RefreshCw, Truck, ArrowRight } from "lucide-react";
import { Product } from "@/lib/services/products";

interface ProductDetailsClientProps {
  product: Product;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [activeTab, setActiveTab] = useState<"details" | "fabric" | "shipping">("details");



  // Dynamic fabric care tips based on fabric name
  const getFabricCareInstructions = (fabricName: string) => {
    const nameLower = fabricName.toLowerCase();
    if (nameLower.includes("banarasi") || nameLower.includes("silk")) {
      return {
        description: "Pure Silk/Banarasi fabrics are known for their intricate metallic zari work and premium luster.",
        care: [
          "Dry clean only to maintain zari sheen.",
          "Iron on very low heat using a cotton press cloth.",
          "Avoid direct perfumes, deodorants, or water spray.",
          "Store in a cool, dry place wrapped in a muslin cloth."
        ]
      };
    } else if (nameLower.includes("georgette") || nameLower.includes("crepe")) {
      return {
        description: "Premium Bridal Georgette is a lightweight, crinkly fabric offering a graceful fluid drape.",
        care: [
          "Dry clean recommended for heavy embellished items.",
          "Gentle hand wash in cold water with mild detergent if unembellished.",
          "Dry flat in shade; do not wring or twist.",
          "Iron on low-medium silk settings."
        ]
      };
    } else {
      return {
        description: `${fabricName} is selected specifically for its luxury feel, comfort, and premium manufacturing grade.`,
        care: [
          "Dry clean recommended for first wash.",
          "Subsequent washes: hand wash in cold water with mild detergent.",
          "Always iron inside out on low heat.",
          "Avoid drying under direct scorching sunlight."
        ]
      };
    }
  };

  const fabricCare = getFabricCareInstructions(product.fabric);

  return (
    <div className="flex flex-col space-y-6 select-none animate-fade-in">
      {/* Product SKU and Stock Status */}
      <div className="flex items-center justify-between text-xs font-heading font-medium tracking-widest uppercase border-b border-antique-gold/10 pb-3">
        <span className="text-premium-brown/60">
          Design No: <span className="text-premium-brown font-semibold">{product.sku}</span>
        </span>
        {product.stock > 0 ? (
          <span className="text-emerald-700 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
            In Stock
          </span>
        ) : (
          <span className="text-rose-600">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Title and Price */}
      <div>
        <span className="text-[10px] font-heading uppercase tracking-widest text-warm-grey block mb-1">
          Design No. {product.sku}
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-deep-maroon tracking-tight mb-2">
          {product.title}
        </h1>
      </div>

      {/* Fabric specification highlight */}
      <div className="p-3.5 bg-pearl-white border border-antique-gold/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-premium-brown/65 font-heading">
            Fabric Type:
          </span>
          <span className="text-xs font-heading font-semibold text-royal-maroon uppercase">
            {product.fabric}
          </span>
        </div>
        <div className="text-[10px] text-premium-brown/60 flex items-center gap-1 font-body">
          <Info className="w-3.5 h-3.5 text-royal-maroon" />
          Surat Manufactured
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2">
        <Link
          href={`/contact?category=${encodeURIComponent(product.fabric)}&product=${encodeURIComponent(product.title)}&design=${encodeURIComponent(product.sku)}`}
          className="w-full py-4.5 bg-royal-maroon hover:bg-wine-red text-warm-ivory flex items-center justify-center gap-2 text-xs font-heading font-semibold uppercase tracking-widest transition-all duration-300 hover-lift cursor-pointer rounded-none"
        >
          <span>Request Quote</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Product Details Tabs */}
      <div className="pt-6 border-t border-antique-gold/10">
        {/* Tab Headers */}
        <div className="flex border-b border-antique-gold/10 text-xs font-heading font-bold uppercase tracking-wider mb-5">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 pr-5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "details" ? "border-royal-maroon text-royal-maroon" : "border-transparent text-premium-brown/60 hover:text-royal-maroon"
            }`}
          >
            Design details
          </button>
          <button
            onClick={() => setActiveTab("fabric")}
            className={`pb-3 px-5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "fabric" ? "border-royal-maroon text-royal-maroon" : "border-transparent text-premium-brown/60 hover:text-royal-maroon"
            }`}
          >
            Fabric & Care
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`pb-3 pl-5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "shipping" ? "border-royal-maroon text-royal-maroon" : "border-transparent text-premium-brown/60 hover:text-royal-maroon"
            }`}
          >
            Why Todi Creation
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[140px] text-sm text-premium-brown/80 leading-relaxed font-body font-light">
          {activeTab === "details" && (
            <p className="animate-fade-in">{product.description}</p>
          )}

          {activeTab === "fabric" && (
            <div className="space-y-3 animate-fade-in">
              <p>{fabricCare.description}</p>
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase tracking-wider font-heading font-bold text-premium-brown/60 block mb-1">
                  Care Guidelines:
                </span>
                {fabricCare.care.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start text-xs text-premium-brown/85">
                    <span className="text-royal-maroon mt-0.5">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-xs">
              <div className="flex gap-3 items-start">
                <ShieldCheck className="w-5 h-5 text-royal-maroon flex-shrink-0" />
                <div>
                  <h4 className="font-heading font-semibold text-deep-maroon mb-1 text-sm">Direct Manufacturer pricing</h4>
                  <p className="font-light text-premium-brown/80 leading-relaxed">By producing in-house in Surat, we offer uninflated trade pricing directly to retailers and buyers.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <RefreshCw className="w-5 h-5 text-royal-maroon flex-shrink-0" />
                <div>
                  <h4 className="font-heading font-semibold text-deep-maroon mb-1 text-sm">Uncompromising Quality</h4>
                  <p className="font-light text-premium-brown/80 leading-relaxed">Each lengha undergoes strict quality control for stitching, weaving, and embroidery.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Truck className="w-5 h-5 text-royal-maroon flex-shrink-0" />
                <div>
                  <h4 className="font-heading font-semibold text-deep-maroon mb-1 text-sm">Reliable Global Delivery</h4>
                  <p className="font-light text-premium-brown/80 leading-relaxed">Secure, premium packaging with tracking to protect delicate materials, delivering across India and globally.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start col-span-1 md:col-span-2 border-t border-antique-gold/10 pt-4 mt-2">
                <Info className="w-5 h-5 text-royal-maroon flex-shrink-0" />
                <div>
                  <h4 className="font-heading font-semibold text-deep-maroon mb-1 text-sm">Logistics Timelines & Return Policies</h4>
                  <p className="font-light text-premium-brown/80 leading-relaxed">
                    Domestic orders: 7 Days. International orders: 25 Days. Due to custom B2B manufacturing, no standard returns or refunds are accepted; verified transit-damaged items are replaced after review.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
