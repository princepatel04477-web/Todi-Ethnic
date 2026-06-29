"use client";

import React from "react";

export default function CatalogSkeleton() {
  // Array of 8 items for the grid skeleton
  const skeletonCards = Array.from({ length: 8 });

  return (
    <div className="space-y-8 animate-pulse select-none">
      {/* Page Title skeleton */}
      <div className="text-center space-y-3 mb-10">
        <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 mx-auto rounded-full" />
        <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 mx-auto rounded-lg" />
        <div className="h-3 w-96 bg-neutral-200 dark:bg-neutral-800 mx-auto rounded-full" />
      </div>

      {/* Search & Actions Bar skeleton */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input Box skeleton */}
        <div className="w-full md:max-w-md h-12 bg-neutral-200 dark:bg-neutral-800 rounded-full" />

        {/* Filter Drawer Toggle & Sorting Dropdown skeleton */}
        <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-4">
          <div className="h-12 w-28 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
          <div className="h-12 w-44 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        </div>
      </div>

      {/* Product count skeleton */}
      <div className="h-4 w-32 bg-neutral-100 dark:bg-neutral-900 rounded-full" />

      {/* Product Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {skeletonCards.map((_, index) => (
          <div
            key={index}
            className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-900"
          >
            {/* Image Box */}
            <div className="aspect-[3/4] bg-neutral-200 dark:bg-neutral-800 w-full" />
            
            {/* Details Box */}
            <div className="p-5 flex flex-col flex-grow space-y-3">
              <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
              <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900">
                <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
