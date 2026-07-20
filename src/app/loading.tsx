"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF8F5]/95 dark:bg-aubergine-black/95 backdrop-blur-md transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center space-y-6 max-w-sm px-4 text-center select-none"
      >
        {/* Logo container with subtle glowing aura */}
        <div className="relative flex items-center justify-center p-4">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-4 rounded-full bg-gradient-to-tr from-antique-gold/20 via-antique-gold/10 to-transparent blur-xl"
          />
          <Image
            src="/logo.png"
            alt="TODI CREATIONS"
            width={320}
            height={113}
            className="h-20 sm:h-28 w-auto object-contain relative z-10 drop-shadow-sm"
            priority
          />
        </div>

        {/* Elegant Animated Gold Accent Bar & Subtitle */}
        <div className="flex flex-col items-center space-y-3 w-full">
          <div className="w-36 h-[2px] bg-gradient-to-r from-transparent via-antique-gold to-transparent relative overflow-hidden rounded-full">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-white/60 w-1/2"
            />
          </div>

          <span className="text-[10px] font-number tracking-[0.35em] text-[#8C6D3B] dark:text-antique-gold uppercase font-medium">
            Loading Heritage Collection...
          </span>
        </div>
      </motion.div>
    </div>
  );
}
