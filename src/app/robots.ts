import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/me",
        "/auth",
        "/onboarding",
        "/notifications",
        "/login",
        // Every canonical page is query-free (all detail pages are in the
        // sitemap). Filter/search/sort params create a combinatorial URL
        // space that AI crawlers were walking millions of times a day.
        "/*?",
      ],
    },
    sitemap: "https://howdyirl.com/sitemap.xml",
  };
}
