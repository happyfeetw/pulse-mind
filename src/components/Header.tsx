"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [slowHintVisible, setSlowHintVisible] = useState(false);
  const [loginError, setLoginError] = useState("");
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

  const handleSignIn = async () => {
    if (isSigningIn) {
      return;
    }

    let keepLoading = false;
    setIsSigningIn(true);
    setLoginError("");
    setSlowHintVisible(false);

    const timeoutId = window.setTimeout(() => {
      setSlowHintVisible(true);
    }, 1000);

    try {
      const result = await signIn("github", {
        callbackUrl: `${window.location.origin}/`,
        redirect: false,
      });

      if (result?.ok && result.url) {
        keepLoading = true;
        window.location.href = result.url;
        return;
      }

      setLoginError("GitHub 登录未能启动，请稍后重试");
    } catch {
      setLoginError("网络异常，登录未能启动，请重试");
    } finally {
      if (!keepLoading) {
        window.clearTimeout(timeoutId);
        setSlowHintVisible(false);
        setIsSigningIn(false);
      }
    }
  };

  return (
    <header className="nav">
      <div className="container">
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">P</div>
            <span>PulseMind</span>
          </Link>

          {/* Nav Links */}
          <nav className="nav-links">
            <Link href="/" className="nav-link">
              资讯
            </Link>
            <Link href="/docs" className="nav-link">
              技术文档
            </Link>
            <Link href="/about" className="nav-link">
              关于
            </Link>
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
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                style={{
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  background: "var(--color-near-black)",
                  color: "var(--color-ivory)",
                  border: "none",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  cursor: isSigningIn ? "not-allowed" : "pointer",
                  opacity: isSigningIn ? 0.72 : 1,
                }}
              >
                {isSigningIn ? "登录中..." : "登录"}
              </button>
            )}
          </div>
        </div>
      </div>

      {loginError && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 76,
            right: 24,
            zIndex: 120,
            maxWidth: 280,
            padding: "10px 12px",
            borderRadius: 8,
            background: "var(--color-ivory)",
            border: "1px solid var(--color-border-cream)",
            color: "var(--color-error)",
            fontSize: 13,
            boxShadow: "var(--shadow-md)",
          }}
        >
          {loginError}
        </div>
      )}

      {isSigningIn && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(20, 20, 20, 0.2)",
            backdropFilter: "blur(1.5px)",
            zIndex: 110,
            padding: 24,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 340,
              background: "var(--color-ivory)",
              border: "1px solid var(--color-border-cream)",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 24,
                height: 24,
                margin: "0 auto 10px",
                borderRadius: "50%",
                border: "3px solid var(--color-warm-sand)",
                borderTopColor: "var(--color-terracotta)",
                animation: "pm-spin 0.9s linear infinite",
              }}
            />
            <p
              style={{
                fontSize: 14,
                color: "var(--color-near-black)",
                fontWeight: 500,
              }}
            >
              正在连接 GitHub 登录服务
            </p>
            {slowHintVisible && (
              <p
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "var(--color-olive-gray)",
                }}
              >
                网络较慢时可能需 3-8 秒，请稍候，不要关闭页面
              </p>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pm-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </header>
  );
}
