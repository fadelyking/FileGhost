import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app", "/dashboard", "/account", "/login", "/signup", "/admin", "/auth/", "/api/"]
      }
    ],
    sitemap: "https://fileghost.app/sitemap.xml"
  };
}
