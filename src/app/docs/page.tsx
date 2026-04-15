"use client";

import { useState, useEffect } from "react";
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
}

const categoryLabels: Record<string, string> = {
  ai: "AI/ML",
  backend: "后端",
  frontend: "前端",
};

const categoryIcons: Record<string, string> = {
  ai: "🤖",
  backend: "⚙️",
  frontend: "🎨",
};

export default function DocsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles?published=true&limit=50");
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter((article) => {
    if (selectedCategory !== "all" && article.category !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const categories = [
    { value: "all", label: "全部", count: articles.length },
    ...Object.entries(
      articles.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([value, count]) => ({
      value,
      label: categoryLabels[value] || value,
      count,
    })),
  ];

  return (
    <div style={{ padding: "48px 0 80px" }}>
      <div className="container">
        <div style={{ display: "flex", gap: 48 }}>
          {/* Sidebar */}
          <aside
            style={{
              width: 200,
              flexShrink: 0,
              position: "sticky",
              top: 88,
              alignSelf: "flex-start",
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    fontSize: 14,
                    fontWeight: 500,
                    color:
                      selectedCategory === cat.value
                        ? "var(--color-near-black)"
                        : "var(--color-olive-gray)",
                    background:
                      selectedCategory === cat.value
                        ? "var(--color-white)"
                        : "transparent",
                    border:
                      selectedCategory === cat.value
                        ? "1px solid var(--color-border-cream)"
                        : "1px solid transparent",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    textAlign: "left",
                  }}
                >
                  <span>{categoryIcons[cat.value] || "📚"}</span>
                  <span style={{ flex: 1 }}>{cat.label}</span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--color-stone-gray)",
                      fontWeight: 400,
                    }}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 500,
                  fontSize: 32,
                  color: "var(--color-near-black)",
                  marginBottom: 8,
                }}
              >
                技术文档
              </h1>
              <p style={{ fontSize: 16, color: "var(--color-olive-gray)" }}>
                分享技术实践、架构思考与项目经验
              </p>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 32 }}>
              <svg
                style={{
                  position: "absolute",
                  left: 16,
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
                placeholder="搜索文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ paddingLeft: 48 }}
              />
            </div>

            {/* Articles */}
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 48,
                  color: "var(--color-stone-gray)",
                }}
              >
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
                <p style={{ color: "var(--color-stone-gray)" }}>
                  {searchQuery ? "没有找到匹配的文章" : "暂无文章"}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {filteredArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/docs/${article.slug}`}
                    style={{ display: "block" }}
                  >
                    <article
                      className="card card-interactive"
                      style={{
                        padding: 24,
                        animationDelay: `${index * 0.05}s`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 20,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Meta */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 10,
                            }}
                          >
                            <span
                              style={{
                                padding: "2px 10px",
                                fontSize: 12,
                                fontWeight: 500,
                                borderRadius: 999,
                                background: "rgba(201, 100, 66, 0.1)",
                                color: "var(--color-terracotta)",
                              }}
                            >
                              {categoryLabels[article.category] ||
                                article.category}
                            </span>
                            {article.tags?.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  padding: "2px 8px",
                                  fontSize: 12,
                                  background: "var(--color-warm-sand)",
                                  color: "var(--color-charcoal-warm)",
                                  borderRadius: 4,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Title */}
                          <h2
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontWeight: 500,
                              fontSize: 18,
                              color: "var(--color-near-black)",
                              lineHeight: 1.35,
                              marginBottom: 8,
                            }}
                          >
                            {article.title}
                          </h2>

                          {/* Summary */}
                          <p
                            style={{
                              fontSize: 14,
                              lineHeight: 1.6,
                              color: "var(--color-olive-gray)",
                              marginBottom: 12,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {article.summary}
                          </p>

                          {/* Footer */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              fontSize: 13,
                              color: "var(--color-stone-gray)",
                            }}
                          >
                            <span>{article.source || "原创"}</span>
                            <span
                              style={{
                                width: 3,
                                height: 3,
                                borderRadius: "50%",
                                background: "var(--color-stone-gray)",
                              }}
                            />
                            <span>
                              {new Date(
                                article.createdAt
                              ).toLocaleDateString("zh-CN")}
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "var(--color-warm-sand)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--color-olive-gray)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
