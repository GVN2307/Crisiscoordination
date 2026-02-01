// Security utilities for SafeZone Crisis Coordination
// Implements input sanitization, rate limiting, EXIF stripping, and image compression

// ===== HTML SANITIZATION (DOMPurify-like implementation) =====
const ALLOWED_TAGS = ["p", "br", "b", "strong", "em", "i", "span"];
const DANGEROUS_ATTRS = ["onclick", "onerror", "onload", "onmouseover", "onfocus", "onblur"];

export function sanitizeHtml(input: string): { sanitized: string; wasSanitized: boolean } {
  if (!input) return { sanitized: "", wasSanitized: false };

  let cleaned = input;
  
  // Remove script tags and content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove style tags and content
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  
  // Remove event handlers
  for (const attr of DANGEROUS_ATTRS) {
    const regex = new RegExp(`\\s*${attr}\\s*=\\s*["'][^"']*["']`, "gi");
    cleaned = cleaned.replace(regex, "");
  }
  
  // Remove javascript: URLs
  cleaned = cleaned.replace(/javascript:/gi, "");
  cleaned = cleaned.replace(/data:/gi, "data-safe:");
  
  // Strip non-allowed tags
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  cleaned = cleaned.replace(tagRegex, (match, tagName) => {
    if (ALLOWED_TAGS.includes(tagName.toLowerCase())) {
      if (match.startsWith("</")) {
        return `</${tagName.toLowerCase()}>`;
      }
      return `<${tagName.toLowerCase()}>`;
    }
    return "";
  });

  return { sanitized: cleaned, wasSanitized: cleaned !== input };
}

// Plain text sanitization
export function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .trim()
    .slice(0, 5000); // Max length limit
}

// ===== RATE LIMITING =====
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const RATE_LIMITS = {
  imageUpload: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  sosBeacon: { maxRequests: 3, windowMs: 15 * 60 * 1000 },
  verification: { maxRequests: 20, windowMs: 5 * 60 * 1000 },
  chatMessage: { maxRequests: 30, windowMs: 60 * 1000 },
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
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now };
}

// ===== EXIF DATA STRIPPING =====
export interface ExifData {
  timestamp?: string;
  gpsLat?: number;
  gpsLng?: number;
  device?: string;
  software?: string;
}

export async function stripExifData(
  imageBlob: Blob
): Promise<{ cleanBlob: Blob; extractedExif: ExifData; wasStripped: boolean }> {
  return new Promise((resolve) => {
    const extractedExif: ExifData = {};
    
    // Create canvas to strip EXIF
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        resolve({ cleanBlob: imageBlob, extractedExif, wasStripped: false });
        return;
      }
      
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image (this strips EXIF)
      ctx.drawImage(img, 0, 0);
      
      // Convert back to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ cleanBlob: blob, extractedExif, wasStripped: true });
          } else {
            resolve({ cleanBlob: imageBlob, extractedExif, wasStripped: false });
          }
        },
        "image/jpeg",
        0.85
      );
    };
    
    img.onerror = () => {
      resolve({ cleanBlob: imageBlob, extractedExif, wasStripped: false });
    };
    
    img.src = URL.createObjectURL(imageBlob);
  });
}

// ===== IMAGE COMPRESSION =====
const MAX_IMAGE_SIZE = 500 * 1024; // 500KB max
const MAX_DIMENSION = 1920;

export async function compressImage(
  imageBlob: Blob
): Promise<{ compressedBlob: Blob; wasCompressed: boolean; originalSize: number; newSize: number }> {
  const originalSize = imageBlob.size;
  
  if (originalSize <= MAX_IMAGE_SIZE) {
    return { compressedBlob: imageBlob, wasCompressed: false, originalSize, newSize: originalSize };
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        resolve({ compressedBlob: imageBlob, wasCompressed: false, originalSize, newSize: originalSize });
        return;
      }
      
      // Calculate new dimensions
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Try different quality levels
      const tryCompress = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ compressedBlob: imageBlob, wasCompressed: false, originalSize, newSize: originalSize });
              return;
            }
            
            if (blob.size <= MAX_IMAGE_SIZE || quality <= 0.3) {
              resolve({ compressedBlob: blob, wasCompressed: true, originalSize, newSize: blob.size });
            } else {
              tryCompress(quality - 0.1);
            }
          },
          "image/jpeg",
          quality
        );
      };
      
      tryCompress(0.8);
    };
    
    img.onerror = () => {
      resolve({ compressedBlob: imageBlob, wasCompressed: false, originalSize, newSize: originalSize });
    };
    
    img.src = URL.createObjectURL(imageBlob);
  });
}

// ===== PROCESS IMAGE (Strip EXIF + Compress) =====
export async function processImageForUpload(
  imageBlob: Blob
): Promise<{
  processedBlob: Blob;
  exifStripped: boolean;
  compressed: boolean;
  originalSize: number;
  finalSize: number;
}> {
  // First strip EXIF
  const { cleanBlob, wasStripped } = await stripExifData(imageBlob);
  
  // Then compress
  const { compressedBlob, wasCompressed, originalSize, newSize } = await compressImage(cleanBlob);
  
  return {
    processedBlob: compressedBlob,
    exifStripped: wasStripped,
    compressed: wasCompressed,
    originalSize,
    finalSize: newSize,
  };
}

// ===== DEVICE FINGERPRINT =====
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

  const str = components.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ===== WEBRTC CONFIG (TURN-ONLY for privacy) =====
export const WEBRTC_CONFIG: RTCConfiguration = {
  iceServers: [
    // TURN-only servers to prevent IP leakage
    // In production, use your own TURN servers
    {
      urls: "turn:turn.safezone.app:443",
      username: "safezone",
      credential: "safezone-turn-credential",
    },
  ],
  iceTransportPolicy: "relay", // TURN-only, no STUN
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "require",
};

// ===== CSP HEADERS =====
export const CSP_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' wss: https:",
    "object-src 'none'",
    "frame-ancestors 'none'",
  ].join("; "),
};
