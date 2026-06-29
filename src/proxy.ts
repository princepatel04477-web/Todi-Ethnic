import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    // Allow bypassing in dev if needed, or throw error. Let's make it robust.
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
      if (!user) {
        // Unauthenticated: Send to login page
        const redirectUrl = new URL('/login', request.url);
        return NextResponse.redirect(redirectUrl);
      } else if (user.email !== 'admin@todicreation.com') {
        // Authenticated but unauthorized: Send to home to avoid redirect loops
        const redirectUrl = new URL('/', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  } catch (error) {
    console.error("Auth proxy check failed:", error);
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
