import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import B2BSection from "@/components/ui/B2BSection";
import RevealSection from "@/components/ui/RevealSection";
import AboutSection from "@/components/ui/AboutSection";
import ExportCountries from "@/components/ui/ExportCountries";
import DeliveryAndPolicy from "@/components/ui/DeliveryAndPolicy";
import ExportGlobe from "@/components/ui/ExportGlobe";

export const metadata = {
  title: "Wholesale Lehenga Manufacturer & Exporter | Todi Creations, Surat",
  description: "Direct-from-manufacturer wholesale Lehenga supply. Minimum 25 pieces, handmade embroidery, worldwide shipping. Partner with Todi Creations, Surat since 2011.",
};

export default function WholesalePage() {
  return (
    <div className="flex flex-col min-h-screen bg-ivory text-charcoal transition-colors duration-300">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 text-center bg-[#FDF9F3] border-b border-[#EADFCF]/50 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none flex justify-between items-center px-4">
            <div className="w-40 h-40 rounded-full border border-antique-gold translate-x-[-50%]" />
            <div className="w-40 h-40 rounded-full border border-antique-gold translate-x-[50%]" />
          </div>
          <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-4 animate-fade-in">
            <span className="text-[10px] font-heading font-semibold tracking-[0.25em] text-[#B29567] uppercase block">
              Wholesale Manufacturing
            </span>
            <h1 className="text-3xl sm:text-5xl font-heading font-light text-deep-maroon tracking-tight leading-tight">
              Partner With Surat&apos;s Trusted Lehenga Manufacturer
            </h1>
            <p className="text-xs sm:text-sm text-warm-grey max-w-2xl mx-auto font-light leading-relaxed">
              Direct from our Surat workshop. Minimum 25 pieces, handmade embroidery, worldwide shipping since 2011.
            </p>
            <div className="pt-4">
              <a
                href="#b2b-form"
                className="inline-flex items-center gap-2 px-8 py-4 bg-royal-maroon hover:bg-wine-red text-warm-ivory text-xs font-heading font-semibold uppercase tracking-wider rounded-none transition-all duration-300 active-press hover-lift"
              >
                Submit Wholesale Inquiry
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Manufacturing Heritage Section */}
        <RevealSection>
          <section className="py-24 bg-ivory px-6 sm:px-12 md:px-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 select-none">
                <span className="text-xs uppercase tracking-[0.3em] text-deep-maroon font-heading font-semibold mb-4 block">
                  Artisanal Legacy
                </span>
                <h2 className="text-3xl sm:text-5xl font-heading font-light tracking-tight text-deep-maroon mb-6 leading-[1.15] text-shadow-luxury">
                  Preserving the Soul of Surat&apos;s Weaving Heritage
                </h2>
                <p className="text-sm text-charcoal/85 font-body leading-relaxed mb-6 font-light">
                  At Todi Creation, manufacturing is an act of devotion. Established in 2011, our Surat workshops house master craftspeople who translate dreams into reality. We handle everything in-house, from sourcing the finest metallic zari to detailing custom embroideries.
                </p>
                <p className="text-sm text-charcoal/85 font-body leading-relaxed font-light mb-8">
                  By combining centuries-old handloom techniques with modern quality assurance, we create bridal and festive collections that are shipped to premium boutiques globally.
                </p>
                <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-deep-maroon hover:text-deep-maroon/80 uppercase tracking-wider hover-underline">
                  Browse Our Collections
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="lg:col-span-7 relative flex justify-center items-center">
                <div className="relative w-full max-w-md aspect-square border border-antique-gold/20 p-3 bg-ivory shadow-card rounded-[20px] translate-x-2 translate-y-2 overflow-hidden">
                  <div className="relative w-full h-full rounded-[12px] overflow-hidden">
                    <Image
                      src="/images/Square_poster.png"
                      alt="Artisanal Handloom Weaving"
                      fill
                      className="object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 450px"
                    />
                  </div>
                </div>
                <div className="absolute -top-4 -left-4 w-32 h-32 border-l border-t border-antique-gold/30 pointer-events-none hidden sm:block" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 border-r border-b border-antique-gold/30 pointer-events-none hidden sm:block" />
              </div>
            </div>
          </section>
        </RevealSection>

        {/* Brand Story Section */}
        <RevealSection>
          <AboutSection />
        </RevealSection>

        {/* Global Footprint / Export Globe */}
        <RevealSection>
          <ExportGlobe />
        </RevealSection>

        {/* Manufacturing Excellence Cards */}
        <RevealSection>
          <section className="py-24 bg-ivory border-t border-antique-gold/15 px-6 sm:px-12 md:px-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-16 select-none">
                <span className="text-xs uppercase tracking-[0.3em] text-deep-maroon font-heading font-semibold mb-3 block">
                  Artisanal Standards
                </span>
                <h2 className="text-3xl sm:text-4xl font-heading font-light tracking-tight text-deep-maroon text-shadow-luxury">
                  Manufacturing Excellence
                </h2>
                <p className="text-sm text-warm-grey mt-3 font-light">
                  Every thread, stitch, and finish undergoes rigorous craftsmanship checks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 border border-antique-gold/15 bg-[#FDF9F3] rounded-[20px] shadow-card text-left relative flex flex-col justify-between transition-all duration-300 ease-out hover:translate-y-[-8px] hover:scale-[1.02] hover:shadow-card-hover">
                  <div>
                    <span className="font-heading text-4xl text-antique-gold/50 font-light block mb-4">01</span>
                    <h3 className="text-xl font-heading font-semibold text-deep-maroon mb-3">Heritage Weaving</h3>
                    <p className="text-xs font-body text-charcoal/80 leading-relaxed font-light">
                      Our master weavers blend premium mulberry silk and metallic gold yarns on traditional and modern jacquard looms to form breathtaking, highly detailed borders and brocades.
                    </p>
                  </div>
                  <div className="border-t border-antique-gold/10 pt-4 mt-6">
                    <span className="text-[10px] uppercase tracking-widest text-warm-grey font-semibold">Banarasi & Silk Blends</span>
                  </div>
                </div>

                <div className="p-8 border border-antique-gold/15 bg-[#FDF9F3] rounded-[20px] shadow-card text-left relative flex flex-col justify-between transition-all duration-300 ease-out hover:translate-y-[-8px] hover:scale-[1.02] hover:shadow-card-hover">
                  <div>
                    <span className="font-heading text-4xl text-antique-gold/50 font-light block mb-4">02</span>
                    <h3 className="text-xl font-heading font-semibold text-deep-maroon mb-3">Handmade Embroidery</h3>
                    <p className="text-xs font-body text-charcoal/80 leading-relaxed font-light">
                      Our embroidery workshops hand-sew meticulous zardozi, Resham thread, cutdana, and sequined embellishments. A single heavy bridal lehenga panel can take up to three weeks.
                    </p>
                  </div>
                  <div className="border-t border-antique-gold/10 pt-4 mt-6">
                    <span className="text-[10px] uppercase tracking-widest text-warm-grey font-semibold">Custom Zardozi & Resham</span>
                  </div>
                </div>

                <div className="p-8 border border-antique-gold/15 bg-[#FDF9F3] rounded-[20px] shadow-card text-left relative flex flex-col justify-between transition-all duration-300 ease-out hover:translate-y-[-8px] hover:scale-[1.02] hover:shadow-card-hover">
                  <div>
                    <span className="font-heading text-4xl text-antique-gold/50 font-light block mb-4">03</span>
                    <h3 className="text-xl font-heading font-semibold text-deep-maroon mb-3">Premium Finishing</h3>
                    <p className="text-xs font-body text-charcoal/80 leading-relaxed font-light">
                      Each garment is polished, hand-steamed, and detailed with premium linings and custom tassels. We guarantee flawless structural integrity and draping flow.
                    </p>
                  </div>
                  <div className="border-t border-antique-gold/10 pt-4 mt-6">
                    <span className="text-[10px] uppercase tracking-widest text-warm-grey font-semibold">Flawless Drape Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* B2B SEO authority section (Princeton GEO-optimized) */}
        <RevealSection>
          <section className="py-24 bg-[#FDF9F3] border-t border-b border-antique-gold/15 px-6 sm:px-12 md:px-20">
            <div className="max-w-4xl mx-auto space-y-12 select-none">
              <div className="text-center">
                <span className="text-xs uppercase tracking-[0.3em] text-[#B29567] font-heading font-semibold mb-3 block">
                  B2B Wholesale Partnering
                </span>
                <h2 className="text-3xl sm:text-4xl font-heading font-light tracking-tight text-deep-maroon text-shadow-luxury leading-snug">
                  Surat&apos;s Leading B2B Lehenga Manufacturer & Wholesale Exporter
                </h2>
              </div>

              <div className="prose prose-stone max-w-none text-sm text-charcoal/90 leading-relaxed font-light space-y-6 font-body">
                <p>
                  <strong>Todi Creations</strong> (established in 2011 in Surat, Gujarat) is a premier B2B ethnic wear manufacturer specializing in wholesale bridal lehengas, Farsi trails, sider lehengas, and Indo-Western wear. Over the last 15 years, we have scaled our production capacity to serve <strong>1,700+ boutique partners</strong> across <strong>17+ countries</strong> (including the US, UK, UAE, Canada, Australia, and Mauritius).
                </p>

                <div className="my-8 p-6 bg-ivory border-l-4 border-antique-gold shadow-sm rounded-r-lg italic text-[#6B1F2A] relative">
                  <p className="font-heading text-base leading-relaxed mb-2 font-medium">
                    &ldquo;Our focus has always been on combining authentic Surat craftsmanship with modern B2B supply chain reliability. Every single panel is hand-reviewed by our master karigars to ensure it meets our strict export quality standards before dispatch.&rdquo;
                  </p>
                  <span className="text-xs font-heading uppercase tracking-wider text-warm-grey not-italic font-bold">
                    — Prince Patel, Head of Operations & Quality Assurance, Todi Creations
                  </span>
                </div>

                <h3 className="text-lg font-heading font-semibold text-deep-maroon mt-8 mb-4">
                  Direct-from-Manufacturer Bulk Lehenga Supply & Custom MOQs
                </h3>
                <p>
                  We offer a highly competitive wholesale structure designed for wedding designers, styling boutique owners, and retail chain distributors:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                  <li><strong>Low Minimum Order Quantity (MOQ):</strong> Start with just <strong>25 pieces</strong> mixed catalog, allowing boutiques to test new designer patterns without inventory risk.</li>
                  <li><strong>Monthly Production Capacity:</strong> Over <strong>5,000+ hand-embroidered lehengas</strong> processed in our state-of-the-art Surat manufacturing workshop.</li>
                  <li><strong>Customization Options:</strong> Tailored blouse cuts, custom colorways, custom border attachments, and custom branding tags.</li>
                </ul>

                <h3 className="text-lg font-heading font-semibold text-deep-maroon mt-8 mb-4">
                  B2B Manufacturing Specifications & Capabilities
                </h3>
                <div className="overflow-x-auto my-6 border border-antique-gold/15 rounded-lg">
                  <table className="min-w-full divide-y divide-antique-gold/15 text-xs sm:text-sm">
                    <thead className="bg-ivory text-deep-maroon font-heading font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-3 text-left">Specification / Service</th>
                        <th className="px-6 py-3 text-left">Details & B2B Terms</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-antique-gold/15 bg-white text-charcoal/85">
                      <tr>
                        <td className="px-6 py-4 font-semibold">Established Year</td>
                        <td className="px-6 py-4">2011 (Surat, Gujarat, India)</td>
                      </tr>
                      <tr className="bg-ivory/30">
                        <td className="px-6 py-4 font-semibold">Wholesale MOQ</td>
                        <td className="px-6 py-4">25 Pieces (Mixed catalog & sizes allowed)</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold">Export Countries</td>
                        <td className="px-6 py-4">United States, United Kingdom, Canada, UAE, Australia, Mauritius, South Africa, Fiji</td>
                      </tr>
                      <tr className="bg-ivory/30">
                        <td className="px-6 py-4 font-semibold">Premium Fabrics</td>
                        <td className="px-6 py-4">Raw Silk, Bridal Georgette, Velvet, Banarasi Brocade, Net, Crepe</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold">Embroidery Work</td>
                        <td className="px-6 py-4">Handcrafted Zardozi, Resham Threadwork, Cutdana, Sequin Embellishments, Dabka</td>
                      </tr>
                      <tr className="bg-ivory/30">
                        <td className="px-6 py-4 font-semibold">Boutique Customization</td>
                        <td className="px-6 py-4">Custom sizing, sizing templates, private labelling, custom necklines</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold">Production Time</td>
                        <td className="px-6 py-4">14 to 28 days depending on design heavy-work complexity</td>
                      </tr>
                      <tr className="bg-ivory/30">
                        <td className="px-6 py-4 font-semibold">Global Air Cargo Shipping</td>
                        <td className="px-6 py-4">5 to 7 business days via DHL, FedEx, or UPS express air freight</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-heading font-semibold text-deep-maroon mt-8 mb-4">
                  Authentic Surat Zardozi Artistry & Premium Weaving
                </h3>
                <p>
                  Our manufacturing unit houses over 120 skilled karigars specializing in traditional embroidery. A single heavy bridal lehenga panel can take up to three weeks of meticulous hand-sewing, combining antique zardozi, Resham thread, cutdana, and sequins. We source direct-from-mill raw silk and premium georgette to ensure a fluid drape and flawless durability, allowing boutique partners to command high retail margins.
                </p>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* Logistics & Timelines Section */}
        <RevealSection>
          <DeliveryAndPolicy />
        </RevealSection>

        {/* B2B Buyer Segmentation, Process, and Inquiry Form (Orders III, V, VI) */}
        <B2BSection />
      </main>

      <Footer />
    </div>
  );
}
