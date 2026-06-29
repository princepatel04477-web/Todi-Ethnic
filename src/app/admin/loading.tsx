"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh] text-center select-none bg-zinc-950">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <div className="flex flex-col items-center">
          <span className="text-sm font-heading font-semibold tracking-[0.25em] text-white uppercase">
            Todi Creation
          </span>
          <span className="text-[8px] font-heading tracking-[0.4em] text-primary uppercase mt-0.5">
            Admin Panel
          </span>
        </div>
      </div>
    </div>
  );
}
