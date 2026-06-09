/*
MANUAL SEO STEPS REQUIRED AFTER DEPLOYMENT:

1. Google Search Console
   - Go to search.google.com/search-console
   - Add property: fileghost.app
   - Verify via DNS TXT record (preferred) or HTML tag
   - Add verification code to GOOGLE_SITE_VERIFICATION env var
   - Submit sitemap: https://fileghost.app/sitemap.xml
   - Check Coverage report for indexing errors

2. Bing Webmaster Tools
   - Go to bing.com/webmasters
   - Add fileghost.app
   - Submit sitemap

3. Backlink building
   - Submit to alternativeto.net as an alternative to ExifTool
   - Submit to saashub.com
   - Submit to toolify.ai
   - Submit to theresanaiforthat.com
   - Submit to uneed.best
   - Post helpful context on relevant privacy and photography communities
   - Submit to Product Hunt for a DA60+ backlink

4. Google Analytics
   - Set NEXT_PUBLIC_GA_MEASUREMENT_ID in env if analytics are used
   - Verify data is flowing in GA4 Realtime report

5. Validate structured data
   - Test at: https://search.google.com/test/rich-results
   - Test JSON-LD at: https://validator.schema.org/

6. Validate OG image
   - Test at: https://cards-dev.twitter.com/validator
   - Test at: https://developers.facebook.com/tools/debug/

7. Run PageSpeed Insights
   - Test at: https://pagespeed.web.dev/
   - Target: 90+ Performance, 100 SEO
*/

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://fileghost.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: "https://fileghost.app/pricing",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9
    },
    {
      url: "https://fileghost.app/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: "https://fileghost.app/blog/remove-metadata-before-tiktok",
      lastModified: new Date("2025-06-01"),
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: "https://fileghost.app/blog/what-is-c2pa-metadata",
      lastModified: new Date("2025-06-01"),
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: "https://fileghost.app/privacy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3
    }
  ];
}
