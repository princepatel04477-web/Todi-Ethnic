"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useBag } from "@/context/BagContext";

export default function Header() {
  const { totalCount, toggleDrawer } = useBag();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ease-out select-none ${
        hasScrolled
          ? "bg-ivory/95 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border-b border-antique-gold/20"
          : "bg-ivory/90 border-b border-antique-gold/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 lg:py-6">
          {/* Mobile Menu Icon */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="p-2 text-charcoal hover:text-deep-maroon focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="relative text-sm font-heading tracking-widest text-charcoal hover:text-deep-maroon transition-colors uppercase py-1 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-antique-gold after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              Home
            </Link>
            <Link
              href="/catalog"
              className="relative text-sm font-heading tracking-widest text-charcoal hover:text-deep-maroon transition-colors uppercase py-1 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-antique-gold after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              Catalog
            </Link>
            <Link
              href="/contact"
              className="relative text-sm font-heading tracking-widest text-charcoal hover:text-deep-maroon transition-colors uppercase py-1 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-antique-gold after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              Contact
            </Link>
          </nav>

          {/* Brand Logo */}
          <div className="flex-1 flex justify-center md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link href="/" className="flex flex-col items-center">
              <Image
                src="/logo_1.png"
                alt="Todi Creation Logo"
                width={360}
                height={240}
                className="h-28 lg:h-36 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Icons Actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="/catalog"
              className="p-2 text-charcoal hover:text-deep-maroon transition-colors"
              aria-label="Search Catalog"
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: 3 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <Search className="w-5 h-5" />
              </motion.div>
            </Link>

            {/* Shopping/Inquiry Bag Trigger */}
            <button
              onClick={toggleDrawer}
              className="relative p-2 text-charcoal hover:text-deep-maroon transition-colors active-press cursor-pointer"
              aria-label="Inquiry bag"
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: 3 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-antique-gold text-[8px] font-bold text-aubergine-black shadow-sm">
                    {totalCount}
                  </span>
                )}
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-antique-gold/15 bg-ivory/95 backdrop-blur-md px-4 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-heading font-medium tracking-wide text-charcoal hover:text-deep-maroon transition-colors uppercase"
          >
            Home
          </Link>
          <Link
            href="/catalog"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-heading font-medium tracking-wide text-charcoal hover:text-deep-maroon transition-colors uppercase"
          >
            Catalog
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-heading font-medium tracking-wide text-charcoal hover:text-deep-maroon transition-colors uppercase"
          >
            Contact
          </Link>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              toggleDrawer();
            }}
            className="w-full text-left block px-3 py-2 text-base font-heading font-medium tracking-wide text-charcoal hover:text-deep-maroon transition-colors uppercase cursor-pointer"
          >
            Inquiry Bag ({totalCount})
          </button>
        </div>
      )}
    </motion.header>
  );
}
