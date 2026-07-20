import React from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Layers, 
  ClipboardList, 
  AlertOctagon, 
  Plus, 
  ArrowRight,
  ExternalLink,
  Clock
} from "lucide-react";
import { createClient, isDynamicError } from "@/lib/supabase/server";

// Define mock data for local development if database is unconfigured
const mockStats = {
  productsCount: 4,
  categoriesCount: 3,
  pendingInquiriesCount: 2,
  outOfStockCount: 0
};

const mockInquiries = [
  {
    id: "mock-inq-1",
    customer_name: "Anita Desai (Boutique owner)",
    customer_phone: "+91 98123 45678",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    items: [
      { title: "Varanasi Rajat Brocade Lehenga", quantity: 5 },
      { title: "Zardozi Empress Lehenga", quantity: 2 }
    ]
  },
  {
    id: "mock-inq-2",
    customer_name: "Rohan Khanna",
    customer_phone: "+91 99999 88888",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(), // 18 hours ago
    items: [
      { title: "Amber Aura Fusion Lehenga", quantity: 1 }
    ]
  }
];

export default async function AdminDashboardPage() {
  let stats = { ...mockStats };
  let latestInquiries = [...mockInquiries];
  let isDevMode = false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
    isDevMode = true;
  } else {
    try {
      const supabase = await createClient();

      // Query dashboard statistics concurrently
      const [
        productsRes,
        categoriesRes,
        pendingInquiriesRes,
        outOfStockRes,
        latestInquiriesRes
      ] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("products").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("stock", 0),
        supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(5)
      ]);

      stats = {
        productsCount: productsRes.count ?? 0,
        categoriesCount: categoriesRes.count ?? 0,
        pendingInquiriesCount: pendingInquiriesRes.count ?? 0,
        outOfStockCount: outOfStockRes.count ?? 0
      };

      latestInquiries = latestInquiriesRes.data ? latestInquiriesRes.data.map(inq => ({
        id: inq.id,
        customer_name: inq.customer_name,
        customer_phone: inq.customer_phone,
        status: inq.status,
        created_at: inq.created_at,
        items: Array.isArray(inq.items) ? inq.items : []
      })) : [];
    } catch (err) {
      if (isDynamicError(err)) throw err;
      console.error("Failed to fetch dashboard stats from Supabase:", err);
      isDevMode = true;
    }
  }

  return (
    <div className="space-y-8 select-none">
      {/* Welcome header & Dev warning */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight text-white mb-2">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-body font-light">
            Monitor designs, manage Surat manufacturing lines, and review wholesale inquiry logs.
          </p>
        </div>

        {isDevMode && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-300 font-heading uppercase tracking-wider font-semibold">
            <AlertOctagon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            Sandbox Developer Mode
          </div>
        )}
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Products */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between shadow-luxury">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider font-heading font-semibold text-zinc-500 block">
              Active Designs
            </span>
            <span className="text-3xl font-heading font-bold text-white block">
              {stats.productsCount}
            </span>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between shadow-luxury">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider font-heading font-semibold text-zinc-500 block">
              Categories
            </span>
            <span className="text-3xl font-heading font-bold text-white block">
              {stats.categoriesCount}
            </span>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Inquiries */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between shadow-luxury">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider font-heading font-semibold text-zinc-500 block">
              Pending Inquiries
            </span>
            <span className="text-3xl font-heading font-bold text-white block">
              {stats.pendingInquiriesCount}
            </span>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between shadow-luxury">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider font-heading font-semibold text-zinc-500 block">
              Out of Stock
            </span>
            <span className={`text-3xl font-heading font-bold block ${stats.outOfStockCount > 0 ? "text-rose-500" : "text-white"}`}>
              {stats.outOfStockCount}
            </span>
          </div>
          <div className={`p-3 rounded-lg ${stats.outOfStockCount > 0 ? "bg-rose-500/10 text-rose-500" : "bg-zinc-800 text-zinc-500"}`}>
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main dashboard splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Latest Inquiries Table (8 cols on lg) */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-luxury">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-5 mb-5">
            <h2 className="text-sm font-heading font-semibold text-white uppercase tracking-wider">
              Recent Trade Inquiries
            </h2>
            <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 font-body">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Latest 5 entries
            </div>
          </div>

          {latestInquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-body">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px] font-heading font-bold">
                    <th className="py-3 pr-4">Buyer Details</th>
                    <th className="py-3 px-4">Requested Designs</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 text-right">Inquiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {latestInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-heading font-semibold text-zinc-200">{inq.customer_name}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{inq.customer_phone}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-0.5 max-w-[260px] truncate text-zinc-400">
                          {inq.items.map((item: { title: string; quantity: number }, idx: number) => (
                            <div key={idx} className="truncate">
                              • {item.title} ({item.quantity} pcs)
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-heading font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                          {inq.status}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right text-zinc-500 font-light">
                        {new Date(inq.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500 text-xs font-body font-light">
              No inquiries found in database logs.
            </div>
          )}
        </div>

        {/* Quick Actions & Shortcuts (4 cols on lg) */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-luxury space-y-6">
          <h2 className="text-sm font-heading font-semibold text-white uppercase tracking-wider border-b border-zinc-800 pb-5">
            Quick Actions
          </h2>
          
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-heading font-semibold tracking-wider uppercase text-zinc-300 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded text-primary">
                  <Plus className="w-4 h-4" />
                </div>
                <span>Add Product</span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-heading font-semibold tracking-wider uppercase text-zinc-300 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded text-primary">
                  <Layers className="w-4 h-4" />
                </div>
                <span>Manage Categories</span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-heading font-semibold tracking-wider uppercase text-zinc-300 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800 rounded text-zinc-400">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <span>Live Catalog Site</span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
