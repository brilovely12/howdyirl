import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/me", "/auth", "/onboarding", "/notifications", "/login"] },
    sitemap: "https://howdyirl.com/sitemap.xml",
  };
}
