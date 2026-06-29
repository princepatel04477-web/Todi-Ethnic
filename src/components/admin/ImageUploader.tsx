"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon, Loader2, ArrowUpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  status: "idle" | "compressing" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export default function ImageUploader({
  value = [],
  onChange,
  maxImages = 6,
}: ImageUploaderProps) {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPlaceholderMode = 
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Compress image on client side using Canvas API to convert to WebP
  const compressImageToWebp = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context creation failed"));
            return;
          }

          // Target maximum dimensions for product display
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          // Scale maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to compressed WebP blob (quality 0.8)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Canvas toBlob serialization failed"));
              }
            },
            "image/webp",
            0.8
          );
        };
        img.onerror = () => reject(new Error("Image parsing failed"));
      };
      reader.onerror = () => reject(new Error("File reading failed"));
    });
  };

  const handleFiles = async (files: FileList) => {
    const spaceLeft = maxImages - value.length - queue.filter(q => q.status !== "error").length;
    if (spaceLeft <= 0) return;

    const filesToUpload = Array.from(files)
      .slice(0, spaceLeft)
      .filter((file) => file.type.startsWith("image/"));

    const newQueueItems = filesToUpload.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "idle" as const,
      progress: 0,
    }));

    setQueue((prev) => [...prev, ...newQueueItems]);

    // Process upload queue one-by-one
    for (const item of newQueueItems) {
      await processUpload(item);
    }
  };

  const processUpload = async (item: UploadQueueItem) => {
    // 1. Compression State
    updateItemStatus(item.id, { status: "compressing", progress: 20 });
    
    let imageBlob: Blob;
    try {
      imageBlob = await compressImageToWebp(item.file);
      updateItemStatus(item.id, { progress: 50 });
    } catch (err) {
      console.error("Compression failed:", err);
      updateItemStatus(item.id, { status: "error", error: "Compression failed" });
      return;
    }

    // 2. Uploading State
    updateItemStatus(item.id, { status: "uploading", progress: 60 });

    // Mock Upload Logic for Sandbox Development
    if (isPlaceholderMode) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateItemStatus(item.id, { status: "success", progress: 100 });
      
      // Use local preview data url or mock image path as publicUrl
      const mockUrl = item.previewUrl;
      onChange([...value, mockUrl]);
      
      // Remove from queue after success delay
      setTimeout(() => {
        setQueue((prev) => prev.filter((q) => q.id !== item.id));
      }, 1500);
      return;
    }

    // Real Supabase storage bucket upload
    try {
      const supabase = createClient();
      const fileExt = "webp";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageBlob, {
          contentType: "image/webp",
          cacheControl: "31536000", // Cache for 1 year
        });

      if (error) {
        throw new Error(error.message);
      }

      updateItemStatus(item.id, { progress: 90 });

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      updateItemStatus(item.id, { status: "success", progress: 100 });
      
      onChange([...value, publicUrl]);

      // Remove from queue
      setTimeout(() => {
        setQueue((prev) => prev.filter((q) => q.id !== item.id));
      }, 1500);
    } catch (err: any) {
      console.error("Upload failed:", err);
      updateItemStatus(item.id, { status: "error", error: err.message || "Upload failed" });
    }
  };

  const updateItemStatus = (id: string, updates: Partial<UploadQueueItem>) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const isUploading = queue.some(item => item.status === "uploading" || item.status === "compressing");

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {value.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-zinc-800 hover:border-primary/50 bg-zinc-950/20"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            accept="image/*"
            multiple={maxImages - value.length > 1}
            disabled={isUploading}
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-zinc-900 rounded-lg text-primary">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-xs font-heading font-semibold text-white uppercase tracking-wider">
                {isDragActive ? "Drop files here" : "Upload Product Images"}
              </p>
              <p className="text-[10px] text-zinc-500 font-body mt-1">
                Drag & Drop or click to browse. Max {maxImages} images. WebP compression active.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Queue Progress */}
      {queue.length > 0 && (
        <div className="space-y-3 bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl">
          <span className="text-[9px] uppercase font-heading font-bold tracking-widest text-zinc-500 block">
            Upload Queue
          </span>
          <div className="space-y-2">
            {queue.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-xs bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900">
                <div className="relative w-8 aspect-[3/4] rounded overflow-hidden flex-shrink-0">
                  <img src={item.previewUrl} alt="Preview" className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[10px] mb-1.5">
                    <span className="font-heading font-bold text-zinc-300 truncate max-w-[150px]">{item.file.name}</span>
                    <span className={`uppercase font-semibold tracking-wider ${
                      item.status === "error" ? "text-rose-500" : "text-primary"
                    }`}>
                      {item.status} ({item.progress}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.status === "error" ? "bg-rose-500" : "bg-primary"
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Images Preview Grid */}
      {value.length > 0 && (
        <div className="space-y-3">
          <span className="text-[9px] uppercase font-heading font-bold tracking-widest text-zinc-500 block">
            Uploaded Images ({value.length})
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {value.map((url, index) => (
              <div
                key={url}
                className="group relative aspect-[3/4] bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 hover:border-primary/30 transition-all"
              >
                <Image
                  src={url}
                  alt={`Product design image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
                
                {/* Index badge */}
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-zinc-950/80 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[9px] font-heading font-bold text-zinc-300">
                  {index + 1}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500/80 text-white hover:bg-rose-600 hover:scale-105 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
