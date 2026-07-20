"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function InitialWebLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dismiss initial loader after 1.4s
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#FAF6F0] select-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center space-y-8 max-w-md px-6 text-center"
          >
            {/* Logo container with glowing gold aura */}
            <div className="relative flex items-center justify-center p-6">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.25, 0.5, 0.25],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -inset-6 rounded-full bg-gradient-to-tr from-antique-gold/30 via-[#B29567]/20 to-transparent blur-2xl"
              />
              <Image
                src="/logo.png"
                alt="TODI CREATIONS"
                width={450}
                height={71}
                className="h-16 sm:h-22 w-auto object-contain relative z-10 drop-shadow-md"
                priority
              />
            </div>

            {/* Gold Accent Progress Line */}
            <div className="flex flex-col items-center space-y-3 w-full max-w-xs">
              <div className="w-44 h-[2.5px] bg-antique-gold/20 relative overflow-hidden rounded-full">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-antique-gold via-[#8C6D3B] to-antique-gold"
                />
              </div>

              <span className="text-[11px] font-number tracking-[0.4em] text-[#6B1F2A] uppercase font-semibold">
                TODI CREATION
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
