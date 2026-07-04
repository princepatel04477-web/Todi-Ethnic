"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Folder, 
  X, 
  Save, 
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { Category } from "@/lib/services/products";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "@/components/admin/ImageUploader";

interface CategoriesClientProps {
  initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) setIsModalOpen(false);
        if (isDeleteConfirmOpen) setIsDeleteConfirmOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, isDeleteConfirmOpen]);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // UX states
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Open modal for adding new category
  const handleOpenAdd = () => {
    setActiveCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl([]);
    setIsSlugManuallyEdited(false);
    setIsModalOpen(true);
  };

  // Open modal for editing category
  const handleOpenEdit = (category: Category) => {
    setActiveCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || "");
    setImageUrl(category.image_url ? [category.image_url] : []);
    setIsSlugManuallyEdited(true);
    setIsModalOpen(true);
  };

  // Auto-generate slug from name (only if not editing and not manually changed)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!activeCategory && !isSlugManuallyEdited) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generatedSlug);
    }
  };

  // Form submission handler
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setIsProcessing(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim() || null,
      image_url: imageUrl.length > 0 ? imageUrl[0] : null,
    };

    try {
      const supabase = createClient();
      
      if (activeCategory) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", activeCategory.id);

        if (error) {
          showNotification("Failed to update category: " + error.message, "error");
        } else {
          setCategories((prev) =>
            prev.map((c) =>
              c.id === activeCategory.id ? { ...c, ...payload } : c
            )
          );
          showNotification("Category details updated successfully.");
          setIsModalOpen(false);
        }
      } else {
        // Insert new category
        const { data, error } = await supabase
          .from("categories")
          .insert([payload])
          .select()
          .single();

        if (error) {
          showNotification("Failed to create category: " + error.message, "error");
        } else if (data) {
          setCategories((prev) => [...prev, data]);
          showNotification("New category created successfully.");
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
      showNotification("Database connectivity error", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Hard delete category
  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;

    const id = deleteCategoryId;
    setIsDeleteConfirmOpen(false);
    setDeleteCategoryId(null);
    setIsProcessing(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) {
        showNotification("Failed to delete category: " + error.message, "error");
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        showNotification("Category deleted successfully.");
      }
    } catch (err) {
      console.error(err);
      showNotification("Database connectivity error", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 select-none relative">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-lg border text-xs font-heading font-semibold uppercase tracking-wider shadow-luxury-hover animate-bounce ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        }`}>
          {notification.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-semibold tracking-tight text-white mb-1">
            Categories Management
          </h1>
          <p className="text-xs text-zinc-400 font-body font-light">
            Create, edit, or delete catalog categories. Removing categories does not delete products (sets them to unassigned).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-heading font-semibold tracking-wider uppercase rounded-lg shadow-luxury hover-glow transition-all active-press cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Grid of Categories */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const cover = category.image_url || "/images/hero_banarasi_lengha.jpg";
            return (
              <div 
                key={category.id} 
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-luxury flex flex-col justify-between hover:shadow-luxury-hover hover-lift"
              >
                <div>
                  {/* Category Image Cover */}
                  <div className="relative aspect-[16/9] bg-zinc-950 w-full overflow-hidden border-b border-zinc-850">
                    <Image
                      src={cover}
                      alt={category.name}
                      fill
                      className="object-cover opacity-80"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <div className="p-1.5 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded text-primary">
                        <Folder className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-heading font-semibold text-white tracking-tight">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  {/* Category content info */}
                  <div className="p-5 space-y-2 select-none">
                    <span className="text-[9px] uppercase tracking-wider font-heading font-bold text-zinc-500 block">
                      URL slug: <span className="text-zinc-400">/{category.slug}</span>
                    </span>
                    <p className="text-xs text-zinc-400 font-body font-light leading-relaxed line-clamp-3">
                      {category.description || "No description provided for this collection."}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-zinc-950/30 border-t border-zinc-800/60 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(category)}
                    className="p-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                    title="Edit category details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteCategoryId(category.id);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="p-2 border border-transparent hover:border-rose-900/30 hover:bg-rose-950/20 text-zinc-600 hover:text-rose-400 rounded transition-colors cursor-pointer"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-850 rounded-xl font-body font-light text-zinc-500">
          <Folder className="w-10 h-10 text-primary mx-auto mb-4 animate-pulse" />
          <h3 className="text-sm font-heading font-semibold text-zinc-300 uppercase tracking-widest mb-1">
            No Categories Configured
          </h3>
          <p className="text-xs">
            Create categories to divide products and display collections on catalog filter drawers.
          </p>
        </div>
      )}

      {/* Add / Edit Category Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in select-none">
          <div
            className="w-full max-w-lg bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-dialog-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850">
              <h3 id="category-dialog-title" className="text-sm font-heading font-bold uppercase tracking-wider text-white">
                {activeCategory ? "Edit Category Details" : "Create New Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCategory} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* Category Name */}
              <div className="space-y-2">
                <label htmlFor="cat-name" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                  Category Name *
                </label>
                <input
                  id="cat-name"
                  type="text"
                  required
                  placeholder="e.g. Designer Lenghas"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-body text-white transition-colors placeholder-zinc-650"
                />
              </div>

              {/* Slug URL */}
              <div className="space-y-2">
                <label htmlFor="cat-slug" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                  URL Slug *
                </label>
                <input
                  id="cat-slug"
                  type="text"
                  required
                  placeholder="e.g. designer-lenghas"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugManuallyEdited(true);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-body text-white transition-colors placeholder-zinc-650"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="cat-desc" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                  Description
                </label>
                <textarea
                  id="cat-desc"
                  rows={3}
                  placeholder="Provide collection synopsis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-body text-white transition-colors placeholder-zinc-650 resize-none"
                />
              </div>

              {/* Cover Image uploader */}
              <div className="space-y-3">
                <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-500 block">
                  Collection Cover Image
                </label>
                <ImageUploader value={imageUrl} onChange={setImageUrl} maxImages={1} />
              </div>

              {/* Action actions */}
              <div className="flex gap-3 text-xs font-heading font-semibold uppercase tracking-wider pt-4 border-t border-zinc-850 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors cursor-pointer shadow-luxury active-press flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in select-none">
          <div
            className="w-full max-w-sm bg-zinc-900 border border-zinc-850 p-6 rounded-xl space-y-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-cat-dialog-title"
          >
            <div className="flex gap-3.5 items-start">
              <div className="p-2 bg-rose-500/10 rounded text-rose-500 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 id="delete-cat-dialog-title" className="text-sm font-heading font-bold uppercase tracking-wider text-white">
                  Confirm Delete Category
                </h3>
                <p className="text-xs text-zinc-400 font-body leading-relaxed font-light">
                  Are you sure you want to delete this category? This operation is permanent. Products linked to this category will not be deleted but will become unassigned.
                </p>
              </div>
            </div>

            <div className="flex gap-3 text-xs font-heading font-semibold uppercase tracking-wider">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-luxury active-press"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
