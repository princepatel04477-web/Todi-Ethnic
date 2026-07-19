"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  desktopImage: string;
  mobileImage: string;
  link: string;
  title: string;
}

const slides: Slide[] = [
  {
    desktopImage: "/images/hero/Carousel_1_.png",
    mobileImage: "/images/hero/mobile_bridal.jpeg",
    link: "/catalog",
    title: "Todi Creation Signature Collection",
  },
  {
    desktopImage: "/images/hero/indowestern_with_logo.jpg",
    mobileImage: "/images/hero/indowestern_with_logo_mobile.jpg",
    link: "/catalog?category=Indo+Western",
    title: "Indo Western Catalog",
  },
  {
    desktopImage: "/images/hero/sider_with_logo.jpg",
    mobileImage: "/images/hero/sider_with_logo_mobile.jpg",
    link: "/catalog?category=Sider+Lengha",
    title: "Sider Lengha Collections",
  },
  {
    desktopImage: "/images/hero/farsi_with_logo.jpg",
    mobileImage: "/images/hero/farsi_with_logo_mobile.jpg",
    link: "/catalog?category=Farsi+Lengha",
    title: "Farsi Lengha Custom Designs",
  },
];

export default function LuxuryHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe gesture variables
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Autoplay handler (6-second cycle)
  useEffect(() => {
    if (autoplay) {
      autoplayTimerRef.current = setInterval(() => {
        nextSlide();
      }, 6000);
    }
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [autoplay, currentSlide]);

  // GSAP Ken Burns Slow Zoom Transition
  useEffect(() => {
    const ctx = gsap.context((self) => {
      const activeImage = self.selector?.(".opacity-100 .hero-image");
      if (activeImage && activeImage.length > 0) {
        // Subtle slow zoom scaling from 1.04 down to 1.00 over 6s
        gsap.fromTo(
          activeImage,
          { scale: 1.04 },
          {
            scale: 1,
            duration: 6,
            ease: "sine.out",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [currentSlide]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== containerRef.current) return;
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Gesture Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setAutoplay(false);
    setTouchEndX(null);
    setTouchEndY(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    setAutoplay(true);
    if (touchStartX === null || touchStartY === null || touchEndX === null || touchEndY === null) return;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="group/hero relative w-full aspect-[1536/2752] sm:aspect-[1536/1024] bg-aubergine-black overflow-hidden select-none focus:outline-none focus:ring-1 focus:ring-antique-gold/30"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
      onFocus={() => setAutoplay(false)}
      onBlur={() => setAutoplay(true)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Todi Creation B2B Collections Showcase"
    >
      {/* Slides Viewports */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              style={{
                pointerEvents: isActive ? "auto" : "none",
                zIndex: isActive ? 10 : 0,
              }}
              className="absolute inset-0 w-full h-full"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${slides.length}: ${slide.title}`}
              aria-hidden={!isActive}
            >
              <Link href={slide.link} className="block relative w-full h-full cursor-pointer focus:outline-none">
                <div className="relative w-full h-full overflow-hidden transform-gpu">
                  {/* Desktop / Laptop Viewport Banner */}
                  <Image
                    src={slide.desktopImage}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    className="hero-image hidden sm:block object-cover object-center transform-gpu"
                    sizes="100vw"
                  />
                  {/* Mobile / Tablet Viewport Banner */}
                  <Image
                    src={slide.mobileImage}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    className="hero-image block sm:hidden object-cover object-center transform-gpu"
                    sizes="100vw"
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop Glass Navigation Arrows (Hidden on Mobile) */}
      <div className="hidden md:block absolute left-4 inset-y-0 z-20 flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="w-16 h-32 flex items-center justify-center bg-transparent border-0 opacity-0 group-hover/hero:opacity-100 transition-opacity duration-300 focus:opacity-100 focus:outline-none cursor-pointer"
          aria-label="Previous slide"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-ivory/10 hover:bg-ivory/20 border border-ivory/15 backdrop-blur-md text-ivory/70 hover:text-ivory transition-all duration-300 shadow-sm active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </div>
        </button>
      </div>

      <div className="hidden md:block absolute right-4 inset-y-0 z-20 flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="w-16 h-32 flex items-center justify-center bg-transparent border-0 opacity-0 group-hover/hero:opacity-100 transition-opacity duration-300 focus:opacity-100 focus:outline-none cursor-pointer"
          aria-label="Next slide"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-ivory/10 hover:bg-ivory/20 border border-ivory/15 backdrop-blur-md text-ivory/70 hover:text-ivory transition-all duration-300 shadow-sm active:scale-95">
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Apple-style Capsule Progress Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, index) => {
          const isActive = index === currentSlide;
          return (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
              }}
              className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-500 cursor-pointer ${
                isActive ? "w-16 bg-ivory/20" : "w-1.5 bg-ivory/40 hover:bg-ivory/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-0 h-full bg-antique-gold animate-slide-progress"
                  style={{
                    animationPlayState: autoplay ? "running" : "paused",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
