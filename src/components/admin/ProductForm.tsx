"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Star, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import ImageUploader from "./ImageUploader";
import { Category, Product } from "@/lib/services/products";

interface ProductFormProps {
  initialData?: Product;
  categories: Category[];
  onSubmit: (formData: any) => Promise<{ success: boolean; error?: string }>;
  titleText: string;
}

const fabricSuggestions = [
  "Banarasi Silk",
  "Bridal Georgette",
  "Silk Cotton",
  "Designer Lehenga",
  "Georgette Crepe",
  "Organza Silk",
  "Kanchipuram Silk",
  "Chanderi Cotton"
];

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
  titleText,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [fabric, setFabric] = useState(initialData?.fabric || "");
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.image_urls || []);
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [stock, setStock] = useState(initialData?.stock !== undefined ? String(initialData.stock) : "1");
  const [description, setDescription] = useState(initialData?.description || "");

  // Tracks if the user has manually edited the slug field
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Auto-generate slug from title (only when creating, i.e., no initialData, and when not manually edited)
  useEffect(() => {
    if (!initialData && !isSlugManuallyEdited) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special characters
        .trim()
        .replace(/\s+/g, "-") // replace spaces with hyphens
        .replace(/-+/g, "-"); // remove double hyphens
      setSlug(generatedSlug);
    }
  }, [title, initialData, isSlugManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Front-end Validations
    if (!title.trim()) return setErrorMsg("Title is required.");
    if (!slug.trim()) return setErrorMsg("Slug is required.");
    if (!sku.trim()) return setErrorMsg("SKU code is required.");
    if (!fabric.trim()) return setErrorMsg("Fabric type is required.");
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      return setErrorMsg("Price must be a valid number greater than 0.");
    }
    if (!stock.trim() || isNaN(Number(stock)) || Number(stock) < 0) {
      return setErrorMsg("Stock count must be 0 or greater.");
    }
    if (imageUrls.length === 0) {
      return setErrorMsg("Please upload at least one design image.");
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      sku: sku.trim().toUpperCase(),
      price: Number(price),
      category_id: categoryId || null,
      fabric: fabric.trim(),
      image_urls: imageUrls,
      featured,
      stock: Math.floor(Number(stock)),
      description: description.trim(),
    };

    try {
      const res = await onSubmit(payload);
      if (res.success) {
        router.push("/admin/products");
      } else {
        setErrorMsg(res.error || "An error occurred while saving product.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("A connection error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in max-w-4xl">
      {/* Header link */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="inline-flex items-center justify-center p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-heading font-semibold tracking-tight text-white">
          {titleText}
        </h1>
      </div>

      {/* Error block */}
      {errorMsg && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-body flex items-start gap-2.5">
          <Info className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Main Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Forms column (8 cols on lg) */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-luxury">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
              Product Title *
            </label>
            <input
              id="title"
              type="text"
              required
              placeholder="e.g. Varanasi Gold Brocade Saree"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-body text-white transition-colors placeholder-zinc-600"
            />
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Slug */}
            <div className="space-y-2">
              <label htmlFor="slug" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                Catalog URL Slug *
              </label>
              <input
                id="slug"
                type="text"
                required
                placeholder="e.g. varanasi-gold-brocade"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugManuallyEdited(true);
                }}
                className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-body text-white transition-colors placeholder-zinc-600"
              />
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <label htmlFor="sku" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                SKU Model Code *
              </label>
              <input
                id="sku"
                type="text"
                required
                placeholder="e.g. TC-BAN-005"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-body text-white transition-colors placeholder-zinc-600"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="price" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                Trade Price (₹ INR) *
              </label>
              <input
                id="price"
                type="text"
                required
                placeholder="e.g. 7500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-body text-white transition-colors placeholder-zinc-600"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                Design Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-heading font-medium tracking-wide uppercase transition-colors cursor-pointer text-zinc-300 appearance-none"
              >
                <option value="">Unassigned</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fabric Specification */}
          <div className="space-y-3">
            <label htmlFor="fabric" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
              Fabric Material *
            </label>
            <input
              id="fabric"
              type="text"
              required
              placeholder="e.g. Banarasi Silk"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-body text-white transition-colors placeholder-zinc-600 mb-2"
            />
            {/* Quick suggestions chips */}
            <div className="flex flex-wrap gap-2">
              {fabricSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setFabric(suggestion)}
                  className={`px-3 py-1 rounded-full border text-[10px] font-heading font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    fabric === suggestion
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 text-zinc-400"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
              Description details *
            </label>
            <textarea
              id="description"
              rows={6}
              required
              placeholder="Provide a luxury product description focusing on craftsmanship, embroidery, color combinations, and direct Surat manufacturing guarantees..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-body text-white transition-colors placeholder-zinc-650 resize-none"
            />
          </div>
        </div>

        {/* Right image upload & controls column (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Images Box */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-luxury space-y-4">
            <h2 className="text-xs font-heading font-bold uppercase tracking-widest text-primary border-b border-zinc-800 pb-3">
              Design Media
            </h2>
            <ImageUploader value={imageUrls} onChange={setImageUrls} maxImages={6} />
          </div>

          {/* Status Settings Box */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-luxury space-y-6">
            <h2 className="text-xs font-heading font-bold uppercase tracking-widest text-primary border-b border-zinc-800 pb-3">
              Catalog status
            </h2>

            {/* Stock count */}
            <div className="space-y-2">
              <label htmlFor="stock" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                Available Stock Count
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-body text-white transition-colors"
              />
            </div>

            {/* Featured toggle switch */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-850 rounded-lg">
              <div className="space-y-1">
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-200 block">
                  Feature on Homepage
                </span>
                <span className="text-[9px] font-body text-zinc-500 leading-normal block">
                  Promote to the trending section grid.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFeatured(!featured)}
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer active-press ${
                  featured
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-zinc-800 bg-transparent text-zinc-650 hover:text-zinc-400"
                }`}
                aria-label="Toggle homepage feature"
              >
                <Star className={`w-5 h-5 ${featured ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Save CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-heading font-semibold uppercase tracking-wider text-xs transition-all duration-300 active-press hover-glow flex items-center justify-center gap-2 shadow-luxury cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Design...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Product Design
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
