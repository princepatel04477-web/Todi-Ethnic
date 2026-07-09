"use client";

import React from "react";
import { Globe } from "lucide-react";

const EXPORT_COUNTRIES = [
  "Mauritius",
  "South Africa",
  "UAE",
  "UK",
  "New Zealand",
  "West Indies",
  "Sri Lanka",
  "Bangladesh",
  "Fiji Islands",
];

export default function ExportCountries() {
  return (
    <section className="bg-ivory select-none font-body border-t border-antique-gold/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="w-12 h-12 bg-royal-maroon/5 flex items-center justify-center mb-4 border border-antique-gold/10 mx-auto">
            <Globe className="w-6 h-6 text-antique-gold" />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-deep-maroon font-heading font-semibold mb-3 block">
            Global Footprint
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-light tracking-tight text-deep-maroon text-shadow-luxury">
            Countries We Serve
          </h2>
          <p className="text-xs sm:text-sm text-warm-grey mt-4 font-light max-w-xl mx-auto leading-relaxed">
            Supplying premium Indian bridal and ethnic fashion to boutiques, showrooms, and retail networks worldwide.
          </p>
        </div>

        {/* Dynamic tagging list */}
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3 sm:gap-4">
          {EXPORT_COUNTRIES.map((country, index) => (
            <div
              key={index}
              className="px-5 py-3 border border-antique-gold/20 bg-[#FDF9F3] text-deep-maroon text-xs sm:text-sm font-heading font-medium tracking-widest uppercase transition-all duration-300 hover:border-antique-gold hover:shadow-sm"
            >
              {country}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-xs text-warm-grey font-light italic">
            + and other international regions served. Custom logistics available — inquire for global wholesale distribution.
          </p>
        </div>
      </div>
    </section>
  );
}
