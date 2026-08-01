import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AI training crawlers were fetching list pages several times a second
      // (1.6M requests/day). No referral value for a local site — banned.
      // Search crawlers (Googlebot, Bingbot, Applebot, …) remain welcome.
      {
        userAgent: [
          "GPTBot",
          "meta-externalagent",
          "meta-externalfetcher",
          "Amazonbot",
          "Bytespider",
          "PetalBot",
          "CCBot",
          "ClaudeBot",
          "Google-Extended",
          "Applebot-Extended",
        ],
        disallow: "/",
      },
      {
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
          // space crawlers were walking endlessly.
          "/*?",
        ],
      },
    ],
    sitemap: "https://howdyirl.com/sitemap.xml",
  };
}
