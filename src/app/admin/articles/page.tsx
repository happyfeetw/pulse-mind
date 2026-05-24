"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  source: string | null;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const categoryLabels: Record<string, string> = {
  ai: "AI/ML",
  backend: "后端",
  frontend: "前端",
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/api/articles?limit=100";
      if (filter === "published") url += "&published=true";
      if (filter === "draft") url += "&published=false";

      const res = await fetch(url);
      const data = await res.json();
      setArticles(data.articles || []);
      setError(null);
    } catch {
      setError("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这篇文章吗？")) return;

    try {
      await fetch(`/api/articles/${id}`, { method: "DELETE" });
      fetchArticles();
    } catch {
      alert("删除失败");
    }
  };

  const togglePublish = async (article: Article) => {
    try {
      await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !article.published }),
      });
      fetchArticles();
    } catch {
      alert("操作失败");
    }
  };

  const filteredArticles = articles.filter((article) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 28,
            fontWeight: 500,
            color: "var(--color-near-black)",
          }}
        >
          文章管理
        </h1>
        <Link href="/admin/articles/new" className="btn btn-primary">
          新建文章
        </Link>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <svg
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-stone-gray)",
            }}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: 40 }}
          />
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "全部" : f === "published" ? "已发布" : "草稿"}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            padding: 16,
            background: "rgba(181, 51, 51, 0.1)",
            borderRadius: 12,
            color: "var(--color-error)",
            marginBottom: 24,
          }}
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--color-stone-gray)" }}>
          加载中...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            background: "var(--color-ivory)",
            borderRadius: 16,
            border: "1px solid var(--color-border-cream)",
          }}
        >
          <p style={{ color: "var(--color-stone-gray)", marginBottom: 16 }}>
            还没有文章
          </p>
          <Link href="/admin/articles/new" className="btn btn-primary">
            创建第一篇文章
          </Link>
        </div>
      ) : (
        /* Articles Table */
        <div
          className="card"
          style={{ padding: 0, overflow: "hidden" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "var(--color-warm-sand)",
                  borderBottom: "1px solid var(--color-border-cream)",
                }}
              >
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-olive-gray)",
                  }}
                >
                  标题
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-olive-gray)",
                    width: 100,
                  }}
                >
                  分类
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-olive-gray)",
                    width: 100,
                  }}
                >
                  状态
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-olive-gray)",
                    width: 120,
                  }}
                >
                  日期
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-olive-gray)",
                    width: 160,
                  }}
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr
                  key={article.id}
                  style={{
                    borderBottom: "1px solid var(--color-border-cream)",
                  }}
                >
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: 500, color: "var(--color-near-black)", marginBottom: 4 }}>
                      {article.title}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--color-stone-gray)" }}>
                      {article.summary.slice(0, 50)}...
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span className="badge">
                      {categoryLabels[article.category] || article.category}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <button
                      onClick={() => togglePublish(article)}
                      style={{
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: 999,
                        border: "none",
                        cursor: "pointer",
                        background: article.published
                          ? "rgba(5, 150, 105, 0.1)"
                          : "var(--color-warm-sand)",
                        color: article.published
                          ? "var(--color-success)"
                          : "var(--color-olive-gray)",
                      }}
                    >
                      {article.published ? "已发布" : "草稿"}
                    </button>
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontSize: 13,
                      color: "var(--color-stone-gray)",
                    }}
                  >
                    {new Date(article.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Link
                        href={`/admin/articles/${article.id}`}
                        style={{
                          padding: "6px 12px",
                          fontSize: 13,
                          fontWeight: 500,
                          borderRadius: 6,
                          background: "var(--color-warm-sand)",
                          color: "var(--color-charcoal-warm)",
                        }}
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        style={{
                          padding: "6px 12px",
                          fontSize: 13,
                          fontWeight: 500,
                          borderRadius: 6,
                          background: "rgba(181, 51, 51, 0.1)",
                          color: "var(--color-error)",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
