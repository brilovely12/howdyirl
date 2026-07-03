import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = await getPage((await params).slug);
  if (!page) return {};
  return {
    title: page.title,
    description: `${page.title} — Howdy IRL`,
    alternates: { canonical: `/p/${page.slug}` },
  };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div className="detail" style={{ maxWidth: 680 }}>
      <h1 style={{ fontSize: 24, margin: "0 0 14px" }}>{page.title}</h1>
      {/* Body is admin-authored HTML from the CMS. Sanitize once user-authored pages exist. */}
      <div className="pagebody" dangerouslySetInnerHTML={{ __html: page.body }} />
    </div>
  );
}
