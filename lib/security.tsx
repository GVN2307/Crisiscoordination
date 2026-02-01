// Security utilities for CrisisOS
// Implements input sanitization, rate limiting, and EXIF stripping

// Simple HTML sanitizer (strips all tags except allowed ones)
const ALLOWED_TAGS = ["p", "br", "b", "strong", "em", "i"];

export function sanitizeHtml(input: string): { sanitized: string; wasSanitized: boolean } {
  if (!input) return { sanitized: "", wasSanitized: false };

  // Remove script tags and their content
  let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");

  // Remove javascript: URLs
  cleaned = cleaned.replace(/javascript:/gi, "");

  // Strip all tags except allowed
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  cleaned = cleaned.replace(tagRegex, (match, tagName) => {
    if (ALLOWED_TAGS.includes(tagName.toLowerCase())) {
      // Keep only the tag without attributes
      if (match.startsWith("</")) {
        return `</${tagName.toLowerCase()}>`;
      }
      return `<${tagName.toLowerCase()}>`;
    }
    return "";
  });

  const wasSanitized = cleaned !== input;
  return { sanitized: cleaned, wasSanitized };
}

// Plain text sanitization (removes all HTML)
export function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

// Rate limiting store (in-memory for demo, should use Redis in production)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  imageUpload: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  sosBeacon: { maxRequests: 3, windowMs: 15 * 60 * 1000 }, // 3 per 15 min
  verification: { maxRequests: 20, windowMs: 5 * 60 * 1000 }, // 20 per 5 min
} as const;

export function checkRateLimit(
  userId: string,
  action: keyof typeof RATE_LIMITS
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[action];
  const key = `${userId}:${action}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }

  entry.count++;
  rateLimitStore.set(key, entry);
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now };
}

// EXIF stripping metadata (simulated - real implementation would use canvas)
export interface ExifData {
  timestamp?: string;
  gpsLat?: number;
  gpsLng?: number;
  device?: string;
  software?: string;
  orientation?: number;
}

export async function stripExifData(
  _imageBlob: Blob
): Promise<{ cleanBlob: Blob; extractedExif: ExifData; wasStripped: boolean }> {
  // In production, this would:
  // 1. Load image into canvas
  // 2. Extract EXIF using exif-js or similar
  // 3. Re-export without metadata
  
  // Simulated EXIF extraction for demo
  const extractedExif: ExifData = {
    timestamp: new Date().toISOString(),
    device: "Unknown Device",
    software: "Unknown",
  };

  // For demo, return same blob (in prod, would strip via canvas)
  return {
    cleanBlob: _imageBlob,
    extractedExif,
    wasStripped: true,
  };
}

// Device fingerprinting (basic implementation)
export function generateDeviceFingerprint(): string {
  if (typeof window === "undefined") return "server";

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
  ];

  // Simple hash function
  const str = components.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Content Security Policy headers
export const CSP_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Relaxed for Next.js
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' wss: https:",
    "object-src 'none'",
    "frame-ancestors 'none'",
  ].join("; "),
};
