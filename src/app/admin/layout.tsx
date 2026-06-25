import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const tabs = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/comments", label: "Comments" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/forums", label: "Forums" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();
  if (!session?.member?.is_admin) redirect("/groups");

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Admin</h1>
      </div>
      <nav className="admin-tabs" style={{
        display: "flex", gap: 0, borderBottom: "2px solid var(--rule)", marginBottom: 20,
        overflowX: "auto",
      }}>
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            style={{
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              color: "var(--ink-dim)",
              borderBottom: "2px solid transparent",
              marginBottom: -2,
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
