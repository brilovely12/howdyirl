import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Quicksand } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import SubNav from "@/components/SubNav";
import Footer from "@/components/Footer";
import { listCounts, getNavPages } from "@/lib/data";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE = "https://howdyirl.com";
const DESC = "Howdy IRL is a local community board for discovering in-person groups, events, and spots in Huntsville, AL.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Howdy IRL — Huntsville", template: "%s — Howdy IRL" },
  description: DESC,
  openGraph: {
    siteName: "Howdy IRL",
    type: "website",
    locale: "en_US",
    url: SITE,
    title: "Howdy IRL — Huntsville",
    description: DESC,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Howdy IRL — Huntsville community board" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Howdy IRL — Huntsville",
    description: DESC,
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [counts, navPages] = await Promise.all([listCounts(), getNavPages()]);

  return (
    <html lang="en" className={quicksand.variable}>
      <body>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-9Y9HD88R5Y" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9Y9HD88R5Y');
        `}</Script>
        <Header />
        <SubNav counts={counts} navPages={navPages} />
        <main>
          <div className="wrap">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
