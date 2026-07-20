import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SEOJsonLd from "@/components/seo/SEOJsonLd";
import LuxuryHero from "@/components/ui/LuxuryHero";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import OurCatalogue from "@/components/ui/OurCatalogue";
import RevealSection from "@/components/ui/RevealSection";
import ExportGlobe from "@/components/ui/ExportGlobe";

const categories = [
  {
    name: "Bridal Lehenga",
    subtitle: "Heavy hand-embroidery & classic royal motifs",
    image: "/images/categories/bridal-poster.png",
    link: "/catalog?category=Bridal+Lehenga",
    count: "01",
    translateClass: "md:translate-y-0",
  },
  {
    name: "Sider Lehenga",
    subtitle: "Intricate modern designs for bridesmaids & festivals",
    image: "/images/categories/sider-poster.png",
    link: "/catalog?category=Sider+Lehenga",
    count: "02",
    translateClass: "md:translate-y-8",
  },
  {
    name: "Farsi Lehenga",
    subtitle: "Graceful trail and traditional vintage textures",
    image: "/images/categories/farsi-poster.png",
    link: "/catalog?category=Farsi+Lehenga",
    count: "03",
    translateClass: "md:-translate-y-4",
  },
  {
    name: "Indo Western",
    subtitle: "Contemporary cuts and fusion bridal aesthetics",
    image: "/images/categories/indowestern-poster.png",
    link: "/catalog?category=Indo+Western",
    count: "04",
    translateClass: "md:translate-y-4",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-ivory text-charcoal transition-colors duration-300">
      {/* SEO Schema Markup */}
      <SEOJsonLd renderOrganization renderLocalBusiness />

      {/* Header Navigation */}
      <Header />

      {/* Premium B2B Signal Banner (Above the fold) (Order II) */}
      <div className="bg-aubergine-black text-ivory border-y border-antique-gold/15 select-none text-center">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center items-center divide-x divide-antique-gold/10 text-[9px] sm:text-xs">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
              <span className="font-heading font-bold uppercase tracking-wider text-antique-gold">Wholesale Manufacturer</span>
              <span className="opacity-60 text-[9px]">Since 2011</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 border-l border-antique-gold/10 md:border-l-0">
              <span className="font-heading font-bold uppercase tracking-wider text-antique-gold">Low Custom MOQ</span>
              <span className="opacity-60 text-[9px]">Min. 25 Pieces</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 border-l border-antique-gold/10 md:border-l-0">
              <span className="font-heading font-bold uppercase tracking-wider text-antique-gold">Worldwide Shipping</span>
              <span className="opacity-60 text-[9px]">Export Service</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 border-l border-antique-gold/10 md:border-l-0">
              <span className="font-heading font-bold uppercase tracking-wider text-antique-gold">Who We Serve</span>
              <span className="opacity-60 text-[8px] sm:text-[9px]">Boutiques & Exporters</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow">
        {/* Luxury Hero Slider */}
        <LuxuryHero />

        {/* Brand Statement Section */}
        <RevealSection delay={0.1}>
          <section className="py-20 bg-ivory text-center px-6 sm:px-12 md:px-20 border-b border-antique-gold/15 select-none">
            <span className="text-xs uppercase tracking-[0.25em] text-deep-maroon font-heading font-semibold mb-3 block">
              Surat&apos;s Finest Designer Ethnic Wear
            </span>
            <h1 className="text-3xl sm:text-5xl font-heading font-light tracking-tight text-deep-maroon mb-6 max-w-4xl mx-auto leading-tight text-shadow-luxury">
              Crafting Luxury Heritage for Modern Boutiques
            </h1>
            <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed max-w-2xl mx-auto font-light">
              We manufacture premium bridal lehengas, traditional lehengas, delicate hand-worked options, 
              and Indo Western designs that blend authentic Indian heritage with contemporary fashion sensibilities. 
              Every drape tells a story of meticulous detail and quality craftsmanship.
            </p>
          </section>
        </RevealSection>

        {/* Featured Categories Section */}
        <RevealSection delay={0.2}>
          <section className="py-24 bg-ivory border-t border-b border-antique-gold/15 px-6 sm:px-12 md:px-20">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16">
                <div className="select-none">
                  <span className="text-xs uppercase tracking-[0.3em] text-deep-maroon font-heading font-semibold mb-2 block">
                    Curated Collections
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-heading font-light tracking-tight text-deep-maroon text-shadow-luxury">
                    Explore Categories
                  </h2>
                </div>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-1.5 text-sm font-heading font-semibold tracking-wider text-deep-maroon hover:text-deep-maroon/80 uppercase mt-4 sm:mt-0 transition-colors hover-underline"
                >
                  Browse All Collections
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Asymmetric Elegant Categories Grid */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 md:pb-12">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className={`w-full aspect-[2/3] ${category.translateClass} transition-transform duration-500`}
                  >
                    <Link
                      href={category.link}
                      className="group relative w-full h-full flex flex-col justify-end p-4 sm:p-6 overflow-hidden border border-antique-gold/15 bg-[#FDF9F3] rounded-[20px] shadow-card transition-all duration-300 ease-out hover:translate-y-[-8px] hover:scale-[1.02] hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-antique-gold/50 cursor-pointer"
                      role="group"
                      aria-label={`Explore Category: ${category.name}`}
                    >
                      {/* Category Image */}
                      <div className="absolute inset-0">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          loading="lazy"
                          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        {/* Gradient Editorial Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-deep-maroon/50 via-deep-maroon/10 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10 text-ivory select-none transform transition-transform duration-500 group-hover:-translate-y-1">
                        <span className="text-[8px] sm:text-[10px] font-heading tracking-[0.25em] text-antique-gold uppercase block mb-1">
                          Collection {category.count}
                        </span>
                        <h3 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-heading tracking-wide mb-1 font-medium leading-tight text-shadow-luxury">
                          {category.name}
                        </h3>
                        <p className="text-[9px] sm:text-[11px] font-body opacity-80 font-light line-clamp-2">
                          {category.subtitle}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* Manufacturing Excellence & Trust Section — Premium 3D Export Globe */}
        <RevealSection>
          <ExportGlobe />
        </RevealSection>

        {/* Our Catalogue Introduction Section */}
        <RevealSection>
          <OurCatalogue />
        </RevealSection>

      </main>

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
}
