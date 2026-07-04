"use client";

import React, { useState } from "react";
import { Save, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ContactConfig } from "@/lib/services/contactConfig";

interface ContactSettingsFormProps {
  initialConfig: ContactConfig;
  onSave: (config: ContactConfig) => Promise<{ success: boolean; error?: string }>;
}

export default function ContactSettingsForm({ initialConfig, onSave }: ContactSettingsFormProps) {
  const [ownerName, setOwnerName] = useState(initialConfig.ownerName);
  const [phoneNumber, setPhoneNumber] = useState(initialConfig.phoneNumber);
  const [whatsAppNumber, setWhatsAppNumber] = useState(initialConfig.whatsAppNumber);
  const [businessEmail, setBusinessEmail] = useState(initialConfig.businessEmail);
  const [googleMapUrl, setGoogleMapUrl] = useState(initialConfig.googleMapUrl);
  const [googleMapSearchUrl, setGoogleMapSearchUrl] = useState(initialConfig.googleMapSearchUrl);
  const [address, setAddress] = useState(initialConfig.address);
  const [businessHours, setBusinessHours] = useState(initialConfig.businessHours);
  const [heroHeading, setHeroHeading] = useState(initialConfig.heroHeading);
  const [heroSubtitle, setHeroSubtitle] = useState(initialConfig.heroSubtitle);
  const [ctaText, setCtaText] = useState(initialConfig.ctaText);

  // Cards & FAQs
  const [whyPartner, setWhyPartner] = useState(initialConfig.whyPartner || []);
  const [faqs, setFaqs] = useState(initialConfig.faqs || []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Update card fields
  const handleCardChange = (index: number, field: "title" | "description" | "icon", value: string) => {
    const updated = [...whyPartner];
    updated[index] = { ...updated[index], [field]: value };
    setWhyPartner(updated);
  };

  // Update FAQ fields
  const handleFaqChange = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const payload: ContactConfig = {
      ownerName: ownerName.trim(),
      phoneNumber: phoneNumber.trim(),
      whatsAppNumber: whatsAppNumber.trim(),
      businessEmail: businessEmail.trim(),
      googleMapUrl: googleMapUrl.trim(),
      googleMapSearchUrl: googleMapSearchUrl.trim(),
      address: address.trim(),
      businessHours: businessHours.trim(),
      heroHeading: heroHeading.trim(),
      heroSubtitle: heroSubtitle.trim(),
      ctaText: ctaText.trim(),
      whyPartner,
      faqs: faqs.filter(f => f.question.trim() && f.answer.trim())
    };

    const res = await onSave(payload);
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: "success", text: "Contact page configurations updated successfully!" });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update configurations." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 select-none max-w-5xl mx-auto pb-20">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-antique-gold/15 pb-5">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-heading font-semibold uppercase tracking-wider text-zinc-500 hover:text-royal-maroon transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-heading font-semibold text-deep-maroon mt-1">
            Contact & B2B settings
          </h1>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-royal-maroon hover:bg-wine-red text-warm-ivory text-xs font-heading font-semibold uppercase tracking-wider transition-all duration-300 hover-lift flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Message Notifications */}
      {message && (
        <div
          className={`p-4 text-xs font-heading font-bold uppercase tracking-wider ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* General Settings */}
      <div className="bg-pearl-white border border-antique-gold/15 p-6 space-y-6">
        <h2 className="text-sm font-heading font-bold uppercase tracking-widest text-royal-maroon border-b border-antique-gold/10 pb-3">
          1. General Contact details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Owner Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
              Owner Name *
            </label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm transition-colors text-charcoal"
            />
          </div>

          {/* Business Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
              Business Email *
            </label>
            <input
              type="email"
              required
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm transition-colors text-charcoal"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
              Display Phone Number *
            </label>
            <input
              type="text"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm transition-colors text-charcoal"
            />
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
              WhatsApp Country Code + Number * (digits only, e.g., 918141014006)
            </label>
            <input
              type="text"
              required
              value={whatsAppNumber}
              onChange={(e) => setWhatsAppNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm transition-colors text-charcoal"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Address */}
          <div className="space-y-2">
            <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
              Manufacturing/Office Address *
            </label>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm transition-colors text-charcoal resize-none"
            />
          </div>

          {/* Business Hours */}
          <div className="space-y-2">
            <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
              Business Hours *
            </label>
            <input
              type="text"
              required
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm transition-colors text-charcoal"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Google Maps Embed URL */}
          <div className="space-y-2">
            <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
              Google Maps iframe Embed URL *
            </label>
            <textarea
              required
              rows={3}
              value={googleMapUrl}
              onChange={(e) => setGoogleMapUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm transition-colors text-charcoal resize-none"
            />
          </div>

          {/* Google Maps Search Redirect URL */}
          <div className="space-y-2">
            <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
              Google Maps Location Link *
            </label>
            <textarea
              required
              rows={3}
              value={googleMapSearchUrl}
              onChange={(e) => setGoogleMapSearchUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm transition-colors text-charcoal resize-none"
            />
          </div>
        </div>
      </div>

      {/* Hero & Marketing Settings */}
      <div className="bg-pearl-white border border-antique-gold/15 p-6 space-y-6">
        <h2 className="text-sm font-heading font-bold uppercase tracking-widest text-royal-maroon border-b border-antique-gold/10 pb-3">
          2. Hero & Copywriting settings
        </h2>

        {/* Hero Heading */}
        <div className="space-y-2">
          <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
            Hero Main Heading *
          </label>
          <input
            type="text"
            required
            value={heroHeading}
            onChange={(e) => setHeroHeading(e.target.value)}
            className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm transition-colors text-charcoal"
          />
        </div>

        {/* Hero Subtitle */}
        <div className="space-y-2">
          <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
            Hero Subtitle Description *
          </label>
          <textarea
            required
            rows={3}
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm transition-colors text-charcoal resize-none"
          />
        </div>

        {/* CTA Heading */}
        <div className="space-y-2">
          <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
            Final CTA Heading Text *
          </label>
          <input
            type="text"
            required
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className="w-full px-4 py-3 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-sm transition-colors text-charcoal"
          />
        </div>
      </div>

      {/* Why Partner Cards Settings */}
      <div className="bg-pearl-white border border-antique-gold/15 p-6 space-y-6">
        <h2 className="text-sm font-heading font-bold uppercase tracking-widest text-royal-maroon border-b border-antique-gold/10 pb-3">
          3. Why Partner Benefit Cards
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {whyPartner.map((card, idx) => (
            <div key={idx} className="border border-[#EADFCF] p-5 bg-[#FDF9F3] space-y-4">
              <span className="text-[9px] font-heading font-bold uppercase text-[#B29567] block">
                Card #{idx + 1}
              </span>
              
              <div className="space-y-2">
                <label className="text-[9px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={card.title}
                  onChange={(e) => handleCardChange(idx, "title", e.target.value)}
                  className="w-full px-3 py-2 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-xs text-charcoal"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                  Icon Category
                </label>
                <select
                  value={card.icon}
                  onChange={(e) => handleCardChange(idx, "icon", e.target.value)}
                  className="w-full px-3 py-2 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-xs text-charcoal cursor-pointer"
                >
                  <option value="Factory">Factory (Direct Manufacturer)</option>
                  <option value="Sparkles">Sparkles (Embroidery)</option>
                  <option value="Globe">Globe (Global Delivery)</option>
                  <option value="PenTool">PenTool (Custom Design)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                  Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={card.description}
                  onChange={(e) => handleCardChange(idx, "description", e.target.value)}
                  className="w-full px-3 py-2 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-xs text-charcoal resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordions Editor */}
      <div className="bg-pearl-white border border-antique-gold/15 p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-antique-gold/10 pb-3">
          <h2 className="text-sm font-heading font-bold uppercase tracking-widest text-royal-maroon">
            4. Frequently Asked Questions
          </h2>
          <button
            type="button"
            onClick={handleAddFaq}
            className="px-3 py-1.5 bg-royal-maroon hover:bg-wine-red text-warm-ivory text-[10px] font-heading font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add FAQ
          </button>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="flex gap-4 items-start border-b border-[#EADFCF]/50 pb-6 last:border-b-0 last:pb-0">
              <span className="text-xs font-heading font-semibold text-royal-maroon pt-2.5">
                Q{idx + 1}
              </span>
              
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Enter Question..."
                  required
                  value={faq.question}
                  onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                  className="w-full px-3 py-2 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-xs text-charcoal font-semibold uppercase tracking-wide"
                />
                <textarea
                  placeholder="Enter Answer..."
                  required
                  rows={3}
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                  className="w-full px-3 py-2 rounded-none border border-[#EADFCF] bg-ivory focus:outline-none focus:border-antique-gold text-xs text-charcoal font-light resize-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveFaq(idx)}
                className="p-2 text-zinc-400 hover:text-alert-terracotta transition-colors cursor-pointer mt-1"
                title="Delete FAQ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {faqs.length === 0 && (
            <div className="text-center py-6 text-zinc-400 text-xs font-light">
              No FAQs added. Click the button above to add some common questions.
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
