import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy - Allow Leaflet map tiles and resources
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://unpkg.com https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://cdnjs.cloudflare.com",
    "img-src 'self' data: blob: https: http: https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://unpkg.com",
    "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "connect-src 'self' wss: https: http://localhost:* ws://localhost:* https://*.tile.openstreetmap.org https://earthquake.usgs.gov https://www.gdacs.org",
    "frame-src 'self' https://vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "worker-src 'self' blob:",
  ].join("; ");

  // Security headers
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(self), microphone=(), camera=(), payment=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
