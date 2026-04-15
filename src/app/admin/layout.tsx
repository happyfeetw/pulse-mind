"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/articles", label: "文章", icon: "📝" },
  { href: "/admin", label: "概览", icon: "📊" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-parchment)" }}>
      {/* Admin Header */}
      <header
        style={{
          background: "var(--color-ivory)",
          borderBottom: "1px solid var(--color-border-cream)",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
            maxWidth: 1400,
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                fontWeight: 500,
                color: "var(--color-near-black)",
              }}
            >
              ← 返回前台
            </Link>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                fontWeight: 500,
                color: "var(--color-near-black)",
              }}
            >
              PulseMind Admin
            </span>
          </div>

          <nav style={{ display: "flex", gap: 8 }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  borderRadius: 8,
                  background:
                    pathname === item.href
                      ? "var(--color-warm-sand)"
                      : "transparent",
                  color:
                    pathname === item.href
                      ? "var(--color-near-black)"
                      : "var(--color-olive-gray)",
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Admin Content */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        {children}
      </main>
    </div>
  );
}
