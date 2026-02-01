import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _inter = Inter({ subsets: ["latin"] });
const _ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SafeZone - Crisis Coordination Platform",
  description:
    "Real-time disaster monitoring and emergency coordination platform. Report emergencies, view live global disaster alerts from GDACS, and get help when you need it most.",
  keywords: ["disaster", "emergency", "crisis", "coordination", "GDACS", "humanitarian", "safety"],
  authors: [{ name: "SafeZone Team" }],
  creator: "SafeZone",
  publisher: "SafeZone",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "SafeZone - Crisis Coordination Platform",
    description: "Real-time disaster monitoring and emergency coordination platform",
    siteName: "SafeZone",
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeZone - Crisis Coordination Platform",
    description: "Real-time disaster monitoring and emergency coordination platform",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
    generator: 'v0.app'
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* RTL support detection script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var rtlLangs = ['ar', 'he', 'fa', 'ur', 'ps', 'sd'];
                var userLang = navigator.language || navigator.userLanguage;
                var langCode = userLang.split('-')[0].toLowerCase();
                if (rtlLangs.includes(langCode)) {
                  document.documentElement.dir = 'rtl';
                  document.documentElement.lang = langCode;
                  document.documentElement.classList.add('rtl');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
