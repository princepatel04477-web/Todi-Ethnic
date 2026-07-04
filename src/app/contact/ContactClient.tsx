"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Phone, 
  MapPin, 
  MessageSquare, 
  Factory, 
  Sparkles, 
  Globe, 
  PenTool, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  ExternalLink 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ContactConfig } from "@/lib/services/contactConfig";

interface ContactClientProps {
  config: ContactConfig;
}

export default function ContactClient({ config }: ContactClientProps) {
  const searchParams = useSearchParams();

  // Prefill params
  const paramCategory = searchParams.get("category") || "";
  const paramProduct = searchParams.get("product") || "";
  const paramDesign = searchParams.get("design") || "";

  // Form states
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Bridal Lengha");
  const [message, setMessage] = useState("");

  // Populate prefill fields if present
  useEffect(() => {
    if (paramCategory) {
      // Try to match dropdown values
      const matched = ["Bridal Lengha", "Sider Lengha", "Farsi Lengha", "Indo-Western", "Indo Western"].find(
        (c) => c.toLowerCase().replace("-", " ") === paramCategory.toLowerCase().replace("-", " ")
      );
      if (matched) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCategory(matched);
      }
    }
    if (paramProduct || paramDesign) {
      let prefilledMsg = "";
      if (paramProduct) prefilledMsg += `Inquiring about Design: ${paramProduct}\n`;
      if (paramDesign) prefilledMsg += `Design Number / SKU: ${paramDesign}\n`;
      prefilledMsg += "Please share the wholesale trade catalog sheet and minimum ordering options.";
      setMessage(prefilledMsg);
    }
  }, [paramCategory, paramProduct, paramDesign]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waRedirectUrl, setWaRedirectUrl] = useState("");

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !phone.trim() || !email.trim()) return;

    setIsSubmitting(true);

    // Map wholesale inquiry data to the standard inquiries table schema
    const inquiryItem = {
      title: paramProduct ? `${paramProduct} [B2B Form]` : `${category} B2B Lead`,
      sku: paramDesign || "B2B-LEAD",
      fabric: category,
      quantity: 1,
      notes: `Company: ${company} | Country: ${country} | City: ${city}\nWhatsApp: ${whatsapp}\nEmail: ${email}\n\nMessage: ${message}`
    };

    try {
      const supabase = createClient();
      const { error } = await supabase.from("inquiries").insert([
        {
          customer_name: `${name.trim()} (${company.trim()})`,
          customer_phone: phone.trim(),
          items: [inquiryItem],
          status: "pending"
        }
      ]);

      if (error) {
        console.error("Database lead insert error:", error);
      }
    } catch (err) {
      console.error("Failed to connect to Supabase database:", err);
    }

    // Compile WhatsApp redirect URL
    const targetWaNumber = config.whatsAppNumber || "918141014006";
    const waMsg = `Hi Todi Creations,
  
I have submitted a wholesale inquiry for my boutique:

*Boutique Details:*
- Contact Name: ${name}
- Company: ${company}
- Region: ${city}, ${country}
- Email: ${email}
- WhatsApp: ${whatsapp}
- Category: ${category}
${paramProduct ? `- Design: ${paramProduct} (${paramDesign})\n` : ""}
*Message:*
"${message}"`;

    const encoded = encodeURIComponent(waMsg);
    const waUrl = `https://wa.me/${targetWaNumber}?text=${encoded}`;
    setWaRedirectUrl(waUrl);

    // Open WhatsApp
    window.open(waUrl, "_blank", "noopener,noreferrer");

    setIsSubmitting(false);
    setSuccess(true);
  };

  // Icon mapper helper
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Factory":
        return <Factory className="w-6 h-6 text-antique-gold" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-antique-gold" />;
      case "Globe":
        return <Globe className="w-6 h-6 text-antique-gold" />;
      case "PenTool":
        return <PenTool className="w-6 h-6 text-antique-gold" />;
      default:
        return <Sparkles className="w-6 h-6 text-antique-gold" />;
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center select-none">
        <div className="w-20 h-20 bg-[#F5EFEB] rounded-full flex items-center justify-center mb-8 border border-antique-gold/20 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-10 h-10 text-royal-maroon" />
        </div>
        
        <h1 className="text-3xl font-heading font-light tracking-tight text-deep-maroon mb-4">
          Wholesale Inquiry Submitted
        </h1>
        
        <p className="text-sm sm:text-base text-charcoal/80 font-body leading-relaxed mb-8 max-w-lg font-light">
          Thank you, <span className="font-semibold text-deep-maroon">{name}</span>. Your inquiry has been logged, and we have redirected you to connect with Gautam Todi on WhatsApp.
        </p>

        <div className="w-full bg-[#FDF9F3] border border-[#EADFCF] p-6 shadow-luxury mb-8 rounded-none">
          <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-deep-maroon mb-3">
            Open Chat Manually
          </h3>
          <p className="text-xs text-charcoal/65 mb-5 font-body">
            If WhatsApp did not open automatically, click the button below to connect with Todi Creations sales desk.
          </p>
          <a
            href={waRedirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 bg-royal-maroon hover:bg-wine-red text-warm-ivory text-xs font-heading font-semibold uppercase tracking-wider rounded-none shadow-sm transition-all active-press"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            Connect via WhatsApp
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <button
          onClick={() => {
            setSuccess(false);
            setName("");
            setCompany("");
            setCountry("");
            setCity("");
            setPhone("");
            setWhatsapp("");
            setEmail("");
            setMessage("");
          }}
          className="text-xs font-heading font-semibold uppercase tracking-widest text-[#B29567] hover:text-royal-maroon transition-colors hover-underline"
        >
          Send Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-ivory font-body select-none">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 text-center bg-[#FDF9F3] border-b border-[#EADFCF]/50 overflow-hidden">
        {/* Subtle Luxury Gold Accents */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none flex justify-between items-center px-4">
          <div className="w-40 h-40 rounded-full border border-antique-gold translate-x-[-50%]" />
          <div className="w-40 h-40 rounded-full border border-antique-gold translate-x-[50%]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-4 animate-fade-in">
          <span className="text-[10px] font-heading font-semibold tracking-[0.25em] text-[#B29567] uppercase block">
            WHOLESALE INQUIRIES
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-light text-deep-maroon tracking-tight leading-tight">
            {config.heroHeading}
          </h1>
          <p className="text-xs sm:text-sm text-warm-grey max-w-2xl mx-auto font-light leading-relaxed">
            {config.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Form (7 columns on lg) */}
          <div id="inquiry-form-section" className="lg:col-span-7 bg-[#FDF9F3] border border-[#EADFCF] p-6 sm:p-10 rounded-none shadow-luxury">
            <div className="mb-6">
              <h2 className="text-xl font-heading font-medium text-deep-maroon tracking-wide mb-2 uppercase">
                Send Your Inquiry
              </h2>
              <p className="text-xs text-warm-grey font-light">
                Fill in your boutique and regional details to request bulk ordering quotes.
              </p>
            </div>

            {/* Visual B2B Inquiry Process Steps */}
            <div className="grid grid-cols-3 gap-2 mb-8 bg-ivory/60 border border-antique-gold/15 p-4 text-center">
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-royal-maroon text-warm-ivory flex items-center justify-center text-[10px] font-heading font-semibold mb-1 shadow-sm select-none">1</span>
                <span className="text-[10px] font-heading font-semibold uppercase tracking-wider text-deep-maroon">Browse</span>
                <span className="text-[8px] text-warm-grey hidden sm:block">Select designs from catalog</span>
              </div>
              <div className="flex flex-col items-center relative">
                <span className="w-6 h-6 rounded-full bg-royal-maroon text-warm-ivory flex items-center justify-center text-[10px] font-heading font-semibold mb-1 shadow-sm select-none">2</span>
                <span className="text-[10px] font-heading font-semibold uppercase tracking-wider text-deep-maroon">Inquire</span>
                <span className="text-[8px] text-warm-grey hidden sm:block">Submit boutique details</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-royal-maroon text-warm-ivory flex items-center justify-center text-[10px] font-heading font-semibold mb-1 shadow-sm select-none">3</span>
                <span className="text-[10px] font-heading font-semibold uppercase tracking-wider text-deep-maroon">Receive Quote</span>
                <span className="text-[8px] text-warm-grey hidden sm:block">Get pricing & samples</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm font-light transition-colors text-charcoal placeholder-charcoal/30"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <label htmlFor="company" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                    Boutique / Company Name *
                  </label>
                  <input
                    id="company"
                    type="text"
                    required
                    placeholder="e.g. Sabyasachi Fashions"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm font-light transition-colors text-charcoal placeholder-charcoal/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Country */}
                <div className="space-y-2">
                  <label htmlFor="country" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                    Country *
                  </label>
                  <input
                    id="country"
                    type="text"
                    required
                    placeholder="e.g. United Kingdom"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm font-light transition-colors text-charcoal placeholder-charcoal/30"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label htmlFor="city" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    placeholder="e.g. London"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm font-light transition-colors text-charcoal placeholder-charcoal/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Phone Number */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="e.g. +44 20 7946 0958"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm font-light transition-colors text-charcoal placeholder-charcoal/30"
                  />
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-2">
                  <label htmlFor="whatsapp" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                    WhatsApp Number *
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    required
                    placeholder="e.g. +44 20 7946 0958"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm font-light transition-colors text-charcoal placeholder-charcoal/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="e.g. buyer@boutique.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm font-light transition-colors text-charcoal placeholder-charcoal/30"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="category" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                    Interested Category
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm font-heading font-semibold uppercase tracking-wider text-charcoal cursor-pointer appearance-none"
                    >
                      <option value="Bridal Lengha">Bridal Lengha</option>
                      <option value="Sider Lengha">Sider Lengha</option>
                      <option value="Farsi Lengha">Farsi Lengha</option>
                      <option value="Indo-Western">Indo-Western</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                      <ChevronDown className="w-4 h-4 text-royal-maroon" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                  Inquiry Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  placeholder="Share details about your boutique collections, custom sizes, embroidery edits or required timelines..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm font-light transition-colors text-charcoal placeholder-charcoal/30 resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4.5 bg-royal-maroon hover:bg-wine-red text-warm-ivory rounded-none font-heading font-semibold uppercase tracking-widest text-xs transition-all duration-300 active-press hover-lift flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? "Sending lead request..." : "Request Wholesale Quote"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Contact Cards & Google Map (5 columns on lg) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Contact Cards */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* Card 1: Owner */}
              <div className="bg-[#FDF9F3] border border-[#EADFCF] p-6 shadow-luxury flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-heading font-semibold tracking-widest text-[#B29567] uppercase block">
                    OWNER & MANAGING DIRECTOR
                  </span>
                  <h3 className="text-xl font-heading font-light text-deep-maroon">
                    {config.ownerName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-warm-grey">
                    <Phone className="w-3.5 h-3.5 text-antique-gold" />
                    <span>{config.phoneNumber}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-6 border-t border-[#EADFCF]/50 mt-6">
                  <a
                    href={`tel:${config.phoneNumber.replace(/\s+/g, "")}`}
                    className="flex-1 py-3 text-center bg-transparent border border-royal-maroon text-royal-maroon text-[10px] font-heading font-bold uppercase tracking-wider hover:bg-royal-maroon hover:text-warm-ivory transition-all"
                  >
                    Call Now
                  </a>
                  <a
                    href={`https://wa.me/${config.whatsAppNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 text-center bg-royal-maroon hover:bg-wine-red text-warm-ivory text-[10px] font-heading font-bold uppercase tracking-wider transition-all"
                  >
                    WhatsApp Inquiry
                  </a>
                </div>
              </div>

              {/* Card 2: Office/Manufacturing address */}
              <div className="bg-[#FDF9F3] border border-[#EADFCF] p-6 shadow-luxury flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-heading font-semibold tracking-widest text-[#B29567] uppercase block">
                    MANUFACTURING UNIT
                  </span>
                  <h3 className="text-xl font-heading font-light text-deep-maroon">
                    Todi Creations
                  </h3>
                  <div className="flex items-start gap-2 text-xs text-warm-grey">
                    <MapPin className="w-3.5 h-3.5 text-antique-gold shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{config.address}</span>
                  </div>
                  <div className="text-[10px] text-warm-grey/70 pl-5.5 font-light">
                    Business Hours: {config.businessHours}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-[#EADFCF]/50 mt-6">
                  <a
                    href={config.googleMapSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 inline-block text-center bg-transparent border border-royal-maroon text-royal-maroon text-[10px] font-heading font-bold uppercase tracking-wider hover:bg-royal-maroon hover:text-warm-ivory transition-all"
                  >
                    Open Google Maps
                  </a>
                </div>
              </div>

            </div>

            {/* Embedded Google Map */}
            <div className="w-full aspect-[4/3] rounded-none overflow-hidden border border-[#EADFCF] shadow-luxury relative">
              <iframe
                title="Todi Creations Manufacturing Facility Location"
                src={config.googleMapUrl}
                className="absolute inset-0 w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-500"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>

        </div>
      </section>

      {/* Why Partner With Us Section */}
      <section className="bg-[#FDF9F3] py-16 sm:py-24 border-t border-b border-[#EADFCF]/50 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-2">
            <span className="text-[10px] font-heading font-semibold tracking-[0.25em] text-[#B29567] uppercase block">
              OUR STANDARDS
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-light text-deep-maroon tracking-tight">
              Why Partner With Us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {config.whyPartner.map((card, idx) => (
              <div 
                key={idx} 
                className="bg-ivory border border-[#EADFCF] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury hover:bg-[#FDF9F3] group text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#F5EFEB] flex items-center justify-center mx-auto mb-6 border border-[#EADFCF] group-hover:bg-[#EADFCF]/20 transition-colors">
                  {getIcon(card.icon)}
                </div>
                <h3 className="text-base font-heading font-semibold text-deep-maroon uppercase tracking-wider mb-3">
                  {card.title}
                </h3>
                <p className="text-xs text-warm-grey font-light leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 sm:py-24 select-none">
        <div className="text-center mb-16 space-y-2">
          <span className="text-[10px] font-heading font-semibold tracking-[0.25em] text-[#B29567] uppercase block">
            COMMON QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-light text-deep-maroon tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {config.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="border border-[#EADFCF] bg-[#FDF9F3]"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer group"
                >
                  <span className="font-heading font-medium text-deep-maroon text-sm sm:text-base group-hover:text-royal-maroon transition-colors uppercase tracking-wide">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-royal-maroon" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-royal-maroon group-hover:translate-y-[2px] transition-transform" />
                  )}
                </button>

                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-40 border-t border-[#EADFCF]/50" : "max-h-0"
                  }`}
                >
                  <div className="p-6 text-xs sm:text-sm text-warm-grey font-light leading-relaxed bg-ivory">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-aubergine-black text-ivory py-16 sm:py-24 text-center border-t border-antique-gold/25 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex justify-center items-center">
          <div className="w-[500px] h-[500px] rounded-full border border-antique-gold" />
        </div>

        <div className="max-w-3xl mx-auto px-4 relative z-10 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-heading font-light text-antique-gold tracking-tight">
            {config.ctaText}
          </h2>
          <p className="text-xs sm:text-sm text-ivory/70 font-light max-w-lg mx-auto leading-relaxed">
            Connect with Gautam Todi for elite manufacturing partnerships, fabric catalogs, and international shipping rates.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                const element = document.getElementById("inquiry-form-section");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-8 py-4 bg-antique-gold hover:bg-soft-champagne text-aubergine-black text-xs font-heading font-semibold uppercase tracking-widest transition-all duration-300 hover-lift cursor-pointer rounded-none"
            >
              Request a Wholesale Quote
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
