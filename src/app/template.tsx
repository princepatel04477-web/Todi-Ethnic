"use client";

import React, { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

function TemplateContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 1, 0.5, 1], // easeOut
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <TemplateContent>{children}</TemplateContent>
    </Suspense>
  );
}
