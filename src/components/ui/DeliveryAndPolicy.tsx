"use client";

import React from "react";
import { Truck, Globe, ShieldAlert, RefreshCw } from "lucide-react";

export default function DeliveryAndPolicy() {
  return (
    <section className="bg-ivory select-none font-body border-t border-antique-gold/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-deep-maroon font-heading font-semibold mb-3 block">
            Policies & Timelines
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-light tracking-tight text-deep-maroon text-shadow-luxury">
            Delivery & Return Policies
          </h2>
          <p className="text-xs sm:text-sm text-warm-grey mt-4 font-light max-w-xl mx-auto leading-relaxed">
            We maintain structured, transparent logistics and service standards for all our domestic and international B2B wholesale buyers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1: Domestic Delivery */}
          <div className="p-8 border border-antique-gold/15 bg-[#FDF9F3] flex flex-col items-start transition-all duration-300 ease-out hover:translate-y-[-6px] hover:shadow-luxury">
            <div className="w-12 h-12 bg-royal-maroon/5 flex items-center justify-center mb-6 border border-antique-gold/10">
              <Truck className="w-6 h-6 text-antique-gold" />
            </div>
            <h3 className="text-base font-heading font-semibold text-deep-maroon uppercase tracking-wider mb-2">
              Domestic Delivery
            </h3>
            <span className="text-2xl font-heading font-light text-deep-maroon mb-3 block">7 Days</span>
            <p className="text-xs font-light text-charcoal/80 leading-relaxed">
              Standard transit times across India. All wholesale orders are dispatched with tracked express surface or air shipping partners direct from Surat.
            </p>
          </div>

          {/* Card 2: International Delivery */}
          <div className="p-8 border border-antique-gold/15 bg-[#FDF9F3] flex flex-col items-start transition-all duration-300 ease-out hover:translate-y-[-6px] hover:shadow-luxury">
            <div className="w-12 h-12 bg-royal-maroon/5 flex items-center justify-center mb-6 border border-antique-gold/10">
              <Globe className="w-6 h-6 text-antique-gold" />
            </div>
            <h3 className="text-base font-heading font-semibold text-deep-maroon uppercase tracking-wider mb-2">
              International Delivery
            </h3>
            <span className="text-2xl font-heading font-light text-deep-maroon mb-3 block">25 Days</span>
            <p className="text-xs font-light text-charcoal/80 leading-relaxed">
              Standard door-to-door transit for global destinations including custom clearance, export documentation, and air cargo delivery.
            </p>
          </div>

          {/* Card 3: Return Policy */}
          <div className="p-8 border border-antique-gold/15 bg-[#FDF9F3] flex flex-col items-start transition-all duration-300 ease-out hover:translate-y-[-6px] hover:shadow-luxury">
            <div className="w-12 h-12 bg-royal-maroon/5 flex items-center justify-center mb-6 border border-antique-gold/10">
              <ShieldAlert className="w-6 h-6 text-antique-gold" />
            </div>
            <h3 className="text-base font-heading font-semibold text-deep-maroon uppercase tracking-wider mb-2">
              Return Policy
            </h3>
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-royal-maroon bg-royal-maroon/5 px-2.5 py-1 mb-3">Damages Only</span>
            <p className="text-xs font-light text-charcoal/80 leading-relaxed">
              Due to custom manufacturing constraints, we do not accept standard returns. Only verified transit-damaged products are eligible for claims.
            </p>
          </div>

          {/* Card 4: Replacement Policy */}
          <div className="p-8 border border-antique-gold/15 bg-[#FDF9F3] flex flex-col items-start transition-all duration-300 ease-out hover:translate-y-[-6px] hover:shadow-luxury">
            <div className="w-12 h-12 bg-royal-maroon/5 flex items-center justify-center mb-6 border border-antique-gold/10">
              <RefreshCw className="w-6 h-6 text-antique-gold" />
            </div>
            <h3 className="text-base font-heading font-semibold text-deep-maroon uppercase tracking-wider mb-2">
              Replacement Policy
            </h3>
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-royal-maroon bg-royal-maroon/5 px-2.5 py-1 mb-3">No Refunds</span>
            <p className="text-xs font-light text-charcoal/80 leading-relaxed">
              No monetary refunds are issued. Damaged items are replaced with brand-new pieces of the same design number upon verified visual inspection.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
