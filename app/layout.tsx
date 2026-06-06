import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Image Metadata Remover | Strip EXIF, C2PA & Hidden Photo Data",
    template: "%s | FileGhost"
  },
  description:
    "Remove hidden metadata from your images, including EXIF, XMP, GPS, editing software tags and C2PA/provenance data. Fast, private, mobile-friendly image cleaner for creators.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.svg"
  },
  keywords: [
    "image metadata remover",
    "remove image metadata",
    "EXIF remover",
    "C2PA metadata remover",
    "strip photo metadata",
    "remove hidden data from images",
    "clean image metadata",
    "remove GPS from photos",
    "photo privacy tool",
    "creator image cleaner",
    "clean AI generated photos metadata",
    "remove provenance metadata"
  ],
  openGraph: {
    title: "Image Metadata Remover | Strip EXIF, C2PA & Hidden Photo Data",
    description:
      "Clean your images before you post. Remove hidden metadata from photos in seconds.",
    url: "/",
    siteName: "FileGhost",
    type: "website",
    images: [
      {
        url: "https://fileghost.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "FileGhost — Clean hidden photo metadata before you post"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "https://fileghost.app/og-image.png",
        alt: "FileGhost — Remove GPS, camera info, and hidden data from your photos"
      }
    ]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
