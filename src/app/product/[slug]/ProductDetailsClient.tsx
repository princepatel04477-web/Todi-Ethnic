"use client";

import React, { useState } from "react";
import { useBag } from "@/context/BagContext";
import { ShoppingBag, MessageCircle, Check, Info, ShieldCheck, RefreshCw, Truck } from "lucide-react";
import { Product } from "@/lib/services/products";

interface ProductDetailsClientProps {
  product: Product;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { addItem, toggleDrawer } = useBag();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "fabric" | "shipping">("details");

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

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
      quantity: quantity,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleInstantInquiry = () => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "910000000000";
    const message = `Hi Todi Creation, I am interested in inquiring about this design:
- Design Title: ${product.title}
- SKU: ${product.sku}
- Fabric: ${product.fabric}
- Price: ₹${product.price.toLocaleString("en-IN")}
- Quantity: ${quantity}

Please share details about availability and bulk manufacturing options.`;
    
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

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
      <div className="flex items-center justify-between text-xs font-heading font-medium tracking-widest uppercase border-b border-neutral-100 dark:border-neutral-900 pb-3">
        <span className="text-neutral-400 dark:text-neutral-500">
          SKU: <span className="text-neutral-800 dark:text-neutral-200">{product.sku}</span>
        </span>
        {product.stock > 0 ? (
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            In Stock
          </span>
        ) : (
          <span className="text-rose-500 dark:text-rose-400">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Title and Price */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-neutral-900 dark:text-white tracking-tight mb-2">
          {product.title}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl font-heading font-bold text-neutral-950 dark:text-zinc-50">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-body text-neutral-400 dark:text-neutral-500 font-light">
            (Direct Manufacturer Price)
          </span>
        </div>
      </div>

      {/* Fabric specification highlight */}
      <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-zinc-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-heading">
            Fabric Type:
          </span>
          <span className="text-xs font-heading font-semibold text-primary uppercase">
            {product.fabric}
          </span>
        </div>
        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1 font-body">
          <Info className="w-3.5 h-3.5 text-primary" />
          Surat Manufactured
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Quantity:
        </span>
        <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-full overflow-hidden bg-white dark:bg-zinc-950">
          <button
            onClick={decrementQty}
            className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 transition-colors font-semibold cursor-pointer"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="px-4 text-sm font-heading font-semibold text-neutral-900 dark:text-white min-w-[32px] text-center">
            {quantity}
          </span>
          <button
            onClick={incrementQty}
            className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 transition-colors font-semibold cursor-pointer"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleAddToBag}
          disabled={product.stock <= 0}
          className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-heading font-semibold uppercase tracking-wider transition-all duration-300 active-press border cursor-pointer ${
            isAdded
              ? "bg-emerald-500 border-emerald-500 text-white shadow-glow"
              : "bg-transparent border-primary text-primary hover:bg-primary hover:text-white"
          } disabled:opacity-40 disabled:pointer-events-none`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 animate-bounce" />
              Added to Bag
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              Add to Inquiry Bag
            </>
          )}
        </button>

        <button
          onClick={handleInstantInquiry}
          className="flex-1 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center gap-2 text-xs font-heading font-semibold uppercase tracking-wider transition-all duration-300 active-press shadow-luxury hover-glow cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          WhatsApp Inquiry
        </button>
      </div>

      {/* Product Details Tabs */}
      <div className="pt-6 border-t border-neutral-100 dark:border-neutral-900">
        {/* Tab Headers */}
        <div className="flex border-b border-neutral-100 dark:border-neutral-900 text-xs font-heading font-bold uppercase tracking-wider mb-5">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 pr-5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "details" ? "border-primary text-primary" : "border-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Design details
          </button>
          <button
            onClick={() => setActiveTab("fabric")}
            className={`pb-3 px-5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "fabric" ? "border-primary text-primary" : "border-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Fabric & Care
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`pb-3 pl-5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "shipping" ? "border-primary text-primary" : "border-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Why Todi Creation
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[140px] text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-body font-light">
          {activeTab === "details" && (
            <p className="animate-fade-in">{product.description}</p>
          )}

          {activeTab === "fabric" && (
            <div className="space-y-3 animate-fade-in">
              <p>{fabricCare.description}</p>
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase tracking-wider font-heading font-bold text-neutral-400 dark:text-neutral-500 block mb-1">
                  Care Guidelines:
                </span>
                {fabricCare.care.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start text-xs">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
              <div className="flex gap-3 items-start">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-heading font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Direct Manufacturer pricing</h4>
                  <p className="font-light text-neutral-500 dark:text-neutral-400">By producing in-house in Surat, we offer uninflated trade pricing directly to retailers and buyers.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <RefreshCw className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-heading font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Uncompromising Quality</h4>
                  <p className="font-light text-neutral-500 dark:text-neutral-400">Each saree and lehenga undergoes strict quality control for stitching, weaving, and embroidery.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-heading font-semibold text-neutral-800 dark:text-neutral-200 mb-1">Reliable Global Delivery</h4>
                  <p className="font-light text-neutral-500 dark:text-neutral-400">Secure, premium packaging with tracking to protect delicate materials, delivering across India and globally.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
