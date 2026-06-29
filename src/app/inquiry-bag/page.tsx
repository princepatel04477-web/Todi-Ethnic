"use client";

import React, { useState, useEffect } from "react";
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
    removeItem, 
    clearBag 
  } = useBag();

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState(" boutique");
  const [customMessage, setCustomMessage] = useState("");
  
  // UX states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [waLink, setWaLink] = useState("");
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  // Populate initial notes from bag items
  useEffect(() => {
    const initialNotes: Record<string, string> = {};
    items.forEach((item) => {
      if (item.notes) {
        initialNotes[item.id] = item.notes;
      }
    });
    setItemNotes(initialNotes);
  }, [items]);

  const handleNoteChange = (id: string, val: string) => {
    setItemNotes((prev) => ({ ...prev, [id]: val }));
    // Update local storage / bag context notes
    const item = items.find((i) => i.id === id);
    if (item) {
      item.notes = val;
    }
  };

  const estimatedSubtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

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
      price: item.price,
      quantity: item.quantity,
      notes: itemNotes[item.id] || ""
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
        // Continue to WhatsApp anyway - do not block conversions!
      }
    } catch (err) {
      console.error("Failed to connect to Supabase database:", err);
      // Continue to WhatsApp anyway - do not block conversions!
    }

    // 2. Compile WhatsApp Message
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "910000000000";
    
    let itemsText = "";
    preparedItems.forEach((item, index) => {
      itemsText += `${index + 1}. ${item.title} (SKU: ${item.sku})
   - Fabric: ${item.fabric}
   - Qty: ${item.quantity} pcs
   - Price: ₹${item.price.toLocaleString("en-IN")} each\n`;
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
${itemsText}*Est. Subtotal:* ₹${estimatedSubtotal.toLocaleString("en-IN")}

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
      <div className="flex flex-col min-h-screen bg-[#fbfcfa] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors duration-300">
        <Header />
        <main className="flex-grow max-w-2xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center justify-center text-center select-none">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-8 border border-emerald-100 dark:border-emerald-900 shadow-glow">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900 dark:text-white mb-4">
            Inquiry Sent Successfully!
          </h1>
          
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-body leading-relaxed mb-8 max-w-lg font-light">
            Thank you, <span className="font-semibold text-neutral-800 dark:text-neutral-200">{name}</span>. Your inquiry details have been saved and compiled. We have redirected you to WhatsApp to connect with our sales desk.
          </p>

          <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-luxury mb-8">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-primary mb-3">
              Didn&apos;t redirect automatically?
            </h3>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-5 font-body">
              Click the button below to open the chat window manually and submit your compiled inquiry details.
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white text-xs font-heading font-semibold uppercase tracking-wider rounded-xl shadow-luxury hover-glow transition-all active-press"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              Open WhatsApp Chat
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <Link
            href="/catalog"
            className="text-xs font-heading font-semibold uppercase tracking-widest text-neutral-400 hover:text-primary transition-colors flex items-center gap-1.5"
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
    <div className="flex flex-col min-h-screen bg-[#fbfcfa] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors duration-300">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full">
        {/* Title */}
        <div className="text-center md:text-left mb-10 select-none">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-heading font-semibold mb-2 block">
            Submission Stage
          </span>
          <h1 className="text-3xl font-heading font-medium tracking-tight text-neutral-900 dark:text-white">
            Complete Your Inquiry
          </h1>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Form (7 cols on lg) */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-950 rounded-2xl border border-neutral-100 dark:border-neutral-900 p-6 sm:p-8 shadow-luxury select-none">
              <h2 className="text-base font-heading font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-6 pb-3 border-b border-neutral-100 dark:border-neutral-900">
                Customer Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
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
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-primary text-sm font-body transition-colors placeholder-neutral-400 dark:placeholder-neutral-600"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
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
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-primary text-sm font-body transition-colors placeholder-neutral-400 dark:placeholder-neutral-600"
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  </div>
                </div>

                {/* Business Type */}
                <div className="space-y-2">
                  <label htmlFor="business" className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                    Business Type
                  </label>
                  <div className="relative">
                    <select
                      id="business"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-primary text-sm font-heading font-medium tracking-wide uppercase transition-colors cursor-pointer appearance-none"
                    >
                      <option value="Boutique Owner">Boutique Owner</option>
                      <option value="Wholesale Buyer">Wholesale Buyer</option>
                      <option value="Retail Outlet">Retail Outlet</option>
                      <option value="Personal Buyer">Personal Buyer</option>
                    </select>
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                      <svg className="h-4 w-4 fill-current text-neutral-500" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Custom Message */}
                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-heading font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                    Additional Comments or Requirements
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="e.g. Please let me know the catalog dispatch availability and sample shipping rules..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-primary text-sm font-body transition-colors placeholder-neutral-400 dark:placeholder-neutral-600 resize-none"
                    />
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-heading font-semibold uppercase tracking-wider text-xs transition-all duration-300 active-press hover-glow flex items-center justify-center gap-2 shadow-luxury cursor-pointer disabled:opacity-50"
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

            {/* Right Column: Cart Review (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Order Summary Box */}
              <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-neutral-100 dark:border-neutral-900 p-6 shadow-luxury">
                <h2 className="text-sm font-heading font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-6 pb-3 border-b border-neutral-100 dark:border-neutral-900 select-none">
                  Inquiry Summary
                </h2>

                {/* Scrollable list of items inside summary */}
                <div className="max-h-[360px] overflow-y-auto pr-1 space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b border-neutral-100 dark:border-neutral-900 pb-4 last:border-b-0 last:pb-0">
                      {/* Image */}
                      <div className="relative w-12 aspect-[3/4] rounded overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex-shrink-0">
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
                            <h3 className="text-xs font-heading font-semibold text-neutral-900 dark:text-white tracking-tight line-clamp-1">
                              {item.title}
                            </h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-neutral-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                              aria-label={`Remove ${item.title}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-[9px] font-body text-neutral-400 dark:text-neutral-500 uppercase block">
                            SKU: {item.sku} • {item.fabric}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-1 select-none">
                          <span className="text-xs font-heading font-bold text-neutral-850 dark:text-neutral-200">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>

                          <div className="flex items-center border border-neutral-200 dark:border-neutral-850 rounded-full overflow-hidden bg-neutral-50 dark:bg-zinc-900">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              <Minus className="w-2 h-2" />
                            </button>
                            <span className="px-1.5 text-[10px] font-heading font-semibold min-w-[14px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[10px] font-bold transition-colors cursor-pointer"
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
                <div className="border-t border-neutral-100 dark:border-neutral-900 pt-5 space-y-3 select-none">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 dark:text-neutral-500 font-body">Total Designs</span>
                    <span className="font-heading font-semibold">{items.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 dark:text-neutral-500 font-body">Total Items</span>
                    <span className="font-heading font-semibold">{totalCount} pcs</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 pt-3 text-sm">
                    <span className="font-heading font-bold uppercase tracking-wider text-neutral-500">Est. Subtotal</span>
                    <span className="font-heading font-bold text-neutral-950 dark:text-white">
                      ₹{estimatedSubtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Individual Custom Specifications box */}
              <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-neutral-100 dark:border-neutral-900 p-6 shadow-luxury select-none">
                <h2 className="text-xs font-heading font-bold uppercase tracking-widest text-primary mb-4">
                  Design Specifications
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="space-y-1.5">
                      <label htmlFor={`spec-${item.id}`} className="text-[10px] font-heading font-semibold text-neutral-600 dark:text-neutral-400 block truncate">
                        Notes for {item.title} ({item.sku}):
                      </label>
                      <input
                        id={`spec-${item.id}`}
                        type="text"
                        placeholder="e.g. custom blouse length, 12 pieces requested"
                        value={itemNotes[item.id] || ""}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-850 bg-transparent focus:outline-none focus:border-primary text-xs font-body transition-colors placeholder-neutral-400 dark:placeholder-neutral-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-white dark:bg-zinc-950 rounded-2xl border border-neutral-100 dark:border-neutral-900 shadow-luxury max-w-xl mx-auto select-none">
            <div className="w-16 h-16 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-6">
              <ShoppingBag className="w-6 h-6 text-neutral-300 dark:text-neutral-700" />
            </div>
            <h3 className="text-base font-heading font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-widest mb-2">
              Your Bag is Empty
            </h3>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-body leading-relaxed max-w-[240px] mb-8 font-light">
              Add products from the catalog to build an inquiry bag before submitting.
            </p>
            <Link
              href="/catalog"
              className="inline-flex px-8 py-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-heading font-semibold tracking-wider uppercase rounded-xl transition-all duration-300 active-press hover-glow"
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
