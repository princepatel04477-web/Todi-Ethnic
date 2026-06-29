"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";

interface ImageCarouselProps {
  imageUrls: string[];
  title: string;
}

export default function ImageCarousel({ imageUrls, title }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Fallback if no images are provided
  const images = imageUrls && imageUrls.length > 0 ? imageUrls : ["/images/hero_banarasi_saree.jpg"];

  // Reset lightbox zoom when active index changes or lightbox is closed
  useEffect(() => {
    setZoomLevel(1);
  }, [activeIndex, isLightboxOpen]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swiped Left - Next Image
      handleNext();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      // Swiped Right - Prev Image
      handlePrev();
    }
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  return (
    <div className="flex flex-col space-y-4 select-none">
      {/* Main Image Container */}
      <div 
        className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-100 dark:border-neutral-900 shadow-luxury group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[activeIndex]}
          alt={`${title} - view ${activeIndex + 1}`}
          fill
          priority={activeIndex === 0}
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Navigation Arrows (Hidden on mobile touch devices, visible on hover on desktop) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full glass-card hover:bg-primary hover:text-white transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 cursor-pointer active-press"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full glass-card hover:bg-primary hover:text-white transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 cursor-pointer active-press"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Lightbox / Zoom Trigger */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 p-2.5 rounded-full glass-card hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer active-press"
          aria-label="Zoom image"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Slide Counter Overlay */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-neutral-950/70 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full text-[10px] font-heading font-medium tracking-widest text-white">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Selection List */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-1 scrollbar-thin select-none">
          {images.map((url, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative flex-shrink-0 w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                activeIndex === index
                  ? "border-primary scale-[0.98] shadow-glow"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={url}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full-Screen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-neutral-950/98 backdrop-blur-md animate-fade-in select-none">
          {/* Lightbox Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 w-full text-white">
            <span className="text-sm font-heading tracking-widest uppercase text-neutral-400">
              {title}
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel === 1}
                className="p-2 rounded-full hover:bg-white/10 text-white disabled:opacity-40 transition-colors cursor-pointer"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel === 3}
                className="p-2 rounded-full hover:bg-white/10 text-white disabled:opacity-40 transition-colors cursor-pointer"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                aria-label="Close view"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Lightbox Image Stage */}
          <div 
            className="flex-1 relative flex items-center justify-center p-4 overflow-hidden"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div 
              className="relative w-full max-w-2xl aspect-[3/4] transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
            >
              <Image
                src={images[activeIndex]}
                alt={`${title} - zoomed view`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 800px"
              />
            </div>
          </div>

          {/* Lightbox Bottom Thumbnails / Indicators */}
          {images.length > 1 && (
            <div className="flex flex-col items-center gap-4 py-6 border-t border-white/10">
              <div className="flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeIndex === index ? "w-6 bg-primary" : "w-1.5 bg-neutral-600"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
