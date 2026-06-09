import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fileghost.app"),
  title: {
    default: "FileGhost - Remove Hidden Metadata from Photos",
    template: "%s | FileGhost"
  },
  description:
    "FileGhost removes GPS location, camera info, EXIF data, and AI provenance markers from your image files before you post. Free to try. No account needed.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  manifest: "/site.webmanifest",
  keywords: [
    "remove metadata from photos",
    "image metadata remover",
    "strip exif data online",
    "remove gps from photo",
    "clean photo metadata",
    "exif remover",
    "remove c2pa metadata",
    "remove ai metadata from image",
    "xmp metadata remover",
    "iptc metadata cleaner",
    "photo privacy tool",
    "remove metadata before tiktok",
    "strip exif before instagram"
  ],
  authors: [{ name: "FileGhost", url: "https://fileghost.app" }],
  creator: "FileGhost",
  publisher: "FileGhost",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fileghost.app",
    siteName: "FileGhost",
    title: "FileGhost - Remove Hidden Metadata from Photos Before You Post",
    description:
      "Strip GPS location, camera info, EXIF data, and AI provenance markers from your image files. First 5 cleans free. No account needed.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FileGhost - Clean hidden photo metadata before you post"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "FileGhost - Remove Hidden Metadata from Photos",
    description: "Strip GPS, camera info, and hidden file data from your photos before posting. Free to try.",
    images: ["/og-image.png"],
    creator: "@fileghost"
  },
  verification: {
    // Add this value from Google Search Console after verifying the fileghost.app property.
    google: process.env.GOOGLE_SITE_VERIFICATION
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1120"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
