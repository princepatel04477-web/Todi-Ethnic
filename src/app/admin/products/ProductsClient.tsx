"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  SlidersHorizontal,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  AlertCircle
} from "lucide-react";
import { Product, Category } from "@/lib/services/products";
import { createClient } from "@/lib/supabase/client";

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  
  // Handle ESC key to close delete confirmation modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && deleteProductId) {
        setDeleteProductId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteProductId]);

  // UX feedback states
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Toggle Featured status
  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    setIsProcessing(`featured-${id}`);
    const nextStatus = !currentStatus;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("products")
        .update({ featured: nextStatus })
        .eq("id", id);

      if (error) {
        showNotification("Failed to update featured status: " + error.message, "error");
      } else {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, featured: nextStatus } : p))
        );
        showNotification(`Product featured status ${nextStatus ? "activated" : "deactivated"}.`);
      }
    } catch (err) {
      console.error(err);
      showNotification("Database connectivity error", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  // Quick Stock increment/decrement
  const handleUpdateStock = async (id: string, currentStock: number, change: number) => {
    const nextStock = Math.max(0, currentStock + change);
    if (nextStock === currentStock) return;

    setIsProcessing(`stock-${id}`);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("products")
        .update({ stock: nextStock })
        .eq("id", id);

      if (error) {
        showNotification("Failed to update stock: " + error.message, "error");
      } else {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, stock: nextStock } : p))
        );
        showNotification("Stock count updated successfully.");
      }
    } catch (err) {
      console.error(err);
      showNotification("Database connectivity error", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  // Perform soft delete
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    const id = deleteProductId;
    setDeleteProductId(null);
    setIsProcessing(`delete-${id}`);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        showNotification("Failed to delete design: " + error.message, "error");
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showNotification("Design successfully moved to trash (soft deleted).");
      }
    } catch (err) {
      console.error(err);
      showNotification("Database connectivity error", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.fabric.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = 
      selectedCategory === "all" || 
      product.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-semibold tracking-tight text-white mb-1">
            Designs Catalog
          </h1>
          <p className="text-xs text-zinc-400 font-body font-light">
            Search, edit, toggle features, or soft-delete products from active catalog grids.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-heading font-semibold tracking-wider uppercase rounded-lg shadow-luxury hover-glow transition-all active-press"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-luxury">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search title, SKU, fabric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-body text-white transition-colors placeholder-zinc-500"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        </div>

        {/* Category filter */}
        <div className="relative w-full md:w-auto flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary hidden md:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/40 focus:outline-none focus:border-primary text-xs font-heading font-medium tracking-wide uppercase transition-colors cursor-pointer text-zinc-300"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-zinc-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Products list Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-luxury">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px] font-heading font-bold select-none bg-zinc-900/50">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-4">Design details</th>
                  <th className="py-4 px-4">Fabric</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4 text-center">Featured</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filteredProducts.map((product) => {
                  const firstImg = product.image_urls && product.image_urls.length > 0
                    ? product.image_urls[0]
                    : "/images/hero_banarasi_lengha.jpg";
                  
                  const isFeaturedBusy = isProcessing === `featured-${product.id}`;
                  const isStockBusy = isProcessing === `stock-${product.id}`;

                  return (
                    <tr key={product.id} className="hover:bg-zinc-800/10 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="relative w-10 aspect-[3/4] rounded bg-zinc-950 overflow-hidden border border-zinc-800">
                          <Image
                            src={firstImg}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      </td>

                      {/* Title & SKU */}
                      <td className="py-4 px-4">
                        <div className="font-heading font-semibold text-zinc-200 truncate max-w-[200px]" title={product.title}>
                          {product.title}
                        </div>
                        <div className="text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">
                          {product.sku}
                        </div>
                      </td>

                      {/* Fabric type */}
                      <td className="py-4 px-4 uppercase tracking-wider font-heading font-semibold text-primary text-[10px]">
                        {product.fabric}
                      </td>

                      {/* Stock count */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={isStockBusy || product.stock <= 0}
                            onClick={() => handleUpdateStock(product.id, product.stock, -1)}
                            className="w-6 h-6 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded flex items-center justify-center font-bold text-xs cursor-pointer active-press disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className={`w-8 text-center font-heading font-semibold ${product.stock === 0 ? "text-rose-500" : "text-zinc-200"}`}>
                            {product.stock}
                          </span>
                          <button
                            disabled={isStockBusy}
                            onClick={() => handleUpdateStock(product.id, product.stock, 1)}
                            className="w-6 h-6 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded flex items-center justify-center font-bold text-xs cursor-pointer active-press"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Featured Star toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          disabled={isFeaturedBusy}
                          onClick={() => handleToggleFeatured(product.id, product.featured)}
                          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer active-press ${
                            product.featured ? "text-amber-500" : "text-zinc-600 hover:text-zinc-300"
                          }`}
                          aria-label="Toggle Featured design status"
                        >
                          <Star className={`w-4.5 h-4.5 ${product.featured ? "fill-current" : ""}`} />
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6 text-right space-x-2">
                        {/* View live */}
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="inline-flex p-2 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded transition-colors"
                          title="View live website design"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {/* Edit */}
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="inline-flex p-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-350 hover:text-white rounded transition-colors"
                          title="Edit design details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        {/* Delete */}
                        <button
                          disabled={isProcessing?.startsWith("delete")}
                          onClick={() => setDeleteProductId(product.id)}
                          className="p-2 border border-transparent hover:border-rose-900/30 hover:bg-rose-950/20 text-zinc-550 hover:text-rose-400 rounded transition-colors cursor-pointer"
                          title="Move to trash (Soft Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 px-6 font-body font-light text-zinc-500 select-none">
            <AlertTriangle className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="text-sm font-heading font-semibold text-zinc-300 uppercase tracking-widest mb-1">
              No Designs Found
            </h3>
            <p className="text-xs">
              No active designs found matching search terms. Try clearing search filters or create a new product.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in select-none">
          <div
            className="w-full max-w-sm bg-zinc-900 border border-zinc-850 p-6 rounded-xl space-y-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="flex gap-3.5 items-start">
              <div className="p-2 bg-rose-500/10 rounded text-rose-500 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 id="delete-dialog-title" className="text-sm font-heading font-bold uppercase tracking-wider text-white">
                  Confirm Soft Delete
                </h3>
                <p className="text-xs text-zinc-400 font-body leading-relaxed font-light">
                  Are you sure you want to remove this design? It will be soft-deleted (hidden from the public shop catalog) and can be recovered by administrators later.
                </p>
              </div>
            </div>

            <div className="flex gap-3 text-xs font-heading font-semibold uppercase tracking-wider">
              <button
                onClick={() => setDeleteProductId(null)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-luxury active-press"
              >
                Delete Design
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
