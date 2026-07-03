import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "nrpxtxtrpnqqkrvviqid.supabase.co", pathname: "/storage/**" },
    ],
  },
  async redirects() {
    // Pre-city-prefix URLs live on in bookmarks and search indexes.
    return ["groups", "events", "spots", "forums"].flatMap((section) => [
      { source: `/${section}`, destination: `/huntsville/${section}`, permanent: true },
      { source: `/${section}/:path*`, destination: `/huntsville/${section}/:path*`, permanent: true },
    ]);
  },
};

export default nextConfig;
