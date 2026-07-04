"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, RotateCcw, Edit2 } from "lucide-react";
import { useBag } from "@/context/BagContext";

export default function BagDrawer() {
  const pathname = usePathname();
  const {
    items,
    totalCount,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeItem,
    clearBag,
  } = useBag();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on path change (e.g. going to inquiry form or catalog)
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname, setIsDrawerOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);



  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[#332A20]/45 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Slide-over panel */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 z-50 max-w-md w-full bg-warm-ivory border-l border-antique-gold/15 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-modal="true"
        role="dialog"
        aria-labelledby="bag-drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-antique-gold/10">
          <div className="flex items-center gap-2">
            <h2 id="bag-drawer-title" className="text-base font-heading font-semibold text-deep-maroon uppercase tracking-wider">
              Inquiry Bag
            </h2>
            {totalCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center bg-royal-maroon text-[9px] font-bold text-warm-ivory">
                {totalCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1 text-premium-brown/70 hover:text-royal-maroon transition-colors cursor-pointer"
            aria-label="Close bag drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Items list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none">
          {items.length > 0 ? (
            <div className="space-y-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-antique-gold/10 pb-5 last:border-b-0 last:pb-0"
                >
                  {/* Thumbnail Image */}
                  <div className="relative w-16 aspect-[3/4] bg-warm-cream border border-antique-gold/10 overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Item Description & Quantity Controls */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xs font-heading font-semibold text-deep-maroon tracking-tight line-clamp-1 hover:text-royal-maroon transition-colors">
                          <Link href={`/product/${item.slug}`} onClick={() => setIsDrawerOpen(false)}>
                            {item.title}
                          </Link>
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-premium-brown/40 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          aria-label={`Remove ${item.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] font-body text-premium-brown/60 uppercase block mb-1">
                        SKU: {item.sku} • {item.fabric}
                      </span>
                    </div>

                    <div className="flex items-center justify-end mt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-antique-gold/25 overflow-hidden bg-pearl-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-royal-maroon hover:bg-warm-cream text-xs font-bold transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-2 text-xs font-heading font-semibold text-premium-brown min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-royal-maroon hover:bg-warm-cream text-xs font-bold transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Custom Notes input helper preview */}
                    {item.notes ? (
                      <div className="mt-2.5 text-[10px] font-body text-royal-maroon bg-warm-cream/50 px-2 py-1.5 border border-antique-gold/10 flex items-start gap-1">
                        <Edit2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="italic line-clamp-1">Note: {item.notes}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-full bg-warm-cream flex items-center justify-center mb-6 border border-antique-gold/10">
                <ShoppingBag className="w-6 h-6 text-antique-gold" />
              </div>
              <h3 className="text-sm font-heading font-semibold text-deep-maroon uppercase tracking-widest mb-2">
                Your Bag is Empty
              </h3>
              <p className="text-xs text-premium-brown/65 font-body leading-relaxed max-w-[220px] mb-8 font-light">
                Browse our collections and add designs you love to submit a direct price quote inquiry.
              </p>
              <Link
                href="/catalog"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex px-6 py-3 bg-royal-maroon hover:bg-wine-red text-warm-ivory text-xs font-heading font-semibold tracking-wider uppercase rounded-none transition-all duration-300 active-press hover-lift"
              >
                Browse Catalog
              </Link>
            </div>
          )}
        </div>

        {/* Footer Area (Fixed) */}
        {items.length > 0 && (
          <div className="p-6 border-t border-antique-gold/10 bg-pearl-white space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm select-none">
              <span className="font-heading font-bold uppercase tracking-wider text-premium-brown/60">
                Total Designs
              </span>
              <span className="font-heading font-bold text-base text-premium-brown">
                {items.length}
              </span>
            </div>

            {/* Note text */}
            <p className="text-[10px] text-premium-brown/60 font-body leading-relaxed font-light">
              * Direct trade quotes will be calculated. WhatsApp submission does not charge your card.
            </p>

            {/* Action buttons */}
            <div className="space-y-3 pt-1">
              <Link
                href="/inquiry-bag"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-4 bg-royal-maroon hover:bg-wine-red text-warm-ivory rounded-none font-heading font-semibold uppercase tracking-wider text-xs transition-all duration-300 active-press hover-lift flex items-center justify-center gap-2"
              >
                <span>Proceed to Inquiry</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={clearBag}
                className="w-full py-2 bg-transparent hover:text-rose-600 text-premium-brown/50 rounded-none font-heading font-semibold uppercase tracking-widest text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All Items
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
