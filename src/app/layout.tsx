import type { Metadata } from "next";
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
