"use client";

import React, { useState, useRef } from "react";
import { 
  User, 
  Briefcase, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Users, 
  MessageSquare,
  Award
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function B2BSection() {
  // Form state
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [category, setCategory] = useState("Bridal Lengha");
  const [message, setMessage] = useState("");
  
  // UX states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waLink, setWaLink] = useState("");

  const formRef = useRef<HTMLDivElement>(null);

  // Buyer segmentation click handler
  const handleSegmentClick = (selectedCategory: string, prefillMsg: string) => {
    setCategory(selectedCategory);
    setMessage(prefillMsg);
    
    // Smooth scroll to form
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !businessName.trim() || !contactInfo.trim()) return;

    setIsSubmitting(true);

    const inquiryItem = {
      title: `Homepage B2B Lead`,
      sku: "B2B-HOME-LEAD",
      fabric: category,
      quantity: 1,
      notes: `Business Name: ${businessName}\nContact: ${contactInfo}\nMessage: ${message}`
    };

    // 1. Save to Supabase
    try {
      const supabase = createClient();
      const { error } = await supabase.from("inquiries").insert([
        {
          customer_name: `${name.trim()} (${businessName.trim()})`,
          customer_phone: contactInfo.trim(),
          items: [inquiryItem],
          status: "pending"
        }
      ]);

      if (error) {
        console.error("Database B2B lead insert error:", error);
      }
    } catch (err) {
      console.error("Failed to connect to Supabase database:", err);
    }

    // 2. WhatsApp redirect
    const targetWaNumber = "918141014006"; // Gautam Todi WhatsApp
    const waMsg = `Hi Todi Creation,

I am interested in wholesale lengha partnership options for my business:

*Contact Name:* ${name}
*Business Name:* ${businessName}
*Contact Info:* ${contactInfo}
*Interested Category:* ${category}

*Requirements:*
"${message || "Please share your wholesale trade catalog and MOQ terms."}"`;

    const encoded = encodeURIComponent(waMsg);
    const url = `https://wa.me/${targetWaNumber}?text=${encoded}`;
    setWaLink(url);

    window.open(url, "_blank", "noopener,noreferrer");
    setIsSubmitting(false);
    setSuccess(true);
  };

  return (
    <section className="bg-ivory select-none font-body">
      
      {/* 1. Buyer Segmentation (Order VI) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-antique-gold/15">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-deep-maroon font-heading font-semibold mb-3 block">
            Partner Programs
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-light tracking-tight text-deep-maroon text-shadow-luxury">
            Who We Serve
          </h2>
          <p className="text-xs sm:text-sm text-warm-grey mt-4 font-light max-w-xl mx-auto leading-relaxed">
            Direct-from-manufacturer pricing, low MOQs, and elite logistics tailored for your specific B2B operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Boutique Owners */}
          <div className="p-8 border border-antique-gold/15 bg-[#FDF9F3] rounded-none flex flex-col justify-between transition-all duration-300 ease-out hover:translate-y-[-6px] hover:shadow-luxury group">
            <div>
              <div className="w-12 h-12 bg-royal-maroon/5 flex items-center justify-center mb-6 border border-antique-gold/10 group-hover:bg-royal-maroon/10 transition-colors">
                <Briefcase className="w-6 h-6 text-antique-gold" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-deep-maroon uppercase tracking-wider mb-3">
                Boutique Owners
              </h3>
              <p className="text-xs font-light text-charcoal/80 leading-relaxed">
                Elevate your showroom with premium bridal and festive wear. Benefit from low custom MOQs, customized blouse cuts, border options, and direct manufacturer pricing to maximize your margin.
              </p>
            </div>
            <button
              onClick={() => handleSegmentClick("Bridal Lengha", "I own a bridal boutique and want to inquire about custom bridal lengha collections, low MOQ terms, and customization options.")}
              className="mt-8 py-3 w-full bg-transparent border border-royal-maroon text-royal-maroon hover:bg-royal-maroon hover:text-warm-ivory text-[10px] font-heading font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Inquire for Boutiques</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Exporters */}
          <div className="p-8 border border-antique-gold/15 bg-[#FDF9F3] rounded-none flex flex-col justify-between transition-all duration-300 ease-out hover:translate-y-[-6px] hover:shadow-luxury group">
            <div>
              <div className="w-12 h-12 bg-royal-maroon/5 flex items-center justify-center mb-6 border border-antique-gold/10 group-hover:bg-royal-maroon/10 transition-colors">
                <Globe className="w-6 h-6 text-antique-gold" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-deep-maroon uppercase tracking-wider mb-3">
                Exporters & Distributors
              </h3>
              <p className="text-xs font-light text-charcoal/80 leading-relaxed">
                Source heavy bridal ensembles at scale. We guarantee consistent bulk manufacturing capacity, multi-tier quality inspections, custom branding inserts, and express international air freight forwarding.
              </p>
            </div>
            <button
              onClick={() => handleSegmentClick("Farsi Lengha", "We are looking to place bulk export orders for Farsi and Bridal lenghas. Please share catalog, bulk tier pricing sheets, and export delivery timelines.")}
              className="mt-8 py-3 w-full bg-transparent border border-royal-maroon text-royal-maroon hover:bg-royal-maroon hover:text-warm-ivory text-[10px] font-heading font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Inquire for Exports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Stylists */}
          <div className="p-8 border border-antique-gold/15 bg-[#FDF9F3] rounded-none flex flex-col justify-between transition-all duration-300 ease-out hover:translate-y-[-6px] hover:shadow-luxury group">
            <div>
              <div className="w-12 h-12 bg-royal-maroon/5 flex items-center justify-center mb-6 border border-antique-gold/10 group-hover:bg-royal-maroon/10 transition-colors">
                <Users className="w-6 h-6 text-antique-gold" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-deep-maroon uppercase tracking-wider mb-3">
                Stylists & Planners
              </h3>
              <p className="text-xs font-light text-charcoal/80 leading-relaxed">
                Provide your brides with unique custom hand-embroidered silhouettes. Get priority booking, custom zardozi/threadwork tailoring, fabric swatches, and rush delivery for weddings or couture shows.
              </p>
            </div>
            <button
              onClick={() => handleSegmentClick("Sider Lengha", "I am a wedding stylist/planner looking to order custom bridal & sider lenghas for upcoming clients. Let's discuss bespoke designs and priority timelines.")}
              className="mt-8 py-3 w-full bg-transparent border border-royal-maroon text-royal-maroon hover:bg-royal-maroon hover:text-warm-ivory text-[10px] font-heading font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Inquire for Stylists</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Social Proof (Order IV) */}
      <div className="bg-[#FDF9F3] border-t border-b border-antique-gold/15 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Key Trust Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-16 divide-y md:divide-y-0 md:divide-x divide-antique-gold/15">
            <div className="pt-6 md:pt-0">
              <span className="font-heading text-4xl sm:text-5xl font-light text-deep-maroon block mb-2">1700+</span>
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B29567]">Boutique Partners</span>
            </div>
            <div className="pt-6 md:pt-0">
              <span className="font-heading text-4xl sm:text-5xl font-light text-deep-maroon block mb-2">17+</span>
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B29567]">Countries Served</span>
              <span className="text-[9px] text-warm-grey block mt-1">(Mauritius, UAE, UK, NZ, Fiji &amp; more)</span>
            </div>
            <div className="pt-6 md:pt-0">
              <span className="font-heading text-4xl sm:text-5xl font-light text-deep-maroon block mb-2">15+</span>
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B29567]">Years Established</span>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B29567] font-heading font-semibold mb-2 block">
              B2B Testimonials
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-light text-deep-maroon tracking-tight">
              Trusted by Leading Bridal Designers
            </h2>
          </div>

          {/* Elegant Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-ivory border border-antique-gold/10 p-6 shadow-sm relative">
              <div className="flex gap-1 text-antique-gold mb-4">
                <Award className="w-4 h-4" />
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-deep-maroon">Verified Partner</span>
              </div>
              <p className="text-xs font-light text-charcoal/80 leading-relaxed italic mb-6">
                &ldquo;Todi Creation&apos;s custom embroidery and low MOQs allowed our London boutique to offer bespoke bridal couture without massive inventory risk. The zardozi details are absolutely flawless.&rdquo;
              </p>
              <div className="border-t border-antique-gold/10 pt-4">
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-deep-maroon">Priya Sharma</h4>
                <p className="text-[10px] text-warm-grey mt-0.5">Founder, Leela Boutique (London, UK)</p>
              </div>
            </div>

            <div className="bg-ivory border border-antique-gold/10 p-6 shadow-sm relative">
              <div className="flex gap-1 text-antique-gold mb-4">
                <Award className="w-4 h-4" />
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-deep-maroon">Verified Partner</span>
              </div>
              <p className="text-xs font-light text-charcoal/80 leading-relaxed italic mb-6">
                &ldquo;As an exporter, I need consistency, reliable shipping, and strict quality control. Gautam Todi and his workshop have delivered on all counts for the past 7 years without delay.&rdquo;
              </p>
              <div className="border-t border-antique-gold/10 pt-4">
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-deep-maroon">Rajesh Patel</h4>
                <p className="text-[10px] text-warm-grey mt-0.5">Managing Director, Patel Exports (Surat / Dubai)</p>
              </div>
            </div>

            <div className="bg-ivory border border-antique-gold/10 p-6 shadow-sm relative">
              <div className="flex gap-1 text-antique-gold mb-4">
                <Award className="w-4 h-4" />
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-deep-maroon">Verified Partner</span>
              </div>
              <p className="text-xs font-light text-charcoal/80 leading-relaxed italic mb-6">
                &ldquo;Their Farsi trails and bridal lenghas are the centerpieces of our bridal consultations. Stylists and brides alike are wowed by the handloom weave quality and royal textures.&rdquo;
              </p>
              <div className="border-t border-antique-gold/10 pt-4">
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-deep-maroon">Amina Khan</h4>
                <p className="text-[10px] text-warm-grey mt-0.5">Lead Bridal Stylist & Planner (Dubai, UAE)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Process Clarity & Lead Capture Form (Order III & V) */}
      <div id="b2b-form" ref={formRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Process Steps */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.3em] text-deep-maroon font-heading font-semibold block">
                Wholesale Process
              </span>
              <h2 className="text-3xl font-heading font-light tracking-tight text-deep-maroon">
                Your Path to Partnership
              </h2>
              <p className="text-xs sm:text-sm text-warm-grey leading-relaxed font-light">
                No complex contracts or barriers. We keep our wholesale inquiry and custom manufacturing workflow clean and transparent.
              </p>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-6 pt-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-royal-maroon text-warm-ivory flex items-center justify-center text-xs font-heading font-semibold shrink-0 shadow-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-heading font-bold uppercase tracking-wider text-deep-maroon">
                    Browse Collections
                  </h4>
                  <p className="text-xs text-warm-grey font-light mt-1 leading-relaxed">
                    Explore our wholesale digital catalog containing our latest bridal, sider, Farsi trail, and Indo-Western designs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-royal-maroon text-warm-ivory flex items-center justify-center text-xs font-heading font-semibold shrink-0 shadow-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-heading font-bold uppercase tracking-wider text-deep-maroon">
                    Inquire Online
                  </h4>
                  <p className="text-xs text-warm-grey font-light mt-1 leading-relaxed">
                    Specify the categories you require, MOQ tiers, customization edits, and your boutique&apos;s regional details.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-royal-maroon text-warm-ivory flex items-center justify-center text-xs font-heading font-semibold shrink-0 shadow-sm">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-heading font-bold uppercase tracking-wider text-deep-maroon">
                    Receive Quote & Samples
                  </h4>
                  <p className="text-xs text-warm-grey font-light mt-1 leading-relaxed">
                    Our sales desk connects with you via WhatsApp or Email within 24 hours to finalize direct pricing sheets and fabric samples.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Lead Capture Form */}
          <div className="lg:col-span-7 bg-[#FDF9F3] border border-[#EADFCF] p-6 sm:p-10 shadow-luxury">
            
            {success ? (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[#F5EFEB] rounded-full flex items-center justify-center mb-6 border border-antique-gold/20 shadow-sm animate-fade-in">
                  <CheckCircle2 className="w-8 h-8 text-royal-maroon" />
                </div>
                <h3 className="text-2xl font-heading font-light text-deep-maroon mb-3">
                  Lead Request Logged
                </h3>
                <p className="text-xs sm:text-sm text-charcoal/80 font-light leading-relaxed mb-6 max-w-md">
                  Thank you, <span className="font-semibold text-deep-maroon">{name}</span>. We have recorded your wholesale inquiry and redirected you to connect with Gautam Todi on WhatsApp.
                </p>
                
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-royal-maroon hover:bg-wine-red text-warm-ivory text-xs font-heading font-semibold uppercase tracking-wider rounded-none shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  Connect on WhatsApp
                </a>

                <button
                  onClick={() => {
                    setSuccess(false);
                    setName("");
                    setBusinessName("");
                    setContactInfo("");
                    setMessage("");
                  }}
                  className="mt-6 text-[10px] font-heading font-semibold uppercase tracking-widest text-[#B29567] hover:text-royal-maroon transition-colors hover-underline"
                >
                  Submit Another Lead
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-heading font-medium text-deep-maroon tracking-wide mb-1 uppercase">
                    Wholesale B2B Inquiry
                  </h3>
                  <p className="text-xs text-warm-grey font-light">
                    Submit this short form to instantly connect with our Surat manufacturing office.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="b2b-name" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                        Contact Name *
                      </label>
                      <div className="relative">
                        <input
                          id="b2b-name"
                          type="text"
                          required
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-xs font-light text-charcoal placeholder-charcoal/30"
                        />
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-antique-gold/70" />
                      </div>
                    </div>

                    {/* Business Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="b2b-company" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                        Business / Boutique Name *
                      </label>
                      <div className="relative">
                        <input
                          id="b2b-company"
                          type="text"
                          required
                          placeholder="Boutique name"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-xs font-light text-charcoal placeholder-charcoal/30"
                        />
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-antique-gold/70" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Contact details */}
                    <div className="space-y-1.5">
                      <label htmlFor="b2b-contact" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                        WhatsApp or Email *
                      </label>
                      <div className="relative">
                        <input
                          id="b2b-contact"
                          type="text"
                          required
                          placeholder="e.g. +91 98765 43210 / partner@email.com"
                          value={contactInfo}
                          onChange={(e) => setContactInfo(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-xs font-light text-charcoal placeholder-charcoal/30"
                        />
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-antique-gold/70" />
                      </div>
                    </div>

                    {/* Category Select */}
                    <div className="space-y-1.5">
                      <label htmlFor="b2b-category" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                        Interested Collection
                      </label>
                      <select
                        id="b2b-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-xs font-heading font-semibold uppercase tracking-wider text-charcoal cursor-pointer appearance-none"
                      >
                        <option value="Bridal Lengha">Bridal Lengha</option>
                        <option value="Sider Lengha">Sider Lengha</option>
                        <option value="Farsi Lengha">Farsi Lengha</option>
                        <option value="Indo-Western">Indo-Western</option>
                      </select>
                    </div>
                  </div>

                  {/* Requirements Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="b2b-message" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                      What are you looking for?
                    </label>
                    <textarea
                      id="b2b-message"
                      rows={4}
                      placeholder="e.g. Bridal lenghas with zardozi borders, looking for wholesale trade quote..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-xs font-light text-charcoal placeholder-charcoal/30 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-royal-maroon hover:bg-wine-red text-warm-ivory rounded-none font-heading font-semibold uppercase tracking-widest text-xs transition-all duration-300 active-press flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Inquiry & Get Catalog"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
