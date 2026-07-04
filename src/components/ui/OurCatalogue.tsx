"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function OurCatalogue() {
  return (
    <section
      className="py-24 sm:py-32 bg-[#FAF6F0] border-t border-antique-gold/15 overflow-hidden select-none"
      role="region"
      aria-label="Our Catalogue Introduction"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-20 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left Column - Text & Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col items-center md:items-start text-center md:text-left"
        >
          {/* Top Divider Ornament */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 sm:w-20 h-[1px] bg-antique-gold/30" />
            <svg className="w-4 h-4 text-antique-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a1 1 0 0 1 .89.56l2.12 4.29 4.73.69a1 1 0 0 1 .55 1.7l-3.42 3.33.81 4.71a1 1 0 0 1-1.45 1.05L12 16.14l-4.23 2.22a1 1 0 0 1-1.45-1.05l.81-4.71-3.42-3.33a1 1 0 0 1 .55-1.7l4.73-.69 2.12-4.29A1 1 0 0 1 12 2z" />
            </svg>
            <div className="w-12 sm:w-20 h-[1px] bg-antique-gold/30" />
          </div>

          {/* Heading */}
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-light text-[#6B1F2A] uppercase tracking-wider mb-6 text-shadow-luxury animate-fade-in">
            Our Catalogue
          </h2>

          {/* Bottom Divider Ornament */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 sm:w-16 h-[1px] bg-antique-gold/30" />
            <svg className="w-3.5 h-3.5 text-antique-gold/80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a1 1 0 0 1 .89.56l2.12 4.29 4.73.69a1 1 0 0 1 .55 1.7l-3.42 3.33.81 4.71a1 1 0 0 1-1.45 1.05L12 16.14l-4.23 2.22a1 1 0 0 1-1.45-1.05l.81-4.71-3.42-3.33a1 1 0 0 1 .55-1.7l4.73-.69 2.12-4.29A1 1 0 0 1 12 2z" />
            </svg>
            <div className="w-8 sm:w-16 h-[1px] bg-antique-gold/30" />
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-charcoal/80 font-body leading-relaxed max-w-[500px] mb-10 font-light">
            Explore handcrafted bridal couture, intricate embroidery, and premium collections designed for boutiques worldwide. 
            Step into a world of timeless luxury, where Surat’s weaving legacy meets contemporary design.
          </p>

          {/* CTA View Catalogue Button */}
          <div>
            <Link href="/catalog" className="inline-block">
              <motion.div
                whileHover={{ scale: 1.00 }}
                whileTap={{ scale: 0.98 }}
                className="group/btn inline-flex items-center gap-3 px-8 py-3.5 bg-[#6B1F2A] hover:bg-[#52171F] text-ivory rounded-full transition-all duration-[220ms] font-heading text-sm uppercase tracking-wider font-semibold shadow-card hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-[#6B1F2A]/40 cursor-pointer"
                aria-label="View Catalogue"
              >
                <span className="transition-transform duration-[220ms] group-hover/btn:-translate-y-[1px]">
                  View Catalogue
                </span>
                <ArrowRight className="w-4 h-4 transition-transform duration-[220ms] group-hover/btn:translate-x-[6px]" />
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Right Column - Luxury Catalogue Poster Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="relative w-full aspect-square max-w-md mx-auto"
        >
          <Image
            src="/images/Catalogue.png"
            alt="Todi Creation Premium Bridal Catalogue"
            fill
            className="object-cover rounded-[20px] shadow-card hover:shadow-card-hover border border-antique-gold/15 transition-all duration-300 ease-out hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
}
