"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Subcomponent for Mobile Header utilizing usePathname
interface MobileHeaderProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  handleLogout: () => void;
}

function AdminMobileHeader({ isMobileOpen, setIsMobileOpen, handleLogout }: MobileHeaderProps) {
  const pathname = usePathname(); // Dynamic hook inside Suspense boundary
  
  return (
    <header className="md:hidden h-16 border-b border-zinc-900 bg-zinc-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 w-full select-none">
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
        aria-label="Toggle Navigation Menu"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div className="flex flex-col items-center">
        <span className="text-sm font-heading font-semibold tracking-[0.25em] text-white">
          TODI CREATION
        </span>
        <span className="text-[7px] font-heading tracking-[0.4em] text-primary uppercase -mt-0.5">
          Admin Panel
        </span>
      </div>

      <button
        onClick={handleLogout}
        className="p-1 rounded text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
        aria-label="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </header>
  );
}

// Subcomponent for Sidebar Menu utilizing usePathname
interface SidebarProps {
  isMobileOpen: boolean;
  adminEmail: string;
  handleLogout: () => void;
}

function AdminSidebar({ isMobileOpen, adminEmail, handleLogout }: SidebarProps) {
  const pathname = usePathname(); // Dynamic hook inside Suspense boundary
  
  const navLinks = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: ShoppingBag },
    { label: "Categories", href: "/admin/categories", icon: Layers },
  ];

  return (
    <aside
      className={`fixed md:sticky top-0 z-50 h-screen w-64 border-r border-zinc-900 bg-zinc-900/80 backdrop-blur-md flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:block"
      }`}
    >
      <div className="select-none">
        {/* Sidebar Header branding */}
        <div className="h-20 border-b border-zinc-900 flex flex-col justify-center px-8">
          <span className="text-lg font-heading font-semibold tracking-[0.3em] text-white">
            TODI CREATION
          </span>
          <span className="text-[9px] font-heading tracking-[0.45em] text-primary uppercase -mt-0.5">
            Admin Desk
          </span>
        </div>

        {/* Nav list */}
        <nav className="p-6 space-y-2.5">
          <span className="text-[9px] font-heading font-bold uppercase tracking-widest text-zinc-500 block mb-4">
            Navigation
          </span>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-heading font-semibold tracking-wider uppercase transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-glow"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-zinc-900 space-y-4 bg-zinc-900/20 select-none">
        {/* User Account info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-heading font-bold text-primary">
            A
          </div>
          <div className="truncate flex-1">
            <span className="text-[10px] uppercase font-heading font-bold tracking-wider text-white block">
              Administrator
            </span>
            <span className="text-[9px] text-zinc-500 truncate block">
              {adminEmail}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <Link
            href="/"
            target="_blank"
            className="flex w-full items-center justify-center gap-2 py-2.5 border border-zinc-800 hover:border-zinc-700 rounded-lg text-[10px] font-heading font-semibold tracking-wider uppercase text-zinc-400 hover:text-white transition-colors"
          >
            <span>View Website</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-950 hover:bg-rose-950/20 hover:text-rose-400 rounded-lg text-[10px] font-heading font-semibold tracking-wider uppercase text-zinc-500 transition-colors border border-transparent hover:border-rose-900/30 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@todicreation.com");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkAuth = async () => {
      // Check dev bypass
      const devBypass = localStorage.getItem("todi_admin_bypass") === "true";
      const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") || !process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (isPlaceholder && !devBypass) {
        router.push("/login");
        return;
      }

      if (!isPlaceholder) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user || user.email !== "admin@todicreation.com") {
            router.push("/login");
          } else {
            setAdminEmail(user.email);
          }
        } catch (err) {
          console.error("Auth check failed:", err);
          if (!devBypass) router.push("/login");
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem("todi_admin_bypass");
    try {
      const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") || !process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!isPlaceholder) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Error signing out:", err);
    }
    router.push("/login");
  };

  // Close mobile navigation drawer on path changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-body">
      {/* Mobile Header Bar - Wrapped in Suspense */}
      <Suspense fallback={<div className="h-16 md:hidden bg-zinc-900 border-b border-zinc-950" />}>
        <AdminMobileHeader 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
          handleLogout={handleLogout} 
        />
      </Suspense>

      {/* Sidebar Navigation - Wrapped in Suspense */}
      <Suspense fallback={<div className="w-64 hidden md:block bg-zinc-900 border-r border-zinc-950" />}>
        <AdminSidebar 
          isMobileOpen={isMobileOpen} 
          adminEmail={adminEmail} 
          handleLogout={handleLogout} 
        />
      </Suspense>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Main stage */}
        <div className="flex-grow p-6 sm:p-10 md:p-12 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
