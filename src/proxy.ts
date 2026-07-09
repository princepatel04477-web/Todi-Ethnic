import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next();

  // Resolve client IP address
  const clientIp = request.headers.get('x-real-ip') || 
                   request.headers.get('x-forwarded-for')?.split(',')[0].trim();
  
  const allowedIps = [
    '49.36.89.238', // User IP (IPv4)
    '2405:201:200d:2822:297b:b7bb:7fa0:cc87', // User IP (IPv6)
    '49.36.91.88', 
    '2405:201:200d:2822', 
    '192.168.29.142', 
    '192.168.29.82', 
    '127.0.0.1', 
    '::1'
  ];
  const isIpAllowed = allowedIps.some(allowed => 
    clientIp === allowed || 
    clientIp?.includes(allowed) || 
    clientIp === 'localhost'
  );

  // Set IP access cookie for client components (like Footer)
  if (isIpAllowed) {
    response.cookies.set('todi_admin_ip', 'true', { path: '/', maxAge: 86400 * 30, httpOnly: false });
  } else {
    response.cookies.set('todi_admin_ip', 'false', { path: '/', maxAge: 86400 * 30, httpOnly: false });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Only allow placeholder bypass in local development
  const isPlaceholder = 
    (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) &&
    process.env.NODE_ENV !== "production";

  if (isPlaceholder) {
    return response;
  }

  // If Supabase keys are missing in production, block access to admin
  if (!supabaseUrl || !supabaseAnonKey) {
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const redirectUrl = new URL('/login', request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      redirectResponse.cookies.set('todi_admin_ip', isIpAllowed ? 'true' : 'false', { path: '/', maxAge: 86400 * 30, httpOnly: false });
      return redirectResponse;
    }
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set({ name, value, ...options });
            });
            response = NextResponse.next({
              request,
            });
            // Re-apply our admin IP cookie to the new response object
            if (isIpAllowed) {
              response.cookies.set('todi_admin_ip', 'true', { path: '/', maxAge: 86400 * 30, httpOnly: false });
            } else {
              response.cookies.set('todi_admin_ip', 'false', { path: '/', maxAge: 86400 * 30, httpOnly: false });
            }
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Refresh the session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!isIpAllowed) {
        console.warn(`Blocked admin access request from unauthorized IP: ${clientIp}`);
        // Send to home page if IP is not allowed
        const redirectUrl = new URL('/', request.url);
        const redirectResponse = NextResponse.redirect(redirectUrl);
        redirectResponse.cookies.set('todi_admin_ip', 'false', { path: '/', maxAge: 86400 * 30, httpOnly: false });
        return redirectResponse;
      }

      const allowedEmails = ['princepatel01258@gmail.com', 'varunyatechnologies@gmail.com'];
      if (!user) {
        // Unauthenticated: Send to login page
        const redirectUrl = new URL('/login', request.url);
        const redirectResponse = NextResponse.redirect(redirectUrl);
        redirectResponse.cookies.set('todi_admin_ip', 'true', { path: '/', maxAge: 86400 * 30, httpOnly: false });
        return redirectResponse;
      } else if (!allowedEmails.includes(user.email || '')) {
        // Authenticated but unauthorized: Send to home to avoid redirect loops
        const redirectUrl = new URL('/', request.url);
        const redirectResponse = NextResponse.redirect(redirectUrl);
        redirectResponse.cookies.set('todi_admin_ip', 'true', { path: '/', maxAge: 86400 * 30, httpOnly: false });
        return redirectResponse;
      }
    }
  } catch (error) {
    console.error("Auth proxy check failed:", error);
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const redirectUrl = new URL('/login', request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      redirectResponse.cookies.set('todi_admin_ip', isIpAllowed ? 'true' : 'false', { path: '/', maxAge: 86400 * 30, httpOnly: false });
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next (Next.js internals)
     * - static (static files)
     * - favicon.ico (favicon file)
     * - Common static/media assets (css, js, svg, png, jpg, jpeg, gif, webp, woff, woff2, ttf)
     */
    '/((?!_next|static|favicon.ico|.*\\.(?:css|js|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf)$).*)',
  ],
};
