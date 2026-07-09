"use client";

import React from "react";
import { Users, Globe, MapPin, CalendarDays } from "lucide-react";

const STATS = [
  {
    icon: <Users className="w-5 h-5 text-antique-gold" />,
    value: "135",
    label: "Skilled Employees",
  },
  {
    icon: <Globe className="w-5 h-5 text-antique-gold" />,
    value: "1700+",
    label: "Boutique Partners",
  },
  {
    icon: <MapPin className="w-5 h-5 text-antique-gold" />,
    value: "17+",
    label: "Countries Served",
  },
  {
    icon: <CalendarDays className="w-5 h-5 text-antique-gold" />,
    value: "2011",
    label: "Established",
  },
];

export default function AboutSection() {
  return (
    <section className="bg-ivory select-none font-body border-t border-antique-gold/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Eyebrow + Headline */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-deep-maroon font-heading font-semibold mb-3 block">
            Our Story
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-light tracking-tight text-deep-maroon text-shadow-luxury">
            A Surat Manufacturer Built on Craft and Consistency
          </h2>
        </div>

        {/* Two-column layout: body copy + vision block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">

          {/* Body Copy */}
          <div className="lg:col-span-7 space-y-5">
            <p className="text-sm text-charcoal/80 font-light leading-relaxed">
              Todi Creation was founded in Surat, Gujarat in 2011 with a straightforward purpose — to
              manufacture premium ethnic wear that boutique owners and exporters could rely on, season
              after season. What started as a small workshop has grown into a 135-member manufacturing
              unit specializing in bridal lehengas, sider lehengas, Farsi trails, and Indo-Western
              ensembles for the wholesale and export trade.
            </p>
            <p className="text-sm text-charcoal/80 font-light leading-relaxed">
              Every piece that leaves our floor is hand-inspected for stitching integrity, embroidery
              alignment, and fabric finish. We do not cut corners on quality control because our
              partners' reputations depend on it. Over 1,700 boutique owners across India and 17+
              countries return to us not for novelty, but because the product arrives as described,
              on time, every time.
            </p>
            <p className="text-sm text-charcoal/80 font-light leading-relaxed">
              We work directly with manufacturers, thread suppliers, and embroiderers within Surat's
              established textile belt. This keeps our supply chain short, our lead times predictable,
              and our wholesale pricing competitive. For international partners, we offer documented
              export support, multi-tier packaging, and air and sea freight coordination to over a
              dozen markets.
            </p>
          </div>

          {/* Vision Pull-Quote */}
          <div className="lg:col-span-5">
            <div className="bg-[#FDF9F3] border border-antique-gold/15 p-8 relative">
              {/* Decorative top border accent */}
              <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-antique-gold/40 to-transparent" />

              <span className="text-[10px] font-heading font-bold uppercase tracking-[0.3em] text-deep-maroon block mb-5">
                Our Vision
              </span>

              <blockquote className="text-base sm:text-lg font-heading font-light text-deep-maroon leading-relaxed tracking-tight italic">
                &ldquo;To inspire the world to embrace Indian culture through premium ethnic fashion
                and exceptional craftsmanship.&rdquo;
              </blockquote>

              <div className="mt-6 pt-5 border-t border-antique-gold/15">
                <p className="text-xs text-warm-grey font-light leading-relaxed">
                  This guides every design decision and partnership we take on — from the artisans
                  in our workshop to the boutiques that showcase our collections globally.
                </p>
              </div>

              {/* Decorative bottom border accent */}
              <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-antique-gold/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="border-t border-antique-gold/15 pt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-y-2 md:divide-y-0 md:divide-x divide-antique-gold/15">
            {STATS.map((stat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center px-6 py-6 md:py-0 gap-2"
              >
                <div className="w-10 h-10 bg-royal-maroon/5 flex items-center justify-center border border-antique-gold/10 mb-2">
                  {stat.icon}
                </div>
                <span className="font-heading text-4xl sm:text-5xl font-light text-deep-maroon block">
                  {stat.value}
                </span>
                <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B29567]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
