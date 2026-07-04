"use client";

import React from "react";
import { motion } from "framer-motion";

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function RevealSection({
  children,
  className = "",
  delay = 0,
}: RevealSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 1, 0.5, 1], // Apple-style easeOut
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
