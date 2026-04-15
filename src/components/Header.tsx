"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="nav">
      <div className="container">
        <div className="nav-inner">
          {/* Logo */}
          <a href="/" className="nav-logo">
            <div className="nav-logo-icon">P</div>
            <span>PulseMind</span>
          </a>

          {/* Nav Links */}
          <nav className="nav-links">
            <a href="/" className="nav-link">
              资讯
            </a>
            <a href="/docs" className="nav-link">
              技术文档
            </a>
            <a href="/about" className="nav-link">
              关于
            </a>
          </nav>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />

            {status === "loading" ? (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--color-warm-sand)",
                }}
              />
            ) : session ? (
              <div style={{ position: "relative" }} ref={menuRef}>
                {/* User dropdown */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    overflow: "hidden",
                    background: session.user?.image
                      ? `url(${session.user.image})`
                      : "var(--color-warm-sand)",
                    backgroundSize: "cover",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title={session.user?.name || "用户菜单"}
                >
                  {!session.user?.image && (
                    <span style={{ fontSize: 16 }}>
                      {session.user?.name?.[0] || "?"}
                    </span>
                  )}
                </button>

                {/* Dropdown menu */}
                {menuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: 200,
                      background: "var(--color-ivory)",
                      border: "1px solid var(--color-border-cream)",
                      borderRadius: 12,
                      boxShadow: "var(--shadow-lg)",
                      overflow: "hidden",
                      zIndex: 100,
                    }}
                  >
                    {/* User info */}
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom:
                          "1px solid var(--color-border-cream)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "var(--color-near-black)",
                          marginBottom: 2,
                        }}
                      >
                        {session.user?.name || "未设置名称"}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--color-stone-gray)",
                        }}
                      >
                        {session.user?.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: 8 }}>
                      <Link
                        href="/settings"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          fontSize: 14,
                          color: "var(--color-charcoal-warm)",
                          borderRadius: 8,
                        }}
                      >
                        <span>⚙️</span>
                        设置
                      </Link>

                      {(session.user as { role?: string })?.role ===
                        "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 12px",
                            fontSize: 14,
                            color: "var(--color-terracotta)",
                            borderRadius: 8,
                          }}
                        >
                          <span>📝</span>
                          管理后台
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          fontSize: 14,
                          color: "var(--color-error)",
                          background: "none",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span>🚪</span>
                        退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                style={{
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  background: "var(--color-near-black)",
                  color: "var(--color-ivory)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
