import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://fileghost.app"),
  title: {
    default: "FileGhost",
    template: "%s | FileGhost"
  },
  description:
    "Remove hidden metadata from your images, including EXIF, XMP, GPS, editing software tags and C2PA/provenance data. Fast, private, mobile-friendly image cleaner for creators.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
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
  robots: {
    index: true,
    follow: true
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
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
