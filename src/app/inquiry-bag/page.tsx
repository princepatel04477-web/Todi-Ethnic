"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  MessageCircle, 
  User, 
  Phone, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  ChevronLeft,
  ArrowRight
} from "lucide-react";
import { useBag } from "@/context/BagContext";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { createClient } from "@/lib/supabase/client";

export default function InquiryBagPage() {
  const { 
    items, 
    totalCount, 
    updateQuantity, 
    updateNotes,
    removeItem, 
    clearBag 
  } = useBag();

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("Boutique Owner");
  const [customMessage, setCustomMessage] = useState("");
  
  // UX states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [waLink, setWaLink] = useState("");

  const handleNoteChange = (id: string, val: string) => {
    updateNotes(id, val);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || items.length === 0) return;

    setIsSubmitting(true);

    // Prepare items data for database insert and WhatsApp compilation
    const preparedItems = items.map((item) => ({
      id: item.id,
      title: item.title,
      sku: item.sku,
      fabric: item.fabric,
      quantity: item.quantity,
      notes: item.notes || ""
    }));

    // 1. Resilient Supabase database insert
    try {
      const supabase = createClient();
      const { error } = await supabase.from("inquiries").insert([
        {
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          items: preparedItems,
          status: "pending"
        }
      ]);
      
      if (error) {
        console.error("Database insert error:", error);
      }
    } catch (err) {
      console.error("Failed to connect to Supabase database:", err);
    }

    // 2. Compile WhatsApp Message
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "910000000000";
    
    let itemsText = "";
    preparedItems.forEach((item, index) => {
      itemsText += `${index + 1}. ${item.title} (SKU: ${item.sku})
   - Fabric: ${item.fabric}
   - Qty: ${item.quantity} pcs\n`;
      if (item.notes.trim()) {
        itemsText += `   - Specifications: "${item.notes.trim()}"\n`;
      }
      itemsText += `\n`;
    });

    const msg = `Hi Todi Creation,
 
I would like to request a trade quote for my order inquiry. Here are the details:
 
*Customer Information:*
- Name: ${name.trim()}
- Phone: ${phone.trim()}
- Business: ${businessType}
 
*Inquired Designs:*
${itemsText}
${customMessage.trim() ? `*Additional Notes:* "${customMessage.trim()}"\n` : ""}
Please confirm availability and manufacturing timeline. Thank you!`;

    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;
    
    setWaLink(whatsappUrl);
    
    // Redirect to WhatsApp
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    // Success and Clear cart
    setIsSubmitting(false);
    setSubmitSuccess(true);
    clearBag();
  };

  if (submitSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-ivory text-charcoal transition-colors duration-300">
        <Header />
        <main className="flex-grow max-w-2xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center justify-center text-center select-none">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-8 border border-emerald-200/50 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-success-sage" />
          </div>
          
          <h1 className="text-3xl font-heading font-light tracking-tight text-deep-maroon mb-4">
            Inquiry Sent Successfully
          </h1>
          
          <p className="text-sm sm:text-base text-charcoal/80 font-body leading-relaxed mb-8 max-w-lg font-light">
            Thank you, <span className="font-semibold text-deep-maroon">{name}</span>. Your inquiry details have been saved and compiled. We have redirected you to WhatsApp to connect with our sales desk.
          </p>

          <div className="w-full bg-ivory border border-antique-gold/15 p-6 shadow-luxury mb-8 rounded-none">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-deep-maroon mb-3">
              Didn&apos;t redirect automatically?
            </h3>
            <p className="text-xs text-charcoal/65 mb-5 font-body">
              Click the button below to open the chat window manually and submit your compiled inquiry details.
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 bg-deep-maroon hover:bg-aubergine-black text-ivory text-xs font-heading font-semibold uppercase tracking-wider rounded-none shadow-sm transition-all active-press"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              Open WhatsApp Chat
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <Link
            href="/catalog"
            className="text-xs font-heading font-semibold uppercase tracking-widest text-charcoal/70 hover:text-deep-maroon transition-colors flex items-center gap-1.5 hover-underline"
          >
            <ChevronLeft className="w-4 h-4" />
            Continue Browsing
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-ivory text-charcoal transition-colors duration-300">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full">
        {/* Title */}
        <div className="text-center md:text-left mb-10 select-none">
          <span className="text-xs uppercase tracking-[0.2em] text-deep-maroon font-heading font-semibold mb-2 block">
            Submission Stage
          </span>
          <h1 className="text-3xl font-heading font-light tracking-tight text-deep-maroon">
            Complete Your Inquiry
          </h1>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-7 bg-ivory border border-antique-gold/15 p-6 sm:p-8 rounded-none shadow-luxury">
              <h2 className="text-base font-heading font-semibold text-deep-maroon uppercase tracking-wider mb-6 pb-3 border-b border-antique-gold/10">
                Customer Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-heading font-bold uppercase tracking-wider text-charcoal/60 block">
                    Full Name / Company Name *
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g. Ramesh Shah (Shah Boutiques)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-none border border-warm-grey bg-ivory focus:outline-none focus:border-antique-gold focus:ring-1 focus:ring-antique-gold text-sm font-body transition-colors placeholder-charcoal/40 text-charcoal"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-antique-gold" />
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-heading font-bold uppercase tracking-wider text-charcoal/60 block">
                    WhatsApp Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-none border border-warm-grey bg-ivory focus:outline-none focus:border-antique-gold focus:ring-1 focus:ring-antique-gold text-sm font-body transition-colors placeholder-charcoal/40 text-charcoal"
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-antique-gold" />
                  </div>
                </div>

                {/* Business Type */}
                <div className="space-y-2">
                  <label htmlFor="business" className="text-xs font-heading font-bold uppercase tracking-wider text-charcoal/60 block">
                    Business Type
                  </label>
                  <div className="relative">
                    <select
                      id="business"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 rounded-none border border-warm-grey bg-ivory focus:outline-none focus:border-antique-gold focus:ring-1 focus:ring-antique-gold text-sm font-heading font-medium tracking-wide uppercase transition-colors cursor-pointer appearance-none text-charcoal"
                    >
                      <option value="Boutique Owner">Boutique Owner</option>
                      <option value="Wholesale Buyer">Wholesale Buyer</option>
                      <option value="Retail Outlet">Retail Outlet</option>
                      <option value="Personal Buyer">Personal Buyer</option>
                    </select>
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-antique-gold" />
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                      <svg className="h-4 w-4 fill-current text-deep-maroon" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Custom Message */}
                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-heading font-bold uppercase tracking-wider text-charcoal/60 block">
                    Additional Comments or Requirements
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="e.g. Please let me know the catalog dispatch availability and sample shipping rules..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-none border border-warm-grey bg-ivory focus:outline-none focus:border-antique-gold focus:ring-1 focus:ring-antique-gold text-sm font-body transition-colors placeholder-charcoal/40 text-charcoal resize-none"
                    />
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-antique-gold" />
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-deep-maroon hover:bg-aubergine-black text-ivory rounded-none font-heading font-semibold uppercase tracking-wider text-xs transition-all duration-300 active-press hover-lift flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>Submit & Open WhatsApp</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Cart Review */}
            <div className="lg:col-span-5 space-y-6">
              {/* Order Summary Box */}
              <div className="bg-ivory border border-antique-gold/15 p-6 shadow-luxury rounded-none">
                <h2 className="text-sm font-heading font-semibold text-deep-maroon uppercase tracking-wider mb-6 pb-3 border-b border-antique-gold/10 select-none">
                  Inquiry Summary
                </h2>

                {/* Scrollable list of items inside summary */}
                <div className="max-h-[360px] overflow-y-auto pr-1 space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b border-antique-gold/10 pb-4 last:border-b-0 last:pb-0">
                      {/* Image */}
                      <div className="relative w-12 aspect-[3/4] overflow-hidden bg-ivory border border-antique-gold/10 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>

                      {/* Info & Controls */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h3 className="text-xs font-number font-medium text-deep-maroon tracking-tight line-clamp-1">
                              {item.title}
                            </h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-charcoal/40 hover:text-alert-terracotta transition-colors p-0.5 cursor-pointer"
                              aria-label={`Remove ${item.title}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-[9px] font-body text-charcoal/60 uppercase block">
                            SKU: <span className="font-body tabular-nums">{item.sku}</span> • {item.fabric}
                          </span>
                        </div>

                        <div className="flex items-center justify-end mt-1 select-none">
                          <div className="flex items-center border border-antique-gold/25 overflow-hidden bg-ivory">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-deep-maroon hover:bg-soft-champagne/10 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              <Minus className="w-2 h-2" />
                            </button>
                            <span className="px-1.5 text-[10px] font-body tabular-nums font-semibold min-w-[14px] text-center text-charcoal">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-deep-maroon hover:bg-soft-champagne/10 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              <Plus className="w-2 h-2" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-antique-gold/10 pt-5 space-y-3 select-none">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal/60 font-body">Total Designs</span>
                    <span className="font-heading font-semibold text-charcoal">{items.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal/60 font-body">Total Items</span>
                    <span className="font-body tabular-nums font-semibold text-charcoal">{totalCount} pcs</span>
                  </div>
                </div>
              </div>

              {/* Individual Custom Specifications box */}
              <div className="bg-ivory border border-antique-gold/15 p-6 shadow-luxury rounded-none">
                <h2 className="text-xs font-heading font-bold uppercase tracking-widest text-deep-maroon mb-4">
                  Design Specifications
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="space-y-1.5">
                      <label htmlFor={`spec-${item.id}`} className="text-[10px] font-heading font-semibold text-charcoal/65 block truncate">
                        Notes for {item.title} ({item.sku}):
                      </label>
                      <input
                        id={`spec-${item.id}`}
                        type="text"
                        placeholder="e.g. custom blouse length, 12 pieces requested"
                        value={item.notes || ""}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-none border border-warm-grey bg-ivory focus:outline-none focus:border-antique-gold focus:ring-1 focus:ring-antique-gold text-xs font-body transition-colors placeholder-charcoal/40 text-charcoal"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-ivory border border-antique-gold/15 max-w-xl mx-auto select-none rounded-none shadow-luxury">
            <div className="w-16 h-16 rounded-full bg-ivory flex items-center justify-center mb-6 border border-antique-gold/10">
              <ShoppingBag className="w-6 h-6 text-antique-gold" />
            </div>
            <h3 className="text-base font-heading font-semibold text-deep-maroon uppercase tracking-widest mb-2">
              Your Bag is Empty
            </h3>
            <p className="text-xs text-charcoal/65 font-body leading-relaxed max-w-[240px] mb-8 font-light">
              Add products from the catalog to build an inquiry bag before submitting.
            </p>
            <Link
              href="/catalog"
              className="inline-flex px-8 py-3.5 bg-deep-maroon hover:bg-aubergine-black text-ivory text-xs font-heading font-semibold tracking-wider uppercase rounded-none transition-all duration-300 active-press hover-lift"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
