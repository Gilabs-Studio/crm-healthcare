import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // If accessing root and already authenticated, redirect to default-locale dashboard
  if (pathname === "/" && token) {
    const target = "/en/dashboard"; // default locale is "en"
    return NextResponse.redirect(new URL(target, request.url));
  }

  // If accessing protected routes without token, let client-side handle redirect
  // Don't redirect here to avoid redirect loops and let client handle auth state
  // Client-side will check localStorage and redirect if needed

  // For protected routes, let client-side handle auth
  // This prevents flash of login page during hard refresh
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - mockServiceWorker.js (MSW service worker)
     * - static files (images, js, css, etc.)
     */
    String.raw`/((?!api|_next/static|_next/image|favicon.ico|mockServiceWorker\.js|.*\.(?:svg|png|jpg|jpeg|gif|webp|js|css|json)$).*)`,
  ],
};

