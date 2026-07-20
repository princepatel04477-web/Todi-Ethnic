"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, Mail, MessageSquare } from "lucide-react";
import { getContactConfig } from "@/lib/services/contactConfig";

export default function Footer() {
  const config = getContactConfig();
  const [showAdminLink, setShowAdminLink] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )todi_admin_ip=([^;]*)/);
    const hasAdminIp = match ? match[1] === "true" : false;
    
    const isPlaceholder = 
      (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) &&
      process.env.NODE_ENV !== "production";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowAdminLink(hasAdminIp || isPlaceholder);
  }, []);

  return (
    <footer className="bg-aubergine-black text-ivory border-t border-ivory/10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="TODI CREATIONS"
                width={450}
                height={64}
                className="h-12 sm:h-16 w-auto object-contain drop-shadow-md"
              />
            </Link>
            <p className="text-xs leading-relaxed text-ivory/70 font-light max-w-sm">
              Surat-based manufacturer and exporter of premium designer ethnic wear, established in 2011. Trusted by 1700+ boutique partners across 17+ countries.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-heading tracking-[0.2em] font-semibold text-antique-gold uppercase">
              Collections
            </h3>
            <ul className="space-y-2 text-xs font-light">
              <li>
                <Link href="/bridal" className="text-ivory/80 hover:text-antique-gold transition-colors">
                  Bridal Lehenga
                </Link>
              </li>
              <li>
                <Link href="/farsi-lehengas" className="text-ivory/80 hover:text-antique-gold transition-colors">
                  Farsi Lehenga
                </Link>
              </li>
              <li>
                <Link href="/sider-lehengas" className="text-ivory/80 hover:text-antique-gold transition-colors">
                  Sider Lehenga
                </Link>
              </li>
              <li>
                <Link href="/indo-western" className="text-ivory/80 hover:text-antique-gold transition-colors">
                  Indo Western
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-xs font-heading tracking-[0.2em] font-semibold text-antique-gold uppercase">
              Customer Area
            </h3>
            <ul className="space-y-2 text-xs font-light">
              <li>
                <Link href="/catalog" className="text-ivory/80 hover:text-antique-gold transition-colors">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link href="/inquiry-bag" className="text-ivory/80 hover:text-antique-gold transition-colors">
                  View Inquiry Bag
                </Link>
              </li>
              {showAdminLink && (
                <li>
                  <Link href="/login" className="text-ivory/80 hover:text-antique-gold transition-colors">
                    Admin Login
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-heading tracking-[0.2em] font-semibold text-antique-gold uppercase">
              Bespoke Inquiries
            </h3>
            <ul className="space-y-3 text-xs font-light text-ivory/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-antique-gold shrink-0 mt-0.5" />
                <span className="leading-relaxed whitespace-pre-line">
                  {config.address}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-antique-gold shrink-0" />
                <span>{config.phoneNumber}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-antique-gold shrink-0" />
                <span>{config.businessEmail}</span>
              </li>
              <li>
                <a
                  href={`https://wa.me/${config.whatsAppNumber}?text=Hello%20Todi%20Creations,%20I%20am%20interested%20in%20your%20ethnic%20wear%20wholesale%20collection.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-antique-gold hover:text-soft-champagne font-medium hover:underline cursor-pointer"
                  aria-label="Direct inquiry on WhatsApp"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>WhatsApp Direct Inquiry</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ivory/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-light text-ivory/60">
          <p>© 2026 Todi Creation. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-antique-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-antique-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
