"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  desktopImage: string;
  mobileImage: string;
  link: string;
  title: string;
}

const slides: Slide[] = [
  {
    desktopImage: "/images/hero/bridal_hero_upscaled.png",
    mobileImage: "/images/hero/mobile_bridal_v2.png",
    link: "/catalog?category=Bridal+Lehenga",
    title: "Todi Creation Signature Collection",
  },
  {
    desktopImage: "/images/hero/indowestern_hero_upscaled.png",
    mobileImage: "/images/hero/mobile_indowestern_v2.png",
    link: "/catalog?category=Indo+Western",
    title: "Indo Western Catalog",
  },
  {
    desktopImage: "/images/hero/sider_hero_upscaled.png",
    mobileImage: "/images/hero/mobile_sider_v2.png",
    link: "/catalog?category=Sider+Lehenga",
    title: "Sider Lehenga Collections",
  },
  {
    desktopImage: "/images/hero/farsi_hero_upscaled.png",
    mobileImage: "/images/hero/mobile_farsi_v2.png",
    link: "/catalog?category=Farsi+Lehenga",
    title: "Farsi Lehenga Custom Designs",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 1,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 1,
  }),
};

export default function LuxuryHero() {
  const [[currentSlide, direction], setPage] = useState<[number, number]>([0, 1]);
  const [autoplay, setAutoplay] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe gesture variables
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const paginate = (newDirection: number) => {
    setPage(([prevPage]) => {
      let nextPage = prevPage + newDirection;
      if (nextPage >= slides.length) nextPage = 0;
      if (nextPage < 0) nextPage = slides.length - 1;
      return [nextPage, newDirection];
    });
  };

  // Autoplay handler (continuous 4.5-second slide cycle)
  useEffect(() => {
    if (autoplay) {
      autoplayTimerRef.current = setInterval(() => {
        paginate(1);
      }, 4500);
    }
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [autoplay, currentSlide]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== containerRef.current) return;
      if (e.key === "ArrowLeft") {
        paginate(-1);
      } else if (e.key === "ArrowRight") {
        paginate(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Gesture Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
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
    if (touchStartX === null || touchStartY === null || touchEndX === null || touchEndY === null) return;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        paginate(1);
      } else {
        paginate(-1);
      }
    }
  };

  const activeSlideIndex = ((currentSlide % slides.length) + slides.length) % slides.length;
  const activeSlide = slides[activeSlideIndex];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="group/hero relative w-full aspect-[1536/2752] sm:aspect-[6144/3604] bg-aubergine-black overflow-hidden select-none focus:outline-none focus:ring-1 focus:ring-antique-gold/30"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Todi Creation B2B Collections Showcase"
    >
      {/* Slides Viewports with Horizontal Slide In/Out Animation */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 32 },
              opacity: { duration: 0.3 }
            }}
            className="absolute inset-0 w-full h-full"
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${activeSlideIndex + 1} of ${slides.length}: ${activeSlide.title}`}
          >
            <Link href={activeSlide.link} className="block relative w-full h-full cursor-pointer focus:outline-none">
              <div className="relative w-full h-full overflow-hidden transform-gpu">
                {/* Desktop / Laptop Viewport Banner */}
                <Image
                  src={activeSlide.desktopImage}
                  alt={activeSlide.title}
                  fill
                  priority
                  className="hero-image hidden sm:block object-cover object-center transform-gpu"
                  sizes="100vw"
                />
                {/* Mobile / Tablet Viewport Banner */}
                <Image
                  src={activeSlide.mobileImage}
                  alt={activeSlide.title}
                  fill
                  priority
                  className="hero-image block sm:hidden object-cover object-center transform-gpu"
                  sizes="100vw"
                />
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Glass Navigation Arrows (Hidden on Mobile) */}
      <div className="hidden md:block absolute left-4 inset-y-0 z-20 flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            paginate(-1);
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
            paginate(1);
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
          const isActive = index === activeSlideIndex;
          return (
            <button
              key={index}
              onClick={() => {
                const newDirection = index > activeSlideIndex ? 1 : -1;
                setPage([index, newDirection]);
              }}
              className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-500 cursor-pointer ${
                isActive ? "w-16 bg-ivory/20" : "w-1.5 bg-ivory/40 hover:bg-ivory/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {isActive && (
                <motion.span
                  key={currentSlide}
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 4.5, ease: "linear" }}
                  className="absolute left-0 top-0 h-full w-full bg-antique-gold"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
