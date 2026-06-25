import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Howdy IRL — Huntsville",
  description:
    "Howdy IRL is a local community board for discovering in-person groups and events in Huntsville, AL.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [counts, navPages] = await Promise.all([listCounts(), getNavPages()]);

  return (
    <html lang="en" className={quicksand.variable}>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-9Y9HD88R5Y" strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-9Y9HD88R5Y');
      `}</Script>
      <body>
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
