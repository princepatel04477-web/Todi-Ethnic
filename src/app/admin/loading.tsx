"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AdminLoading() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh] text-center select-none bg-zinc-950 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center space-y-5"
      >
        <div className="relative p-2">
          <Image
            src="/logo.png"
            alt="TODI CREATIONS"
            width={280}
            height={99}
            className="h-16 sm:h-20 w-auto object-contain drop-shadow-md brightness-110"
            priority
          />
        </div>

        <div className="flex flex-col items-center space-y-2">
          <div className="w-28 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent relative overflow-hidden rounded-full">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-white/40 w-1/2"
            />
          </div>
          <span className="text-[9px] font-number tracking-[0.4em] text-zinc-400 uppercase font-medium">
            Admin Panel Loading...
          </span>
        </div>
      </motion.div>
    </div>
  );
}
