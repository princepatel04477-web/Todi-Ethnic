import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const clientIp = request.headers.get('x-real-ip') || 
                   request.headers.get('x-forwarded-for')?.split(',')[0].trim();
  
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "undefined";
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "undefined";

  const maskedUrl = rawUrl === "undefined" ? "undefined" : rawUrl.substring(0, 15) + "...";
  const maskedKey = rawKey === "undefined" ? "undefined" : rawKey.substring(0, 10) + "...";

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    clientIp: clientIp || "unknown",
    headers: {
      "x-real-ip": request.headers.get('x-real-ip'),
      "x-forwarded-for": request.headers.get('x-forwarded-for'),
    },
    env: {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "unconfigured",
      supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"),
      supabaseUrlFirstChars: maskedUrl,
      supabaseKeyFirstChars: maskedKey
    }
  });
}
