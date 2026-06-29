import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    env: {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "unconfigured",
      supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    }
  });
}
