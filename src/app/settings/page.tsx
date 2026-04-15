"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setMessage({ type: "success", text: "用户名已更新" });
    } catch (err) {
      setMessage({ type: "error", text: "更新失败，请重试" });
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        加载中...
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            color: "var(--color-olive-gray)",
            marginBottom: 16,
          }}
        >
          ← 返回首页
        </Link>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 28,
            fontWeight: 500,
            color: "var(--color-near-black)",
          }}
        >
          个人设置
        </h1>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ padding: 32 }}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--color-near-black)",
            marginBottom: 24,
          }}
        >
          个人信息
        </h2>

        {/* Avatar & GitHub link */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 16,
            background: "var(--color-warm-sand)",
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
              }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--color-terracotta)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "white",
                fontWeight: 600,
              }}
            >
              {session.user?.name?.[0] || "?"}
            </div>
          )}
          <div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "var(--color-near-black)",
                marginBottom: 4,
              }}
            >
              {session.user?.name || "未设置用户名"}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-stone-gray)",
              }}
            >
              通过 GitHub 登录
            </p>
          </div>
        </div>

        {/* Name form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--color-olive-gray)",
                marginBottom: 8,
              }}
            >
              显示名称（评论时使用）
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="输入你在博客显示的名称"
              maxLength={50}
            />
            <p
              style={{
                fontSize: 12,
                color: "var(--color-stone-gray)",
                marginTop: 6,
              }}
            >
              这个名称会在你发表评论时显示
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                background:
                  message.type === "success"
                    ? "rgba(5, 150, 105, 0.1)"
                    : "rgba(181, 51, 51, 0.1)",
                color:
                  message.type === "success"
                    ? "var(--color-success)"
                    : "var(--color-error)",
                fontSize: 14,
              }}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || name === session.user?.name}
          >
            {saving ? "保存中..." : "保存更改"}
          </button>
        </form>
      </div>

      {/* Role info (for admins) */}
      {(session.user as { role?: string })?.role === "admin" && (
        <div
          className="card"
          style={{
            padding: 32,
            marginTop: 24,
            border: "1px solid var(--color-terracotta)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 20 }}>👑</span>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--color-terracotta)",
              }}
            >
              管理员权限
            </h2>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-olive-gray)",
              marginBottom: 16,
            }}
          >
            你拥有管理员权限，可以发布、编辑和删除文章。
          </p>
          <Link href="/admin" className="btn btn-primary">
            进入管理后台
          </Link>
        </div>
      )}
    </div>
  );
}
