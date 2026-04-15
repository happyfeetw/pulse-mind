"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    categories: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/articles?limit=100");
      const data = await res.json();
      const articles = data.articles || [];

      const categories: Record<string, number> = {};
      let published = 0;
      let draft = 0;

      articles.forEach((a: { category: string; published: boolean }) => {
        categories[a.category] = (categories[a.category] || 0) + 1;
        if (a.published) published++;
        else draft++;
      });

      setStats({
        total: articles.length,
        published,
        draft,
        categories,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "文章总数",
      value: stats.total,
      icon: "📝",
      color: "var(--color-terracotta)",
    },
    {
      label: "已发布",
      value: stats.published,
      icon: "✅",
      color: "var(--color-success)",
    },
    {
      label: "草稿",
      value: stats.draft,
      icon: "📋",
      color: "var(--color-olive-gray)",
    },
  ];

  const categoryLabels: Record<string, string> = {
    ai: "AI/ML",
    backend: "后端",
    frontend: "前端",
  };

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 28,
          fontWeight: 500,
          color: "var(--color-near-black)",
          marginBottom: 24,
        }}
      >
        概览
      </h1>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{ padding: 24 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 32 }}>{stat.icon}</span>
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: "var(--color-near-black)",
                fontFamily: "var(--font-serif)",
              }}
            >
              {loading ? "-" : stat.value}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--color-stone-gray)",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--color-near-black)",
            marginBottom: 16,
          }}
        >
          快速操作
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/admin/articles/new" className="btn btn-primary">
            新建文章
          </Link>
          <Link href="/admin/articles" className="btn btn-secondary">
            管理文章
          </Link>
          <Link href="/" className="btn btn-outline">
            查看前台
          </Link>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="card" style={{ padding: 24 }}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--color-near-black)",
            marginBottom: 16,
          }}
        >
          分类统计
        </h2>
        {loading ? (
          <p style={{ color: "var(--color-stone-gray)" }}>加载中...</p>
        ) : Object.keys(stats.categories).length === 0 ? (
          <p style={{ color: "var(--color-stone-gray)" }}>暂无分类数据</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(stats.categories).map(([cat, count]) => (
              <div
                key={cat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "var(--color-warm-sand)",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 14, color: "var(--color-charcoal-warm)" }}>
                  {categoryLabels[cat] || cat}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--color-near-black)",
                  }}
                >
                  {count} 篇
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
