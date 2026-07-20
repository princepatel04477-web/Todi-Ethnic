"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Shield, ArrowRight, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UX states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMsg("");

    // Real Supabase Login
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.user) {
        // Double check admin email match
        const allowedEmails = ["princepatel01258@gmail.com", "varunyatechnologies@gmail.com"];
        if (allowedEmails.includes(data.user.email || "")) {
          router.push("/admin");
        } else {
          setErrorMsg("Access Denied: Account is not configured as Admin.");
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      console.error("Authentication crash:", err);
      setErrorMsg("An unexpected auth error occurred. Try development bypass below.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevBypass = () => {
    setIsLoading(true);
    localStorage.setItem("todi_admin_bypass", "true");
    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin");
    }, 800);
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f10] text-zinc-100 flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Main card wrapper */}
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 p-8 sm:p-10 shadow-luxury z-10 animate-fade-in">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="flex flex-col items-center mb-4">
            <Image
              src="/logo.png"
              alt="TODI CREATIONS"
              width={260}
              height={92}
              className="h-16 sm:h-20 w-auto object-contain brightness-110 mb-1"
              priority
            />
            <span className="text-[9px] font-heading tracking-[0.45em] text-primary uppercase">
              Surat
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] uppercase font-heading font-semibold tracking-wider text-primary">
            <Shield className="w-3.5 h-3.5" />
            Admin Desk
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 mb-6 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-400 block">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                placeholder="admin@todiethnic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950/50 focus:outline-none focus:border-primary text-sm font-body text-white transition-colors placeholder-zinc-600"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-[10px] font-heading font-bold uppercase tracking-wider text-zinc-400 block">
              Security Key
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-lg border border-zinc-800 bg-zinc-950/50 focus:outline-none focus:border-primary text-sm font-body text-white transition-colors placeholder-zinc-650"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1 rounded transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-heading font-semibold uppercase tracking-wider text-xs transition-all duration-300 active-press hover-glow flex items-center justify-center gap-2 cursor-pointer shadow-luxury disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Development Bypass Box */}
        <div className="mt-8 pt-6 border-t border-zinc-800 text-center space-y-3">
          <p className="text-[10px] font-body text-zinc-500 leading-normal">
            Development mode — use the bypass below or sign in with Supabase credentials.
          </p>
          <button
            onClick={handleDevBypass}
            disabled={isLoading}
            className="text-[10px] font-heading font-bold uppercase tracking-wider text-primary hover:text-primary-hover transition-colors underline cursor-pointer"
          >
            Skip auth (Dev bypass)
          </button>
        </div>
      </div>

      {/* Return to website */}
      <Link
        href="/"
        className="mt-8 text-xs font-heading font-semibold uppercase tracking-widest text-zinc-650 hover:text-primary transition-colors cursor-pointer"
      >
        Return to Shop
      </Link>
    </div>
  );
}
